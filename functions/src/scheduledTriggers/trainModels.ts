import dotenv from 'dotenv'
dotenv.config()

const trainSubjectMatterModel = async (admin, projectId, automl, store, subjectMatter) => {
  const snap = await store
    .collection(`/subjectMatters/${subjectMatter}/queriesForTraining/`)
    .where('occurrences', '>=', 10)
    .where('categoryModelTrained', '==', false)
    .get()

  const queriesToTrain = snap.size
  console.log(`Identified ${queriesToTrain} queries to train.`)

  if (queriesToTrain > 0) {
    console.log('AutoML Model Training Triggers. Queries for training: ', queriesToTrain)
    // Instantiate autoML client  
    const client = new automl.v1.AutoMlClient()

    // Train the model
    const [isTraining, trainingModelName] = await trainCategoryModel(store, admin, client, projectId, subjectMatter)

    if (isTraining) {
      console.log('Training has been initiated for model: ', trainingModelName)
      // Update training status in individual queries
      const docUpdatePromises = []

      // Opting to indicate phrases were trained despite training in progress.
      // The model name that trained the phrase is now recoded in case manual clean-up is required
      // This is to prevent repeat triggering of model trainig if training is erroring and not noticed as training is expensive
      snap.forEach(async doc => {
        docUpdatePromises.push(store
          .collection(`/subjectMatters/${subjectMatter}/queriesForTraining`)
          .doc(doc.id)
          .update(<any>{
            categoryModelTrained: true,
            trainedInModel: trainingModelName || '',
            trainedOn: admin.firestore.Timestamp.now(),
          }, { merge: true }))
      })
      await Promise.all(docUpdatePromises)
    } else {
      console.error('Failed to trigger training')
    }
  } else {
    console.log('Training was skipped.')
  }
}

/**
 * Trigger training weekly
 **/
export const trainModels = async () => {
  const admin = await import('firebase-admin')
  const projectId = admin.instanceId().app.options.projectId
  const automl = await import('@google-cloud/automl')
  const store = admin.firestore()

  // Only CSE for now.
  const subjectMatters = ['cse']
  const trainings = []
  subjectMatters.forEach(subjectMatter => {
    trainings.push(trainSubjectMatterModel(admin, projectId, automl, store, subjectMatter))
  })

  await Promise.all(trainings)
}

// --------------------------------  TRAIN CATEGORY MODEL  --------------------------------

/**
 * Train Category Model
 * @param {*} intent
 */
async function trainCategoryModel(store, admin, client, projectId, subjectMatter) {
  const { format } = await import('date-fns')

  const autoMlSettings = (await store.collection('subjectMatters').doc(subjectMatter).get()).data()
  const datasetId = autoMlSettings.dataset
  const date = format(new Date(), 'MM_dd_yyyy')
  const modelName = `mdhs_${subjectMatter}_${date}`

  const projectLocation = client.locationPath(projectId, autoMlSettings.location)

  // Set model name and model metadata for the dataset.
  const modelData = {
    displayName: modelName,
    datasetId: datasetId,
    textClassificationModelMetadata: {},
  }

  // Create a model with the model metadata in the region.
  try {
    const [operation] = await client.createModel({
      parent: projectLocation,
      model: modelData,
    })

    console.log('Model training operation started: ', operation.name)

    // Update training status in db
    await store
      .collection('subjectMatters')
      .doc(subjectMatter)
      .update({
        isTrainingProcessing: true,
        trainingStarted: admin.firestore.Timestamp.now(),
        trainingOperationName: operation.name,
        trainingModelName: modelName
      })

    return [true, modelName]
  } catch (err) {
    console.error(err.message, err)

    await store
      .collection('subjectMatters')
      .doc(subjectMatter)
      .update({
        isTrainingProcessing: false,
        trainingOperationName: '',
        trainingModelName: '',
      })

    return [false, '']
  }
}
