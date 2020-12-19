require('dotenv').config()
const admin = require('firebase-admin')
const { categoriesWithIntents } = require('./mlCategories')
const dialogflow = require('@google-cloud/dialogflow')

const app = admin.initializeApp()
const projectId = app.options.credential.projectId
const db = admin.firestore()

// Populates Firestore with all the ML categories found in ./mlCategories.json
const populateMLCategoriesCollection = async () => {
  const categories = []

  const snapshot = await db.collection('mlCategories').get()

  const allMLCategoriesInDB = snapshot.docs.map(doc => doc.id)

  const mlCategoriesUpdated = []

  for (const category in categoriesWithIntents) {
    const dataForDocument = [category, categoriesWithIntents[category]]
    categories.push(dataForDocument)
  }

  for (const i in categories) {
    console.log('Saving category:', categories[i][0])

    mlCategoriesUpdated.push(categories[i][0])

    await db
      .collection('mlCategories')
      .doc(categories[i][0])
      .set(categories[i][1])

    console.log(`Saved category: ${categories[i][0]}`)
  }

  // Identify which ml categories exist in the DB but where not updated. If it was not updated
  // it's because it doesn't exist in SC, so we need to delete it.
  const mlCategoriesNotUpdated = allMLCategoriesInDB.filter(x => !mlCategoriesUpdated.includes(x))

  for (const i in mlCategoriesNotUpdated) {
    await db.collection('mlCategories').doc(mlCategoriesNotUpdated[i]).delete()

    console.log('Deleted mlCategory: ', mlCategoriesNotUpdated[i])
  }
}

// Populates the firestore categories with their respective intents from dialogflow
const populateIntentsCollection = async () => {
  const intentsClient = new dialogflow.IntentsClient()

  // // The path to identify the agent that owns the intents.
  const projectAgentPath = intentsClient.agentPath(projectId)

  const request = {
    parent: projectAgentPath,
    languageCode: 'en',
    intentView: 'INTENT_VIEW_FULL',
  }

  let intents = []

  // Send the request for listing intents.
  const responses = await intentsClient.listIntents(request)

  console.log('Retrieved intents')

  const resources = responses[0]

  resources.forEach(intent => {
    const intentData = {
      intentName: intent.displayName
    }

    const dataForDocument = [intent.displayName, intentData]

    intents.push(dataForDocument)
  })

  const snapshot = await db.collection('intents').get()

  const allIntentsInDB = snapshot.docs.map(doc => doc.id)

  const intentsUpdated = []

  for (const i in intents) {
    console.log(`Saving intent: ${intents[i]}`)

    intentsUpdated.push(intents[i][0])

    await db
      .collection('intents')
      .doc(intents[i][0])
      .set(intents[i][1])

    console.log(`Saved intent: ${intents[i]}`)
  }

  // Identify which intents exist in the DB but where not updated. If it was not updated
  // it's because it doesn't exist in SC, so we need to delete it.
  const intentsNotUpdated = allIntentsInDB.filter(x => !intentsUpdated.includes(x))

  for (const i in intentsNotUpdated) {
    await db.collection('intents').doc(intentsNotUpdated[i]).delete()

    console.log('Deleted intent: ', intentsNotUpdated[i])
  }
}

const populateFirestore = async () => {
  try {
    await populateMLCategoriesCollection()
    await populateIntentsCollection()
  } catch (e) {
    console.error(e)
    process.exitCode = 1
  }
}

populateFirestore() 