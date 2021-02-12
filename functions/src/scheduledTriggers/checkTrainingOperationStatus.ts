import dotenv from 'dotenv'
dotenv.config()

export const checkTrainingOperationStatus = async () => {
  const admin = await import('firebase-admin')
  const projectId = admin.instanceId().app.options.projectId
  const db = admin.firestore()

  const automl = await import('@google-cloud/automl')
  const autoMlClient = new automl.v1.AutoMlClient()

  // Support for only CSE machine learning at the moment
  const subjectMatter = 'cse'

  // Determine if model is currently being trained.
  const subjectMatterRef = db.collection('subjectMatters').doc(subjectMatter)
  const subjectMatterDoc = await subjectMatterRef.get()
  const autoMlSettings = subjectMatterDoc.data()

  if (autoMlSettings.isTrainingProcessing && autoMlSettings.trainingOperationName) {
    console.log('Checking model creation status for', autoMlSettings.trainingModelName)
    const operationStatus = await autoMlClient.checkCreateModelProgress(autoMlSettings.trainingOperationName)
    console.log('Model training operation status: ', operationStatus.done)
    if (operationStatus.done === true) {
      console.log('Modeling training complete. Deploying model.')
      const [models] = await autoMlClient.listModels({ parent: autoMlClient.locationPath(projectId, autoMlSettings.location) })
      const catModel = models.find(model => {
        return model.displayName === autoMlSettings.trainingModelName
      })
      const [deploymentOperation] = await autoMlClient.deployModel({ name: catModel.name })

      console.log('Model deployment operation started', deploymentOperation.name)

      await subjectMatterRef
        .update(<any>{
          categoryModelTrained: true,
          isTrainingProcessing: false,
          trainingFinished: admin.firestore.Timestamp.now(),
          trainingOperationName: '',
          trainingModelName: '',
          isDeploying: true,
          deploymentOperationName: deploymentOperation.name,
          deployingModelName: autoMlSettings.trainingModelName,
          deploymentStarted: admin.firestore.Timestamp.now(),
        }, { merge: true })
    } else {
      console.log('Modeling training in progress. Skipping deploy model.')
    }
  }
}