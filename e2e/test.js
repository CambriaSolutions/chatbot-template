require('dotenv').config()
const request = require('request')
const keyFile = require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
const parseIntentDataFromExcelDocument = require('./parseIntentDataFromExcelDocument')
const admin = require('firebase-admin')
admin.initializeApp()
const db = admin.firestore()
const dialogflow = require('dialogflow')
const projectId = keyFile.project_id
const { v4: uuidv4 } = require('uuid')

require('chai').should()

const ask = require("./ask.js");

const sessionClient = new dialogflow.SessionsClient();
const sessions = {}

const startSessionsAndPreloadContexts = async (intents) => {
  const promises = []
  Object.entries(intents).forEach(([intentName, intentData]) => {
    intentData.trainingPhrases.forEach(phrase => {
      const sessionId = uuidv4();
      sessions[intentName + "::" + phrase] = sessionId
      promises.push(db.collection('preloadedContexts').doc(sessionId).set({
        contexts: intentData.inputContexts
      }))
    })
  })

  await Promise.all(promises)
}

const askGen = async (intentName, phrase, intentData) => {
  it(`Gen should reply with the [${intentName}] intent when asked [${phrase}] with input contexts [${intentData.inputContexts}]`, async () => {
    const sessionId = sessions[intentName + "::" + phrase]
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);
    if (intentData.inputContexts.length > 0) {
      await ask(sessionClient, sessionPath, 'set-context');
    }

    const reply = await ask(sessionClient, sessionPath, phrase);
    // const reply = 'this is the reply'
    reply.intent.should.equal(intentName)
  })
}

describe('Gen Regression Testing', async () => {
  const intents = parseIntentDataFromExcelDocument('./Master spreadsheet.xlsx', 'intent_context_content')

  before(async () => {
    console.log('Preloading...')
    await startSessionsAndPreloadContexts(intents)
  })

  describe('Running tests', async () => {
    Object.entries(intents).forEach(([intentName, intentData]) => {
      intentData.trainingPhrases.forEach(phrase => {
        askGen(intentName, phrase, intentData)
      })
    })
  })
})
