import * as actionTypes from '../actions/actionTypes'

const initialState = {
  intents: [], // { id: '1234', name: 'support', occurrences: 3, sessions: 9 }
  supportRequests: [],
  supportRequestTotal: 0,
  loading: false,
  feedback: [],
  feedbackFiltered: [],
  feedbackSelected: 'positive',
  conversationsDurationTotal: 0,
  conversationsTotal: 0,
  durationTotal: 0,
  durationTotalNoExit: 0,
  exitIntents: [],
  fallbackTriggeringQueries: {}
}

const fetchMetricsStart = (state) => {
  return { ...state, loading: true }
}

const fetchMetricsSuccess = (state, action) => {
  return {
    ...state,
    ...action,
    loading: false
  }
}

const fetchMetricsFail = (state) => {
  return { ...state, loading: false }
}

const updateFeedbackType = (state, action) => {
  return {
    ...state,
    feedbackSelected: action.feedbackType,
    feedbackFiltered: action.feedbackFiltered,
  }
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_METRICS_START:
      return fetchMetricsStart(state)
    case actionTypes.FETCH_METRICS_SUCCESS:
      return fetchMetricsSuccess(state, action)
    case actionTypes.FETCH_METRICS_FAIL:
      return fetchMetricsFail(state)
    case actionTypes.UPDATE_FEEDBACK_TYPE:
      return updateFeedbackType(state, action)
    case actionTypes.UPDATE_METRICS:
      return {
        ...state,
        intents: action.intents,
        supportRequests: action.supportRequests,
        feedback: action.feedback,
        feedbackSelected: action.feedbackSelected,
        feedbackFiltered: action.feedbackFiltered,
        conversationsDurationTotal: action.conversationsDurationTotal,
        conversationsTotal: action.conversationsTotal,
        durationTotalNoExit: action.durationTotalNoExit,
        exitIntents: action.exitIntents,
        durationTotal: action.durationTotal,
      }
    default:
      return state
  }
}

export default reducer
