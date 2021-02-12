import {
  welcome,
  acknowledgePrivacyStatement,
  globalRestart,
  restartConversation,
  caseyHandoff,
  setContext,
} from '../../intentHandlers/globalFunctions'

export const globalIntentHandlers = {
  'Default Welcome Intent': welcome,
  'acknowledge-privacy-statement': acknowledgePrivacyStatement,
  'global-restart': globalRestart,
  'restart-conversation': restartConversation,
  'casey-handoff': caseyHandoff,
  'set-context': setContext,
}