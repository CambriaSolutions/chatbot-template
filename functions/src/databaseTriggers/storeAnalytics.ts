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

// Inspect the query against suggestions in context to determine whether or
// not the agent and ml models should be updated
const inspectForMl = async (admin, store, query, intent, dfContext, context, timezoneOffset) => {
  const suggestions = dfContext.parameters.suggestions
  const userQuery = dfContext.parameters.originalQuery

  // Ignore "go back" queries
  if (userQuery.toLowerCase() !== 'go back') {
    // Check to see if any of the presented selections match the current query
    const queryMatchingSuggestions = suggestions.filter(suggestion => {
      return suggestion.suggestionText.toLowerCase() === query
    })

    try {
      if (queryMatchingSuggestions.length > 0) {
        // The user has selected one of the presented suggestions
        const { suggestionText, mlCategory } = queryMatchingSuggestions[0]

        // Create a reference depending on the current subject matter
        const queriesForTrainingRef = store.collection(
          `${context}/queriesForTraining`
        )

        // Attempt to find a document where the userQuery and suggestion text match
        const snap = await queriesForTrainingRef
          .where('phrase', '==', userQuery)
          .where('selectedSuggestion', '==', suggestionText)
          .where('category', '==', mlCategory)
          .get()

        if (snap.empty) {
          // The combination of the userQuery and the suggestion text has not occurred
          // so we create a document
          const document = {
            phrase: userQuery,
            occurrences: 1,
            smModelTrained: false,
            categoryModelTrained: false,
            agentTrained: false,
            intent: intent,
            selectedSuggestion: suggestionText,
            category: mlCategory,
          }
          queriesForTrainingRef.add(document)
        } else {
          // This combination has occurred before, so we increment the occurrences
          const updatePromises = []
          snap.forEach(doc => {
            updatePromises.push(queriesForTrainingRef.doc(doc.id).update({
              occurrences: admin.firestore.FieldValue.increment(1),
            }))
          })
          await Promise.all(updatePromises)
        }
      } else {
        // The user did not select any of our suggestions, so add the suggestions and
        // query to a collection for human inspection
        const createdAt = admin.firestore.Timestamp.now()
        const docRef = await store.collection(`${context}/queriesForLabeling`).add({ suggestions, userQuery, createdAt })

        const currentDate = getDateWithSubjectMatterTimezone(timezoneOffset)
        const dateKey = format(currentDate, 'MM-dd-yyyy')
        console.log(`Date Key ${dateKey}`)
        await store.collection(`${context}/metrics`).doc(dateKey).update({
          noneOfTheseCategories: admin.firestore.FieldValue.arrayUnion(docRef.id)
        })
      }
    } catch (err) {
      console.error(err.message, err)
    }
  }
}

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
  supportRequestType,
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

    // Record support request only if it's been submitted
    if (supportRequestType) {
      // Add to number of conversations with support requests
      // Check if the conversationId has already been included, i.e.
      // a conversation has more than one request
      const idInSupportRequests = currMetric.conversationsWithSupportRequests.includes(
        conversationId
      )
      // If the conversation hasn't been accounted for, add the id to the conversations
      // including support requests
      if (!idInSupportRequests) {
        updatedMetrics.conversationsWithSupportRequests = admin.firestore.FieldValue.arrayUnion(
          conversationId
        )
        updatedMetrics.numConversationsWithSupportRequests = currMetric.numConversationsWithSupportRequests += 1
      }

      // Check if current supportRequest is already on the list
      const supportMetric = currMetric.supportRequests.filter(
        request => request.name === supportRequestType
      )[0]

      // Update support metric counters
      if (supportMetric) {
        supportMetric.occurrences++
        updatedMetrics.supportRequests = currMetric.supportRequests
      } else {
        // Create new support request entry on the metric
        const newSupportRequest = {
          name: supportRequestType,
          occurrences: 1,
        }
        updatedMetrics.supportRequests = admin.firestore.FieldValue.arrayUnion(
          newSupportRequest
        )
      }
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
      nonMobileConversations: !isMobile ? 1 : 0,
      supportRequests: supportRequestType
        ? [
          {
            name: supportRequestType,
            occurrences: 1,
          },
        ]
        : [],
      conversationsWithSupportRequests: supportRequestType
        ? [conversationId]
        : [],
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

  // Check if the query has the should-inspect-for-ml parameter
  if (reqData.queryResult.outputContexts) {
    const inspections = []
    for (const dfContext of reqData.queryResult.outputContexts) {
      if (getIdFromPath(dfContext.name) === 'should-inspect-for-ml') {
        inspections.push(inspectForMl(
          admin,
          store,
          reqData.queryResult.queryText.toLowerCase(),
          intent,
          dfContext,
          context,
          timezoneOffset))
      }
    }

    if (inspections.length > 0) {
      await Promise.all(inspections)
    }
  }

  // Check if conversation has a support request
  const hasSupportRequest = intent.name.startsWith('cse-support')

  // Get support type
  let supportType = ''

  if (hasSupportRequest && reqData.queryResult.outputContexts) {
    // Loop through request output contexts array to find the ticket information
    for (const context of reqData.queryResult.outputContexts) {
      if (getIdFromPath(context.name) === 'ticketinfo') {
        // Read the support type from the ticket
        supportType = context.parameters.supportType.toLowerCase()

        // Remove PII data from parameters before storing request data
        context.parameters = { supportType: supportType }
        break
      }
    }
  }

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

  // The conversation has a support request only if it has been submitted
  const supportRequestSubmitted = intent.name === 'cse-support-submit-issue'
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
    // Change support request flag only if it's true
    if (hasSupportRequest) {
      conversation.hasSupportRequest = supportRequestSubmitted
      conversation.supportRequests = currConversation.supportRequests

      // Add current support request to list if not already there
      if (
        supportType !== '' &&
        !conversation.supportRequests.includes(supportType)
      ) {
        conversation.supportRequests.push(supportType)
      }
    }

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
    conversation.hasSupportRequest = supportRequestSubmitted
    conversation.supportRequests =
      hasSupportRequest && supportType !== '' ? [supportType] : []
    conversation.fallbackTriggeringQuery = ''
    conversation.feedback = []
    conversation.browser = browser
    conversation.isMobile = isMobile

    await conversationRef.set(conversation)
  }

  const supportRequestType = supportRequestSubmitted ? supportType : null

  // Keep record of intents & support requests usage
  await storeMetrics(
    admin,
    store,
    context,
    conversationId,
    intent,
    supportRequestType,
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