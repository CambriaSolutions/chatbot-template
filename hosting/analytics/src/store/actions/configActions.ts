import * as actionTypes from './actionTypes'
import db from '../../Firebase'
import { updateSubjectMatter } from './filterActions'
import { completeSignIn } from './authActions'
import { format } from 'date-fns'
import timezones from '../../common/timezones'
import { generateExcelFile } from '../../scripts/generateExcelFile'
import { map } from 'lodash'

// ------------------------------------------------------------------------
// ------------------------ S M  S E T T I N G S --------------------------
// ------------------------------------------------------------------------

export const fetchSubjectMatterSettings = user => {
  return (dispatch) => {
    const userRef = db.collection('users').doc(user.uid)

    dispatch(fetchSubjectMatterSettingsStart())

    userRef
      .get()
      .then(doc => {
        if (doc.exists) {
          const userData = doc.data()
          user.isAdmin = userData.admin && userData.admin === true
          user.defaultSubjectMatter = userData.defaultSubjectMatter
          user.dataExport = user.isAdmin
            ? true
            : userData.dataExport
              ? userData.dataExport
              : false

          const settingsRef = db.collection('settings')

          dispatch(fetchSubjectMatterSettingsStart())

          settingsRef
            .get()
            .then(querySnapshot => {
              const fetchedSubjectMattersSettings = []
              querySnapshot.forEach(doc => {
                // If user is admin add all the subject matters
                const subjectMatterSettingsData = doc.data()

                if (
                  user.isAdmin ||
                  userData.subjectMatters.includes(subjectMatterSettingsData.name)
                ) {
                  fetchedSubjectMattersSettings.push(subjectMatterSettingsData)
                }
              })

              // Update subject matter settings
              if (fetchedSubjectMattersSettings.length > 0) {
                const defaultSubjectMatterSettings = fetchedSubjectMattersSettings.filter(
                  p => p.name === user.defaultSubjectMatter
                )[0]

                dispatch({
                  type: actionTypes.UPDATE_DEFAULT_SUBJECT_MATTER,
                  defaultSubjectMatter: defaultSubjectMatterSettings.name,
                })

                dispatch(updateSubjectMatter(defaultSubjectMatterSettings.name, fetchedSubjectMattersSettings))
              }

              dispatch(fetchSubjectMatterSettingsSuccess(fetchedSubjectMattersSettings, user))
            })
            .catch(err => {
              dispatch(fetchSubjectMatterSettingsFail(err))
            })
        } else {
          dispatch(fetchSubjectMatterSettingsFail('User not found'))
        }
      })
      .catch(err => {
        dispatch(fetchSubjectMatterSettingsFail(err))
      })
  }
}

export const fetchSubjectMatterSettingsSuccess = (fetchedSubjectMattersSettings, user) => {
  return dispatch => {
    dispatch({
      type: actionTypes.FETCH_SUBJECT_MATTER_SETTINGS_SUCCESS,
      subjectMattersSettings: fetchedSubjectMattersSettings
    })
    dispatch(completeSignIn(user))
  }
}

export const fetchSubjectMatterSettingsFail = error => {
  console.log(error)
  return {
    type: actionTypes.FETCH_SUBJECT_MATTER_SETTINGS_FAIL,
    error: error,
  }
}

export const fetchSubjectMatterSettingsStart = () => {
  return {
    type: actionTypes.FETCH_SUBJECT_MATTER_SETTINGS_START,
  }
}

// ------------------------------------------------------------------------
// --------------------- I N T E N T  D E T A I L S -----------------------
// ------------------------------------------------------------------------

// Regex to retrieve text after last "/" on a path
const getIdFromPath = path => /[^/]*$/.exec(path)[0]

