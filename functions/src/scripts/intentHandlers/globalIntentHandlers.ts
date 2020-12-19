import {
  welcome,
  acknowledgePrivacyStatement,
  globalRestart,
  restartConversation,
  setContext,
} from '../../intentHandlers/globalFunctions'

export const globalIntentHandlers = {
  'Default Welcome Intent': welcome,
  'acknowledge-privacy-statement': acknowledgePrivacyStatement,
  'global-restart': globalRestart,
  'restart-conversation': restartConversation,
  'set-context': setContext,
}