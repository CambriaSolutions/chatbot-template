import dotenv from 'dotenv'
dotenv.config()

const exportingFirestore = async (projectId, bucket) => {
  const firestore = await import('@google-cloud/firestore')
  const firestoreClient = new firestore.v1.FirestoreAdminClient()

  const firestoreBucket = `${bucket}/firestore`
  const databaseName = firestoreClient.databasePath(projectId, '(default)')
  const responses = await firestoreClient.exportDocuments({
    name: databaseName,
    outputUriPrefix: firestoreBucket,
    // Leave collectionIds empty to export all collections
    // or set to a list of collection IDs to export,
    // collectionIds: ['users', 'posts']
    collectionIds: []
  })

  const response = responses[0]
  console.log(`Firestore Operation Name: ${response['name']}`)
}

const exportingDialogflow = async (projectId, bucket) => {
  const dialogflow = await import('@google-cloud/dialogflow')
  const dialogflowClient = new dialogflow.v2.AgentsClient()

  const dialogflowBucket = `${bucket}/dialogflow.zip`
  console.log('Exporting to: ', dialogflowBucket)
  const responses = await dialogflowClient.exportAgent({ parent: `projects/${projectId}`, 'agentUri': dialogflowBucket })

  const response = responses[0]
  console.log(`Dialogflow Operation Name: ${response['name']}`)
}

export const exportBackup = async () => {
  try {
    const { format } = await import('date-fns')
    const admin = await import('firebase-admin')
    const projectId = admin.instanceId().app.options.projectId


    const dateKey = format(new Date(), 'MM-dd-yyyy')
    const bucket = `gs://${projectId}.appspot.com/backups/${dateKey}`

    await Promise.all([
      exportingFirestore(projectId, bucket),
      exportingDialogflow(projectId, bucket)
    ])

    console.log(`Backups initiated for ${dateKey}`)
  } catch (err) {
    console.error(err.message, err)
  }
}