// pagination = null, 'next' or 'previous'
export const showIntentDetails = (intent, pagination = null, paginationPage = null) => {
  return async (dispatch, getState) => {
    try {
      const context = getState().filters.context
      const dateRange = getState().filters.dateFilters

      dispatch(fetchIntentDetailsStart())

      const previousFirstDocumentSnapshot = getState().config.firstDocumentSnapshot
      const previousLastDocumentSnapshot = getState().config.lastDocumentSnapshot

      let snapshot = db.collection(`${context}/requests`)
        .where('createdAt', '>', new Date(dateRange.start))
        .where('createdAt', '<', new Date(dateRange.end))
        .where('intentId', '==', intent.id)

      const totalIntentDetailCountPromise = snapshot.get()

      const queryLimit = 4

      if (previousLastDocumentSnapshot && pagination === 'next') {
        snapshot = snapshot.orderBy('createdAt', 'desc').startAfter(previousLastDocumentSnapshot).limit(queryLimit)
      } else if (previousLastDocumentSnapshot && pagination === 'previous') {
        snapshot = snapshot
          .orderBy('createdAt', 'asc')
          .startAfter(previousFirstDocumentSnapshot)
          .limit(queryLimit)
      } else {
        snapshot = snapshot.orderBy('createdAt', 'desc').limit(queryLimit)
      }

      const snapshotPromise = snapshot.get()

      const snapshotPromiseResponse = await snapshotPromise

      let intentDetails = []
      let newFirstDocumentSnapshot = null
      let newLastDocumentSnapshot = null

      let index = 0

      snapshotPromiseResponse.forEach((doc) => {
        const tempData = doc.data()

        if (index === 0) {
          newFirstDocumentSnapshot = doc
        } else if (index === queryLimit - 1) {
          newLastDocumentSnapshot = doc
        }

        index++

        const newIntentDetails = {
          createdAt: tempData.createdAt.toDate(),
          intentId: intent.id,
          intentName: tempData.queryResult.intent.displayName,
          intentDetectionConfidence:
            tempData.queryResult.intentDetectionConfidence,
          messageText: tempData.queryResult.queryText,
          outputContexts: tempData.queryResult.outputContexts
            ? tempData.queryResult.outputContexts.map(o => ({
              ...o,
              context: getIdFromPath(o.name),
            }))
            : [],
          conversationId: getIdFromPath(tempData.session),
          botResponse: tempData.queryResult.fulfillmentText,
        }

        // Insert in reverse order
        if (previousLastDocumentSnapshot && pagination === 'previous') {
          intentDetails = [newIntentDetails, ...intentDetails]
        } else {
          intentDetails.push(newIntentDetails)
        }
      })

      const totalIntentDetailCountPromiseResponse = await totalIntentDetailCountPromise

      const totalIntentDetailsCount = totalIntentDetailCountPromiseResponse.size

      dispatch(
        fetchIntentDetailsSuccess(
          intent,
          intentDetails,
          newFirstDocumentSnapshot,
          newLastDocumentSnapshot,
          totalIntentDetailsCount,
          paginationPage
        ))

      dispatch(toggleIntentsModal(true))
    }
    catch (e) {
      dispatch(fetchIntentDetailsFail(e))
    }
  }
}

export const fetchIntentDetailsSuccess = (intent, intentDetails, firstDocumentSnapshot, lastDocumentSnapshot, totalIntentDetailsCount, paginationPage) => {
  return {
    type: actionTypes.FETCH_INTENT_DETAILS_SUCCESS,
    intentDetailsIntent: intent,
    intentDetails,
    firstDocumentSnapshot,
    lastDocumentSnapshot,
    totalIntentDetailsCount,
    intentDetailsPaginationPage: paginationPage
  }
}

export const fetchIntentDetailsFail = error => {
  console.log(error)
  return {
    type: actionTypes.FETCH_INTENT_DETAILS_FAIL,
    error: error,
  }
}

export const fetchIntentDetailsStart = () => {
  return {
    type: actionTypes.FETCH_INTENT_DETAILS_START,
  }
}

// ------------------------------------------------------------------------
// -------------------------- S E T T I N G S -----------------------------
// ------------------------------------------------------------------------

export const toggleSettings = showSettings => {
  return {
    type: actionTypes.TOGGLE_SETTINGS,
    showSettings: showSettings,
  }
}

export const toggleConfigLoading = loading => {
  return {
    type: actionTypes.TOGGLE_CONFIG_LOADING,
    loading: loading,
  }
}

export const toggleIntentsModal = option => {
  return {
    type: actionTypes.TOGGLE_INTENT_MODAL,
    showIntentModal: option,
  }
}

