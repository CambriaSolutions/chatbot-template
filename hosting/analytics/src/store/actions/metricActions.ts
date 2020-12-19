import * as actionTypes from './actionTypes'
import db from '../../Firebase'
import { format } from 'date-fns'
import { reduce, map, find, findIndex, filter, keyBy, cloneDeep } from 'lodash'
import { subjectMatters } from '../../constants/constants'
import { getUTCDate } from '../../common/helper'
import { storeMetricsSubscription } from './realtimeActions'
import { renameIntent } from '../../common/renameIntent'

const formatMetricsQuerySnapshotDocuments = metricsQuerySnapshot => {
  const fetchedMetrics = []

  metricsQuerySnapshot.forEach(doc => {
    fetchedMetrics.push({ ...doc.data(), id: doc.id })
  })

  return fetchedMetrics
}

const queryMetrics = async (dateRange, context) => {
  // const timezoneOffset = getState().filters.timezoneOffset
  const metricsRef = db.collection(`${context}/metrics`)
  const startDate = new Date(dateRange.start)
  const endDate = new Date(dateRange.end)

  const snapshot = await metricsRef
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .get()

  return snapshot
}

export const getMetrics = async (dateRange, context) => {
  const metricsQuerySnapshot = await queryMetrics(dateRange, context)

  return formatMetricsQuerySnapshotDocuments(metricsQuerySnapshot)
}

// Fetch metrics for a specific subject matter
export const fetchMetrics = (dateRange, context = undefined) => {
  return async (dispatch, getState) => {
    try {
      dispatch(fetchMetricsStart())

      if (typeof dateRange === 'undefined') {
        dateRange = getState().filters.dateFilters
      }
      if (typeof context === 'undefined') {
        context = getState().filters.context
      }

      const today = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX')
      const isToday = today.startsWith(dateRange.start.slice(0, 10))
      const useRealtimeUpdates = getState().config.updateRealtime

      // If date filter is set to today, we fetch data and subscribe to enable automatic data updates on data changes in DB
      if (useRealtimeUpdates && isToday) {

        const timezoneOffset = getState().filters.timezoneOffset
        const metricsRef = db.collection(`${context}/metrics`)
        const dateWithSubjectMatterTimezone = getUTCDate((new Date() as any), timezoneOffset)
        const dateKey = format(dateWithSubjectMatterTimezone, 'MM-dd-yyyy')

        // Load metric data from today and continue listening for changes
        const unsubscribeMetrics = metricsRef.doc(dateKey).onSnapshot(async doc => {
          if (doc.exists) {
            const fetchedMetrics = formatMetricsQuerySnapshotDocuments([doc])

            dispatch(fetchMetricsSuccess(fetchedMetrics))
          } else {
            dispatch(fetchMetricsSuccess([]))

          }
        })

        dispatch(storeMetricsSubscription(unsubscribeMetrics))
      } else {
        // If date filter is not set to today, then we perform a regular fetch. 

        const fetchedMetrics = await getMetrics(dateRange, context)

        dispatch(fetchMetricsSuccess(fetchedMetrics))
      }

    } catch (err) {
      dispatch(fetchMetricsFail(err))
    }
  }
}

