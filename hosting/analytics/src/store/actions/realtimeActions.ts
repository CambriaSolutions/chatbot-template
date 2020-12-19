import * as actionTypes from './actionTypes'

export const storeMetricsSubscription = unsubscribeMetrics => {
  return {
    type: actionTypes.STORE_METRICS_SUBSCRIPTION,
    unsubscribeMetrics: unsubscribeMetrics,
  }
}

export const clearSubscriptions = () => {
  return (dispatch, getState) => {
    const unsubscribeConversations = getState().realtime
      .unsubscribeConversations
    const unsubscribeMetrics = getState().realtime.unsubscribeMetrics
    if (unsubscribeConversations) unsubscribeConversations()
    if (unsubscribeMetrics) unsubscribeMetrics()

    dispatch({
      type: actionTypes.CLEAR_REALTIME_SUBSCRIPTIONS,
    })
  }
}
