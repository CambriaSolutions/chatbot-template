import * as actionTypes from '../actions/actionTypes'

const initialState = {
  unsubscribeConversations: null,
  unsubscribeMetrics: null,
  currentConversations: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.CLEAR_REALTIME_SUBSCRIPTIONS:
      return {
        ...state,
        unsubscribeConversations: null,
        unsubscribeMetrics: null,
        updatedConversations: [],
        updatedMetrics: [],
      }
    case actionTypes.UPDATE_REALTIME_CONVERSATIONS:
      return {
        ...state,
        currentConversations: action.currentConversations,
      }
    case actionTypes.STORE_CONVERSATIONS_SUBSCRIPTION:
      return {
        ...state,
        unsubscribeConversations: action.unsubscribeConversations,
      }
    case actionTypes.STORE_METRICS_SUBSCRIPTION:
      return {
        ...state,
        unsubscribeMetrics: action.unsubscribeMetrics,
      }
    default:
      return state
  }
}

export default reducer
