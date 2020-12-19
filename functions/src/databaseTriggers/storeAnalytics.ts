// Date FNS imports
import format from 'date-fns/format'
import addHours from 'date-fns/addHours'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import isSameDay from 'date-fns/isSameDay'

// Subject Matter Default Settings
const SUBJECT_MATTER_DEFAULT_PRIMARY_COLOR = '#6497AD'
const SUBJECT_MATTER_DEFAULT_TIMEZONE = {
  name: '(UTC-07:00) Pacific Time (US & Canada)',
  offset: -7,
}

const fallbackIntents = ['Default Fallback Intent']

// Regex to retrieve text after last "/" on a path
const getIdFromPath = path => /[^/]*$/.exec(path)[0]

const getDateWithSubjectMatterTimezone = timezoneOffset => {
  const currDate = new Date()
  // Get the timezone offset from local time in minutes
  const tzDifference = timezoneOffset * 60 + currDate.getTimezoneOffset()
  // Convert the offset to milliseconds, add to targetTime, and make a new Date
  return new Date(currDate.getTime() + tzDifference * 60 * 1000)
}

const getSubjectMatterSettings = async (store, subjectMatterName) => {
  const settingsRef = store.collection('settings').doc(subjectMatterName)
  const doc = await settingsRef.get()

  // If setting doesn't exist, add new subject matter setting with default values
  if (!doc.exists) {
    const defaultSettings = {
      primaryColor: SUBJECT_MATTER_DEFAULT_PRIMARY_COLOR,
      timezone: SUBJECT_MATTER_DEFAULT_TIMEZONE,
    }
    await settingsRef.set(defaultSettings)
    return defaultSettings
  } else {
    return doc.data()
  }
}

// Aggregate & clean up request data
const aggregateRequest = async (admin, store, context, reqData, conversationId, intent) => {
  const aggregateData = {
    conversationId,
    createdAt: admin.firestore.Timestamp.now(),
    language: reqData.queryResult.languageCode,
    intentId: intent.id,
    intentName: intent.name,
    intentDetectionConfidence: reqData.queryResult.intentDetectionConfidence,
    messageText: reqData.queryResult.queryText,
  }

  await store.collection(`${context}/aggregate/${conversationId}/requests`).add(aggregateData)
}