export const updateDefaultSubjectMatter = subjectMatter => {
  return (dispatch, getState) => {
    // Get subject matter settings based on the given context
    const user = getState().auth.user
    if (user) {
      const userRef = db.collection('users').doc(user.uid)
      userRef.update({ defaultSubjectMatter: subjectMatter }).then(() => {
        dispatch({
          type: actionTypes.UPDATE_DEFAULT_SUBJECT_MATTER,
          defaultSubjectMatter: subjectMatter,
        })
        dispatch(showSnackbar('Default subject matter updated successfully'))
      })
    }
  }
}

export const updateSubjectMatterColor = newColor => {
  return (dispatch, getState) => {
    let subjectMatterName = getState().filters.context
    const subjectMattersSettings = getState().config.subjectMattersSettings

    if (subjectMatterName.length > 0) {
      subjectMatterName = subjectMatterName.replace('subjectMatters/', '')
      const settingsRef = db.collection('settings').doc(subjectMatterName)
      settingsRef.update({ primaryColor: newColor }).then(() => {
        dispatch(showSnackbar('Subject matter primary color updated successfully'))
      })

      // Update subject matters object with new primary color
      const currSubjectMatter = subjectMattersSettings.filter(p => p.name === subjectMatterName)[0]
      currSubjectMatter.primaryColor = newColor
      dispatch({
        type: actionTypes.FETCH_SUBJECT_MATTER_SETTINGS_SUCCESS,
        subjectMattersSettings: subjectMattersSettings,
      })
    }
  }
}

export const updateSubjectMatterTimezone = newTimezone => {
  return (dispatch, getState) => {
    let subjectMatterName = getState().filters.context
    const subjectMattersSettings = getState().config.subjectMattersSettings
    console.log(newTimezone)
    const selectedTimezone = timezones.filter(
      timezone => timezone.text === newTimezone
    )[0]

    console.log(selectedTimezone)
    if (subjectMatterName.length > 0 && selectedTimezone) {
      // Setup timezone value as DB expects it
      const _newTimezone = {
        name: selectedTimezone.text,
        offset: selectedTimezone.offset,
      }

      subjectMatterName = subjectMatterName.replace('subjectMatters/', '')
      const settingsRef = db.collection('settings').doc(subjectMatterName)
      settingsRef.update({ timezone: _newTimezone }).then(() => {
        dispatch(showSnackbar('Subject matter timezone updated successfully'))
      })

      // Update subject matters object with new timezone
      const currSubjectMatter = subjectMattersSettings.filter(p => p.name === subjectMatterName)[0]
      currSubjectMatter.timezone = _newTimezone
      dispatch({
        type: actionTypes.FETCH_SUBJECT_MATTER_SETTINGS_SUCCESS,
        subjectMattersSettings: subjectMattersSettings,
      })
    }
  }
}

const getQueriesForLabeling = (startDate, endDate) => db
  .collection(
    '/subjectMatters/cse/queriesForLabeling/'
  )
  .where('createdAt', '>=', startDate)
  .where('createdAt', '<=', endDate)
  .get()

const getUnhandledPhrasesFromRequests = (subjectMatter, startDate, endDate) => db
  .collection(
    `/subjectMatters/${subjectMatter}/requests/`
  )
  .where('queryResult.intent.displayName', '==', 'Default Fallback Intent')
  .where('createdAt', '>=', startDate)
  .where('createdAt', '<=', endDate)
  .get()

const addPhrasesToContent = (unhandledPhrases, content, subjectMatter = null) => {
  let _content = content

  unhandledPhrases.forEach(doc => {
    const data = doc.data()
    const createdAtFormatted = format(data.createdAt.toDate(), 'MM-dd-yyyy')
    let newRow = [data.queryResult.queryText, createdAtFormatted]
    if (subjectMatter) {
      newRow = [...newRow, subjectMatter.toUpperCase()]
    }
    _content = [..._content, newRow]
  })

  return _content
}

