import dotenv from 'dotenv'
dotenv.config()

export const checkDeploymentOperationStatus = async () => {
  const admin = await import('firebase-admin')
  const projectId = admin.instanceId().app.options.projectId
  const db = admin.firestore()

  const automl = await import('@google-cloud/automl')
  const autoMlClient = new automl.v1.AutoMlClient()

  // Support for only CSE machine learning at the moment
  const subjectMatter = 'cse'

  // Determine if model is currently being deployed.
  const subjectMatterRef = db.collection('subjectMatters').doc(subjectMatter)
  const subjectMatterDoc = await subjectMatterRef.get()
  const autoMlSettings = subjectMatterDoc.data()

  if (autoMlSettings.isDeploying && autoMlSettings.deploymentOperationName) {
    console.log('Checking model deployment status for', autoMlSettings.deployingModelName)
    const operationStatus = await autoMlClient.checkDeployModelProgress(autoMlSettings.deploymentOperationName)
    console.log('Model deployment operation status: ', operationStatus.done)
    if (operationStatus.done === true) {
      console.log('Modeling deployment complete. Activating model.')
      const [models] = await autoMlClient.listModels({ parent: autoMlClient.locationPath(projectId, autoMlSettings.location) })
      const catModel = models.find(model => {
        return model.displayName === autoMlSettings.deployingModelName
      })
      if (catModel.deploymentState === 'DEPLOYED') {
        const catModelId = catModel.name.split('/').pop()
        console.log('Deployment complete. Activating model: ', autoMlSettings.deployingModelName, catModelId)

        await subjectMatterRef
          .update(<any>{
            isDeploying: false,
            deploymentOperationName: '',
            deployingModelName: '',
            deploymentFinished: admin.firestore.Timestamp.now(),
            catModel: catModelId // Updating the model ID is analogous to activating the model
          }, { merge: true })
      } else {
        console.error('Deployment operation finished but model not deployed', autoMlSettings.deploymentOperationName, autoMlSettings.deployingModelName)
      }
    } else {
      console.log('Modeling deployment in progress. Skipping activating model.')
    }
  }
}