// Metrics:
// - Store intent from conversation & increase occurrences in metric
// - Store support request submitted & increase occurrences
const storeMetrics = async (
  admin,
  store,
  context,
  conversationId,
  currIntent,
  timezoneOffset,
  newConversation,
  newConversationDuration,
  previousConversationDuration,
  newConversationFirstDuration,
  shouldCalculateDuration,
  isFallbackIntent,
  fallbackTriggeringQuery,
  browser,
  isMobile
) => {
  const currentDate = getDateWithSubjectMatterTimezone(timezoneOffset)
  const dateKey = format(currentDate, 'MM-dd-yyyy')

  const metricsRef = store.collection(`${context}/metrics`).doc(dateKey)
  const metricsDoc = await metricsRef.get()
  if (metricsDoc.exists) {
    const currMetric = metricsDoc.data()
    const updatedMetrics = {} as any

    // Update number of conversations and number of
    // conversations with durations
    let numConversations = currMetric.numConversations

    let numConversationsWithDuration =
      currMetric.numConversationsWithDuration
    const oldNumConversations = currMetric.numConversationsWithDuration

    if (newConversationFirstDuration) {
      // The conversation contains a duration
      numConversationsWithDuration += 1
      updatedMetrics.numConversationsWithDuration = numConversationsWithDuration
    }

    if (newConversation && !newConversationDuration) {
      // This is a new conversation, but doesn't have a duration yet
      numConversations += 1
      updatedMetrics.numConversations = numConversations

      updatedMetrics.userBrowsers = {
        ...(currMetric.userBrowsers),
        [browser]: currMetric.userBrowsers && currMetric.userBrowsers[browser] ? currMetric.userBrowsers[browser] + 1 : 1
      }

      if (isMobile) {
        updatedMetrics.mobileConversations = currMetric.mobileConversations ? currMetric.mobileConversations + 1 : 1
        updatedMetrics.nonMobileConversations = currMetric.nonMobileConversations ? currMetric.nonMobileConversations : 0
      } else {
        updatedMetrics.mobileConversations = currMetric.mobileConversations ? currMetric.mobileConversations : 0
        updatedMetrics.nonMobileConversations = currMetric.nonMobileConversations ? currMetric.nonMobileConversations + 1 : 1
      }
    } else {
      updatedMetrics.mobileConversations = currMetric.mobileConversations ? currMetric.mobileConversations : 0
      updatedMetrics.nonMobileConversations = currMetric.nonMobileConversations ? currMetric.nonMobileConversations : 0
      updatedMetrics.userBrowsers = currMetric.userBrowsers ? currMetric.userBrowsers : 0
    }

    // Update average conversation duration
    // A conversation has a duration i.e. more than one request per conversationId
    if (newConversationDuration > 0 && shouldCalculateDuration) {
      let newAverageDuration = 0
      const currAvD = currMetric.averageConversationDuration
      // This is not the first conversation of the day
      if (numConversations > 1 && numConversationsWithDuration > 0) {
        // This is a new conversation, or this is the first duration
        if (newConversation || newConversationFirstDuration) {
          newAverageDuration =
            (currAvD * oldNumConversations + newConversationDuration) /
            numConversationsWithDuration
        } else {
          // This is a continuing conversation, that has already undergone the
          // calculation above
          newAverageDuration =
            (currAvD * oldNumConversations +
              (newConversationDuration - previousConversationDuration)) /
            numConversationsWithDuration
        }
      } else {
        // This is the first conversation of the day
        newAverageDuration = newConversationDuration
      }
      // Update the average conversations of the day
      updatedMetrics.averageConversationDuration = newAverageDuration
    }

    // Update the last intent based on conversationId
    const currentExitIntentsCollection = currMetric.dailyExitIntents

    currentExitIntentsCollection[conversationId] = currIntent
    updatedMetrics.dailyExitIntents = currentExitIntentsCollection

    // Use the daily exit intents to calculate an aggregate of exit intents
    // check to see if the conversation is in progress and/or this is a new
    // conversation
    if (newConversation) {
      const exitIntents = currMetric.dailyExitIntents
      const newExitIntents = []
      for (const intent in exitIntents) {
        // Exclude current exit intent, as we aren't sure if this
        // conversation will continue
        if (intent !== conversationId) {
          const currentIntent = exitIntents[intent].name

          // Check to see if this intent is already on the list
          const exitIntentExists = newExitIntents.filter(
            intent => intent.name === currentIntent
          )[0]
          if (exitIntentExists) {
            exitIntentExists.occurrences++
          } else {
            const newExitIntent = {
              name: exitIntents[intent].name,
              id: exitIntents[intent].id,
              occurrences: 1,
            }
            if (newExitIntent.name !== undefined) {
              newExitIntents.push(newExitIntent)
            }
          }
        }
        updatedMetrics.exitIntents = newExitIntents
      }
    }

    // Check if current intent is already on the list
    const intentMetric = currMetric.intents.filter(
      intent => intent.id === currIntent.id
    )[0]

    // Update intent metric counters
    if (intentMetric) {
      intentMetric.occurrences++

      // Check if current conversation is already included in intent metric, if not increase the sessions counter
      if (!intentMetric.conversations.includes(conversationId)) {
        intentMetric.sessions++
        intentMetric.conversations.push(conversationId)
      }
      updatedMetrics.intents = currMetric.intents
    } else {
      // Create new intent entry on the metric
      const newIntent = {
        id: currIntent.id,
        name: currIntent.name,
        occurrences: 1,
        sessions: 1,
        conversations: [conversationId],
      }
      updatedMetrics.intents = admin.firestore.FieldValue.arrayUnion(
        newIntent
      )
    }

    if (isFallbackIntent) {
      updatedMetrics.numFallbacks = (currMetric.numFallbacks || 0) + 1
      updatedMetrics.fallbackTriggeringQueries = currMetric.fallbackTriggeringQueries || []
      const queryOccurs = updatedMetrics.fallbackTriggeringQueries.filter(queryMetric => {
        return queryMetric.queryText === fallbackTriggeringQuery
      })

      if (queryOccurs.length > 0) {
        queryOccurs[0].occurrences = queryOccurs[0].occurrences + 1
      } else {
        updatedMetrics.fallbackTriggeringQueries.push({
          queryText: fallbackTriggeringQuery,
          occurrences: 1
        })
      }
    }

    // Update the metrics collection for this request
    await metricsRef.update(updatedMetrics)
  } else {
    // Create new metric entry with current intent & supportRequest
    const currentExitIntent = {}
    currentExitIntent[conversationId] = {
      name: currIntent.name,
      id: currIntent.id,
      occurrences: 1,
    }

    // Add 7 hours to offset firestore's date timestamp
    // to ensure that the date reflects the document id
    const formattedDate = admin.firestore.Timestamp.fromDate(
      addHours(new Date(dateKey), 7)
    )

    await metricsRef.set({
      date: formattedDate,
      intents: [
        {
          id: currIntent.id,
          name: currIntent.name,
          occurrences: 1,
          sessions: 1,
          conversations: [conversationId],
        },
      ],
      dailyExitIntents: currentExitIntent,
      exitIntents: [],
      numConversations: 1,
      numConversationsWithDuration: 0,
      averageConversationDuration: 0,
      numConversationsWithSupportRequests: 0,
      numFallbacks: 0,
      fallbackTriggeringQueries: [],
      noneOfTheseCategories: [],
      userBrowsers: {
        [browser]: 1
      },
      mobileConversations: isMobile ? 1 : 0,
      nonMobileConversations: !isMobile ? 1 : 0
    })
  }
}