const addSuggestionsToContent = (queriesForLabeling, includeSuggestions, includeDateColumn, includeCSEColumn) => {
  let _content = []

  queriesForLabeling.forEach(doc => {
    const data = doc.data()
    const createdAtFormatted = format(data.createdAt.toDate(), 'MM-dd-yyyy')
    const userQuery = data.userQuery
    let newRow = [userQuery]

    if (includeSuggestions) {
      const sug1 = data.suggestions[0] ? data.suggestions[0].suggestionText : 'N/A'
      const sug2 = data.suggestions[1] ? data.suggestions[1].suggestionText : 'N/A'
      const sug3 = data.suggestions[2] ? data.suggestions[2].suggestionText : 'N/A'
      newRow = [...newRow, sug1, sug2, sug3]
    }

    if (includeDateColumn) {
      newRow = [...newRow, createdAtFormatted]
    }

    if (includeCSEColumn) {
      newRow = [...newRow, 'CSE']
    }

    _content = [..._content, newRow]
  })

  return _content
}

const getFeedbackComments = (subjectMatter, startDate, endDate) => db
  .collection(
    `/subjectMatters/${subjectMatter}/conversations/`
  )
  // .where('feedback', '!=', [])
  // .where('feedback', '!=', undefined)
  .where('createdAt', '>=', startDate)
  .where('createdAt', '<=', endDate)
  .get()

const addFeedbackToContent = (feedback, content, subjectMatter = null) => {
  let _content = content

  if (feedback) {
    feedback.forEach(doc => {
      const data = doc.data()
      const createdAtFormatted = format(data.createdAt.toDate(), 'MM-dd-yyyy')

      if (data.feedback) {
        data.feedback.forEach(_feedback => {
          if (_feedback.comment) {
            let newRow = [_feedback.comment, _feedback.helpful ? 'Yes' : 'No', createdAtFormatted]

            if (subjectMatter) {
              newRow = [...newRow, subjectMatter.toUpperCase()]
            }
            _content = [..._content, newRow]
          }
        })
      }
    })
  }

  return _content
}

export const downloadExport = () => {
  return async (dispatch, getState) => {
    const context = getState().filters.context
    const subjectMatter = /[^/]*$/.exec(context)[0]
    const startDate = new Date(getState().filters.dateFilters.start)
    const endDate = new Date(getState().filters.dateFilters.end)

    let phrasesContent = []
    let feedbackContent = []
    let cseSuggestionsContent = null

    if (subjectMatter.toLowerCase() === 'total') {
      const subjectMatters = ['tanf', 'snap', 'wfd']

      const unhandledPhrasesPromises = map(subjectMatters, sm => getUnhandledPhrasesFromRequests(sm, startDate, endDate))
      const feedbackCommentsPromises = map(subjectMatters, sm => getFeedbackComments(sm, startDate, endDate))

      const cseQueriesForLabeling = await getQueriesForLabeling(startDate, endDate)

      phrasesContent = addSuggestionsToContent(cseQueriesForLabeling, false, true, true)
      cseSuggestionsContent = addSuggestionsToContent(cseQueriesForLabeling, true, false, false)

      const unhandledPhrasesResults = await Promise.all(unhandledPhrasesPromises)
      const feedbackCommentsResults = await Promise.all(feedbackCommentsPromises)

      unhandledPhrasesResults.forEach((res, index) => {
        phrasesContent = addPhrasesToContent(res, phrasesContent, subjectMatters[index])
      })

      feedbackCommentsResults.forEach((res, index) => {
        feedbackContent = addFeedbackToContent(res, feedbackContent, subjectMatters[index])
      })

    } else {
      let unhandledPhrases: any = []

      // If subject matter is cse, then we need to fetch the data from a different location
      // in order to see the suggestions made by automl
      if (subjectMatter === 'cse') {
        const queriesForLabeling = await getQueriesForLabeling(startDate, endDate)
        phrasesContent = addSuggestionsToContent(queriesForLabeling, true, true, false)
      } else {
        unhandledPhrases = await getUnhandledPhrasesFromRequests(subjectMatter, startDate, endDate)
        phrasesContent = addPhrasesToContent(unhandledPhrases, phrasesContent)
      }

      const feedbackComments = await getFeedbackComments(subjectMatter, startDate, endDate)
      feedbackContent = addFeedbackToContent(feedbackComments, feedbackContent)
    }

    await generateExcelFile(phrasesContent, feedbackContent, cseSuggestionsContent, subjectMatter.toLowerCase() === 'total', subjectMatter)
  }
}

export function closeSnackbar() {
  return { type: actionTypes.CLOSE_SNACKBAR }
}

export function showSnackbar(message) {
  return { type: actionTypes.SHOW_SNACKBAR, message }
}
