import admin from 'firebase-admin'
const projectId = admin.instanceId().app.options.projectId

// Instantiate a Dialogflow client.
import dialogflow, { protos } from '@google-cloud/dialogflow'
import * as functions from 'firebase-functions'
import { detectBrowser } from './detectBrowser'
import { detectMobile } from './detectMobile'

// For deployment
const sessionClient = new dialogflow.SessionsClient()
export const dialogflowRequest = async (req: functions.https.Request, reqType) => {
  const languageCode = 'en-US'

  if (!req.query || !req.query.query) {
    return 'The "query" parameter is required'
  }

  if (!req.query || !req.query.uuid) {
    return 'The "uuid" parameter is required'
  }

  const query = req.query.query as string
  const sessionId = req.query.uuid as string
  const browser = detectBrowser(req.headers["user-agent"])
  const isMobile = detectMobile(req.headers["user-agent"])

  // The text query request.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  )

  const queryInput: protos.google.cloud.dialogflow.v2.IDetectIntentRequest['queryInput'] = reqType === 'text'
    ? { text: { text: query, languageCode: languageCode } }
    : { event: { name: query, languageCode: languageCode } }

  const dfRequest: protos.google.cloud.dialogflow.v2.IDetectIntentRequest = {
    session: sessionPath,
    queryInput,
    queryParams: {
      payload: {
        fields: {
          browser: {
            stringValue: browser
          },
          isMobile: {
            boolValue: isMobile
          }
        }
      }
    }
  }

  const responses = await sessionClient.detectIntent(dfRequest)

  // Code 0 === Webhook execution successful
  // Code 4 === Webhook call failed. Error: DEADLINE_EXCEEDED.
  // Code 14 === Webhook call failed. Error: UNAVAILABLE.
  if (responses[0].webhookStatus.code !== 0) {
    console.error('Webhook Error', responses[0].webhookStatus.message)
  }

  const response = {
    ...responses[0],
    session: sessionPath
  }

  return response
}