// Fetch the aggregated daily metrics for all subject matters 
export const fetchMetricsTotal = (dateRange) => {
  return async (dispatch, getState) => {
    try {
      // const useRealtimeUpdates = getState().config.updateRealtime
      if (typeof dateRange === 'undefined') {
        dateRange = getState().filters.dateFilters
      }

      dispatch(fetchMetricsStart())

      const promises = map(subjectMatters, sm => getMetrics(dateRange, `subjectMatters/${sm}`))

      const generalMetrics = await getMetrics(dateRange, 'subjectMatters/general')

      // subjectMatterMetrics is an array (subject matters) made up of another array of the daily metrics (for each subject matter)
      const subjectMatterMetrics = await Promise.all(promises)

      // The daily metrics inside of each subject matter are keyed by the ID (date). This makes it easier to aggregate the data
      const subjectMatterMetricsById = map(subjectMatterMetrics, m => keyBy(m, dailyMetrics => dailyMetrics.id))

      const dayDefaults = {
        id: null,
        cpCount: 0,
        ncpCount: 0,
        employerCount: 0,
        averageConversationDuration: 0,
        dailyExitIntents: {},
        date: {},
        exitIntents: [],
        fallbackTriggeringQueries: [],
        feedback: {
          positive: 0,
          negative: 0,
          helpful: [],
          notHelpful: [],
        },
        intents: [],
        noneOfTheseCategories: [],
        numFallbacks: 0,
        numConversations: 0,
        numConversationsWithDuration: 0,
      }

      const aggregatedSubjectMatterMetricsById = reduce(subjectMatterMetricsById, (subjectMatterResult, currentSubjectMatter) => {

        // Take the current result object and construct a new object that includes the current subject matter's daily metrics
        return reduce(currentSubjectMatter, (dayResult, dayMetrics) => {
          // Temporarily key the intents by name to facilitate aggregation
          const aggregatedIntents = reduce(dayMetrics.intents, (intentResult, currentIntent) => {
            const previousOccurrences = intentResult[currentIntent.name] ? intentResult[currentIntent.name].occurrences : 0

            const intentDisplayName = renameIntent(currentIntent.name)

            return ({
              // Persist the other entries in the intentResult object
              ...intentResult,
              // Keying intent requests by name
              [intentDisplayName]: {
                id: currentIntent.id,
                conversations: [],
                name: currentIntent.name,
                displayName: intentDisplayName,
                sessions: 0,
                // The new value for occurrences will be the old (current aggregate) plus the new value in the iterate
                occurrences: previousOccurrences + currentIntent.occurrences
              }
            })
          }, subjectMatterResult[dayMetrics.id] ? subjectMatterResult[dayMetrics.id].intents : {})

          const aggregatedFeedback = dayResult[dayMetrics.id] && dayResult[dayMetrics.id].feedback ? cloneDeep(dayResult[dayMetrics.id].feedback) : cloneDeep(dayDefaults.feedback)

          // Add the positive count
          aggregatedFeedback.positive += dayMetrics.feedback && dayMetrics.feedback.positive ? dayMetrics.feedback.positive : 0

          // Add the negative count
          aggregatedFeedback.negative += dayMetrics.feedback && dayMetrics.feedback.negative ? dayMetrics.feedback.negative : 0

          if (dayMetrics.feedback) {
            // Aggregate the positive feedback
            dayMetrics.feedback.helpful.forEach(h => {
              const matchIndex = findIndex(aggregatedFeedback, (fb: any) => fb.name === h.name)

              if (matchIndex >= 0) {
                aggregatedFeedback.helpful[matchIndex].occurrences += h.occurrences
              } else {
                aggregatedFeedback.helpful.push({ ...h })
              }
            })

            // Aggregate the negative feedback
            dayMetrics.feedback.notHelpful.forEach(h => {
              const matchIndex = findIndex(aggregatedFeedback, (fb: any) => fb.name === h.name)

              if (matchIndex >= 0) {
                aggregatedFeedback.notHelpful[matchIndex].occurrences += h.occurrences
              } else {
                aggregatedFeedback.notHelpful.push({ ...h })
              }
            })
          }

          return ({
            ...dayResult,
            [dayMetrics.id]: {
              ...dayDefaults,
              id: dayMetrics.id,
              feedback: aggregatedFeedback,
              intents: aggregatedIntents
            }
          })
        }, subjectMatterResult)
      }, {})

      // Merge the metrics from the "general" subject matter, and metrics from the actual subject matters.
      const mergedMetrics = reduce(generalMetrics, (result, m) => ({
        ...result,
        [m.id]: {
          // Add defaults just in case the days in the general and subject matter metrics 
          // are not be the same and iterating through the general metrics collection ends 
          // up adding a new date to the overall collection
          ...dayDefaults,
          // Persist the metrics for the day
          ...aggregatedSubjectMatterMetricsById[m.id],
          // Append the user metrics
          numConversations: m.numConversations,
          numConversationsWithDuration: m.numConversationsWithDuration,
          mobileConversations: m.mobileConversations,
          nonMobileConversations: m.nonMobileConversations,
          userBrowsers: m.userBrowsers
        }
      }), aggregatedSubjectMatterMetricsById)

      // Undo the fact that daily metrics are keyed by date
      const aggregatedMetrics = map(mergedMetrics, (m: any) => ({
        ...m,
        intents: map(m.intents)
      }))

      dispatch(fetchMetricsSuccess(aggregatedMetrics))

    } catch (err) {
      dispatch(fetchMetricsFail(err))
    }
  }
}

