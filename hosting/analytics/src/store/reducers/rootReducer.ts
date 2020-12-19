import { combineReducers } from 'redux'
import filters from './filtersReducer'
import metrics from './metricsReducer'
import auth from './authReducer'
import config from './configReducer'
import realtime from './realtimeReducer'

const rootReducer = combineReducers({
  filters,
  metrics,
  auth,
  config,
  realtime,
})

export default rootReducer
