import { combineReducers } from 'redux'
import config from './configReducer'
import conversation from './conversationReducer'
import buttonBar from './buttonBarReducer'
import userInput from './userInputReducer'
import feedbackInput from './feedbackInputReducer'
import error from './errorReducer'

const rootReducer = combineReducers({
  config,
  conversation,
  buttonBar,
  userInput,
  feedbackInput,
  error,
})
export default rootReducer