export const fetchMetricsSuccess = metrics => {
  return dispatch => {
    // Retrieve intents from daily metrics
    // Create intents dictionary with counters for occurrences & sessions
    let intents = {}
    const feedback = { helpful: {}, notHelpful: {}, positive: 0, negative: 0 }
    let avgConvoDuration = 0
    let numConversations = 0
    let numConversationsWithDuration = 0
    let fallbackTriggeringQueries = {}

    const exitIntents = []

    // Loop through metrics per day
    for (const metric of metrics) {
      avgConvoDuration += metric.averageConversationDuration * metric.numConversationsWithDuration
      numConversations += metric.numConversations
      numConversationsWithDuration += metric.numConversationsWithDuration

      for (const intent in metric.exitIntents) {
        const currentIntent = metric.exitIntents[intent].name
        // check to see if this intent is already on the list
        const exitIntentExists = exitIntents.filter(
          intent => intent.name === currentIntent
        )[0]
        if (exitIntentExists) {
          exitIntentExists.exits += metric.exitIntents[intent].occurrences
        } else {
          const newExitIntent = {
            name: metric.exitIntents[intent].name,
            id: metric.exitIntents[intent].id,
            exits: metric.exitIntents[intent].occurrences,
          }
          exitIntents.push(newExitIntent)
        }
      }

      // Intents
      const dateIntents = metric.intents
      for (const dateIntent of dateIntents) {
        const intentKey = dateIntent.displayName ? dateIntent.displayName : dateIntent.id
        const currIntent = intents[intentKey]
        if (currIntent) {
          currIntent.occurrences =
            currIntent.occurrences + dateIntent.occurrences
          currIntent.sessions = currIntent.sessions + dateIntent.sessions
        } else
          intents[intentKey] = {
            name: `${dateIntent.name}`,
            occurrences: dateIntent.occurrences,
            sessions: dateIntent.sessions,
            displayName: intentKey
          }
      }

      if (metric.fallbackTriggeringQueries) {
        for (const query of metric.fallbackTriggeringQueries) {
          if (query.queryText !== undefined && query.occurrences !== undefined && query.queryText.length > 0) {
            if (fallbackTriggeringQueries[query.queryText] === undefined) {
              fallbackTriggeringQueries[query.queryText] = query.occurrences
            } else {
              fallbackTriggeringQueries[query.queryText] = fallbackTriggeringQueries[query.queryText] + query.occurrences
            }
          }
        }
      }

      // Feedback
      const feedbackEntry = metric.feedback
      if (feedbackEntry) {
        // Add up totals
        feedback.positive = feedback.positive + feedbackEntry.positive
        feedback.negative = feedback.negative + feedbackEntry.negative
        // Count through helpful feedback
        for (const helpfulFeedback of feedbackEntry.helpful) {
          const helpfulFeedbackId = helpfulFeedback.name.replace(/\s+/g, '-')
          const currFeedback = feedback.helpful[`${helpfulFeedbackId}`]
          if (currFeedback) {
            currFeedback.occurrences =
              currFeedback.occurrences + helpfulFeedback.occurrences
          } else
            feedback.helpful[`${helpfulFeedbackId}`] = {
              name: `${helpfulFeedback.name}`,
              occurrences: helpfulFeedback.occurrences,
            }
        }

        // Count through not-helpful feedback
        for (const notHelpfulFeedback of feedbackEntry.notHelpful) {
          const notHelpfulFeedbackId = notHelpfulFeedback.name.replace(
            /\s+/g,
            '-'
          )
          const currFeedback = feedback.notHelpful[`${notHelpfulFeedbackId}`]
          if (currFeedback) {
            currFeedback.occurrences =
              currFeedback.occurrences + notHelpfulFeedback.occurrences
          } else
            feedback.notHelpful[`${notHelpfulFeedbackId}`] = {
              name: `${notHelpfulFeedback.name}`,
              occurrences: notHelpfulFeedback.occurrences,
            }
        }
      }
    }

    // Feedback contains helpful & non helpful data, send only positive feedback
    const feedbackFiltered = filterFeedback('positive', feedback)

    // Convert dictionary to array of objects (add ids)
    intents = Object.keys(intents).map(key => ({
      ...intents[key],
      id: key,
    }))

    fallbackTriggeringQueries = Object.keys(fallbackTriggeringQueries).map(key => ({
      queryText: key,
      id: key,
      // occurrences: fallbackTriggeringQueries[key]
    }))

    dispatch({
      type: actionTypes.FETCH_METRICS_SUCCESS,
      dailyMetrics: metrics,
      intents: intents,
      fallbackTriggeringQueries: fallbackTriggeringQueries,
      feedback: feedback,
      feedbackSelected: 'positive',
      feedbackFiltered: feedbackFiltered,
      conversationsDurationTotal: numConversationsWithDuration,
      conversationsTotal: numConversations,
      durationTotal: avgConvoDuration / numConversations,
      durationTotalNoExit: avgConvoDuration / numConversationsWithDuration,
      exitIntents: exitIntents,
    })
  }
}

export const fetchMetricsFail = error => {
  console.log(error)
  return {
    type: actionTypes.FETCH_METRICS_FAIL,
    error: error,
  }
}

export const fetchMetricsStart = () => {
  return {
    type: actionTypes.FETCH_METRICS_START,
  }
}

const filterFeedback = (type, feedback) => {
  if (type === 'positive') {
    feedback = {
      details: Object.keys(feedback.helpful).map(key => ({
        ...feedback.helpful[key],
      })),
      total: feedback.positive,
    }
  } else {
    feedback = {
      details: Object.keys(feedback.notHelpful).map(key => ({
        ...feedback.notHelpful[key],
      })),
      total: feedback.negative,
    }
  }
  return feedback
}

export const updateFeedbackType = feedbackType => {
  return (dispatch, getState) => {
    const feedbackFiltered = filterFeedback(
      feedbackType,
      getState().metrics.feedback
    )

    dispatch({
      type: actionTypes.UPDATE_FEEDBACK_TYPE,
      feedbackType: feedbackType,
      feedbackFiltered: feedbackFiltered,
    })
  }
}