interface ConversationSnapshot {
  originalDetectIntentRequest: {
    payload: {
      browser: string,
      isMobile: boolean
    }
  },
  session: string,
  intentId: string,
  queryResult:
  {
    allRequiredParamsPresent: boolean,
    languageCode: 'en',
    intent:
    {
      displayName: string,
      name: string
    },
    intentDetectionConfidence: number,
    outputContexts: Array<any>,
    queryText: string,
    action: string,
    parameters: {}
  },
  createdAt: { _seconds: number, _nanoseconds: number },
  responseId: string
}

// Calculate metrics based on requests
const calculateMetrics = async (admin, store, reqData: ConversationSnapshot, subjectMatter) => {
  const currTimestamp = new Date()

  // const context = `projects/${projectName}`
  const context = `subjectMatters/${subjectMatter}`

  // Get ID's from conversation (session) & intent
  const conversationId = getIdFromPath(reqData.session)
  const currIntent = reqData.queryResult.intent
  const intent = {
    id: getIdFromPath(currIntent.name),
    name: currIntent.displayName,
  }

  // Get subject matter settings
  const settings = await getSubjectMatterSettings(store, subjectMatter)
  const timezoneOffset = settings.timezone.offset

  const browser = reqData.originalDetectIntentRequest.payload.browser
  const isMobile = reqData.originalDetectIntentRequest.payload.isMobile

  // Store aggregate used on export: conversations with requests
  const aggregateRef = store
    .collection(`${context}/aggregate`)
    .doc(conversationId)

  const aggregateDoc = await aggregateRef.get()

  const aggregateConversation: any = {
    updatedAt: admin.firestore.Timestamp.now(),
  }

  if (aggregateDoc.exists) {
    await aggregateRef.update(aggregateConversation)
  } else {
    // Create new conversation doc
    aggregateConversation.createdAt = admin.firestore.Timestamp.now()
    aggregateConversation.conversationId = conversationId
    await aggregateRef.set(aggregateConversation)
  }

  // Store request within aggregate conversation
  await aggregateRequest(admin, store, context, reqData, conversationId, intent)

  // Store conversation metrics
  const conversationRef = store
    .collection(`${context}/conversations`)
    .doc(conversationId)

  const conversationDoc = await conversationRef.get()

  const conversation: any = {
    updatedAt: admin.firestore.Timestamp.now(),
    lastIntent: intent,
  }

  let newConversation = false
  let newConversationFirstDuration = false
  let newConversationDuration = 0
  let previousConversationDuration = 0
  let shouldCalculateDuration = true

  const isFallbackIntent = fallbackIntents.includes(intent.name)
  if (conversationDoc.exists) {
    const currConversation = conversationDoc.data()
    // Calculate conversation duration (compare creation time with current)
    const duration = differenceInSeconds(
      currTimestamp,
      currConversation.createdAt.toDate()
    )

    // Check to see if this conversation is not a wildcard duration
    shouldCalculateDuration = isSameDay(
      currTimestamp,
      currConversation.createdAt.toDate()
    )

    // calcMetric is used to determine whether the conversation should
    // be including in the calculation yet
    if (!currConversation.calcMetric) {
      newConversationFirstDuration = true
      conversation.calcMetric = true
    }

    // Add the duration to the conversation object
    conversation.duration = duration
    newConversationDuration = duration
    previousConversationDuration = currConversation.duration
    
    if (isFallbackIntent) {
      if (reqData.queryResult.queryText.length > 0) {
        conversation.fallbackTriggeringQuery = reqData.queryResult.queryText
      }
    }

    conversation.browser = browser
    conversation.isMobile = isMobile

    await conversationRef.update(conversation)
  } else {
    // Conversation data doesn't exist for this id
    // Flag that the conversation is new for metrics count
    newConversation = true

    // Create new conversation doc
    conversation.createdAt = admin.firestore.Timestamp.now()
    conversation.calcMetric = false
    conversation.fallbackTriggeringQuery = ''
    conversation.feedback = []
    conversation.browser = browser
    conversation.isMobile = isMobile

    await conversationRef.set(conversation)
  }


  // Keep record of intents & support requests usage
  await storeMetrics(
    admin,
    store,
    context,
    conversationId,
    intent,
    timezoneOffset,
    newConversation,
    newConversationDuration,
    previousConversationDuration,
    newConversationFirstDuration,
    shouldCalculateDuration,
    isFallbackIntent,
    conversation.fallbackTriggeringQuery,
    browser,
    isMobile
  )
}

export const storeAnalytics = async (snapshot, context) => {
  console.log('Starting analytics trigger')
  try {
    const admin = await import('firebase-admin')
    // Connect to DB
    const store = admin.firestore()

    const subjectMatter = context.params.subjectMatter
    if (subjectMatter === undefined) {
      console.error('Subject matter was not found within trigger context.')
    } else {
      await calculateMetrics(admin, store, snapshot.data(), subjectMatter)
    }
  } catch (e) {
    console.error(e.message, e)
  }
}