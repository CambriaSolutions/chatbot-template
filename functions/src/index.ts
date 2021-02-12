import dotenv from 'dotenv'
dotenv.config()
import * as functions from 'firebase-functions'
import admin from 'firebase-admin'
admin.initializeApp()
import cors from 'cors'
const _cors = cors({
  origin: true
})

// Register HTTP Triggers
import { dialogflowFirebaseFulfillment } from './httpTriggers/dialogflowFirebaseFulfillment'
import { eventRequest } from './httpTriggers/eventRequest'
import { reportError } from './httpTriggers/reportError'
import { textRequest } from './httpTriggers/textRequest'
import { downloadExport } from './httpTriggers/downloadExport'
import { storeFeedback } from './httpTriggers/storeFeedback'

// Database Triggers
import { trainAgent } from './databaseTriggers/trainAgent'
import { storeAnalytics } from './databaseTriggers/storeAnalytics'

// Scheduled Triggers
import { importDataset } from './scheduledTriggers/importDataset'
import { trainModels } from './scheduledTriggers/trainModels'
import { healthCheck } from './scheduledTriggers/healthCheck'
import { coldStartFulfillment } from './scheduledTriggers/coldStartFulfillment'
import { exportBackup } from './scheduledTriggers/exportBackup'


import { checkTrainingOperationStatus } from './scheduledTriggers/checkTrainingOperationStatus'
import { checkDeploymentOperationStatus } from './scheduledTriggers/checkDeploymentOperationStatus'


const runtimeOpts: functions.RuntimeOptions = {
  timeoutSeconds: 300,
  memory: '2GB',
}

// Http Triggers
const httpTriggers = {
  dialogflowFirebaseFulfillment: { handler: dialogflowFirebaseFulfillment, corsEnabled: false },
  eventRequest: { handler: eventRequest, corsEnabled: true },
  reportError: { handler: reportError, corsEnabled: true },
  textRequest: { handler: textRequest, corsEnabled: true },
  downloadExport: { handler: downloadExport, corsEnabled: true },
  storeFeedback: { handler: storeFeedback, corsEnabled: true },
}

// Database Triggers
const databaseTriggers = {
  trainAgent: { event: 'onUpdate', path: '/subjectMatters/{subjectMatter}/queriesForTraining/{id}', handler: trainAgent },
  storeAnalytics: { event: 'onCreate', path: '/subjectMatters/{subjectMatter}/requests/{id}', handler: storeAnalytics },
}

// Scheduled Triggers
const scheduledTriggers = {
  importDataset: { schedule: '0 20 * * *', timezone: 'America/Los_Angeles', handler: importDataset },
  trainModels: { schedule: '0 21 * * 1', timezone: 'America/Los_Angeles', handler: trainModels }, // Every Monday at 1 AM CST
  checkTrainingOperationStatus: { schedule: '0 */6 * * *', timezone: 'America/Los_Angeles', handler: checkTrainingOperationStatus }, // At minute 0 past every 6th hour.
  checkDeploymentOperationStatus: { schedule: '30 */6 * * *', timezone: 'America/Los_Angeles', handler: checkDeploymentOperationStatus }, // At minute 30 past every 6th hour. (In case training completed, give deployment at least 30 mins)
  healthCheck: { schedule: '0 1 * * *', timezone: 'America/Los_Angeles', handler: healthCheck }, // every day 1 AM PST
  coldStartFulfillment: { schedule: '*/5 * * * *', timezone: 'America/Los_Angeles', handler: coldStartFulfillment }, // every 5 minutes
  exportBackup: { schedule: '0 1 * * *', timezone: 'America/Los_Angeles', handler: exportBackup }, // every day 1 AM PST
}

const httpTriggerWrapper = async (handler, corsEnabled, req, res) => {
  try {
    if (corsEnabled) {
      return _cors(req, res, () => { handler(req, res) })
    } else {
      return handler(req, res)
    }
  } catch (e) {
    console.error(e.message, e)
  }
}

Object.entries(httpTriggers).forEach(([triggerName, httpTrigger]) => {
  exports[triggerName] = functions
    .runWith(runtimeOpts)
    .https
    .onRequest(async (req, res) => httpTriggerWrapper(httpTrigger.handler, httpTrigger.corsEnabled, req, res))
})

// Register Database Triggers
const databaseTriggerWrapper = async (handler, doc, context) => {
  try {
    return handler(doc, context)
  } catch (e) {
    console.error(e.message, e)
  }
}

Object.entries(databaseTriggers).forEach(([triggerName, databaseTrigger]) => {
  const document = functions.runWith(runtimeOpts).firestore.document(databaseTrigger.path)

  let cloudFunction
  if (databaseTrigger.event === 'onCreate') {
    cloudFunction = document.onCreate(async (snapshot, context) => databaseTriggerWrapper(databaseTrigger.handler, snapshot, context))
  } else if (databaseTrigger.event === 'onUpdate') {
    cloudFunction = document.onUpdate(async (change, context) => databaseTriggerWrapper(databaseTrigger.handler, change, context))
  } else if (databaseTrigger.event === 'onWrite') {
    cloudFunction = document.onWrite(async (change, context) => databaseTriggerWrapper(databaseTrigger.handler, change, context))
  } else if (databaseTrigger.event === 'onDelete') {
    cloudFunction = document.onDelete(async (snapshot, context) => databaseTriggerWrapper(databaseTrigger.handler, snapshot, context))
  } else {
    console.error('Unknown event type for database trigger')
  }

  if (cloudFunction) {
    exports[triggerName] = cloudFunction
  }
})

// Register Scheduled Triggers
const scheduledTriggerWrapper = (handler, context) => {
  try {
    return handler(context)
  } catch (e) {
    console.error(e.message, e)
  }
}

Object.entries(scheduledTriggers).forEach(([triggerName, scheduledTrigger]) => {
  exports[triggerName] = functions
    .runWith(runtimeOpts)
    .pubsub
    .schedule(scheduledTrigger.schedule)
    .timeZone(scheduledTrigger.timezone)
    .onRun(async (context) => scheduledTriggerWrapper(scheduledTrigger.handler, context))
})