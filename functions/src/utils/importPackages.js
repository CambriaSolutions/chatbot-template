// This function imports several packages in order to reduce the chances
// of a user cold starting the fulfillment function in PROD. Since packages
// are cached after importing the first time in each instance,
// importing them like this once every few minutes should reduce the likelihood
// of a user encountering a cold start
// ALSO, this file is JS and not TS because we want to turn off typescript errors for unused 
// variables in this file only, not in all files.
export const importPackages = async () => {
  const { WebhookClient } = require('dialogflow-fulfillment')
  const getSubjectMatter = require('./getSubjectMatter')
  const { subjectMatterLocations } = require('../constants/constants')
  const { getTextResponses, getSuggestions, genericHandler, shouldHandleEndConversation } = require('./fulfillmentMessages.js')

  const { welcome } = await import('../intentHandlers/globalFunctions')
  const { acknowledgePrivacyStatement } = await import('../intentHandlers/globalFunctions')
  const { globalRestart } = await import('../intentHandlers/globalFunctions')
  const { restartConversation } = await import('../intentHandlers/globalFunctions')
  const { setContext } = await import('../intentHandlers/globalFunctions')

  // START COMMON
  const { noneOfThese } = await import('../intentHandlers/common/commonFallback')
  const { commonFallback } = await import('../intentHandlers/common/commonFallback')
  const { feedbackRoot } = await import('../intentHandlers/common/feedback')
  const { feedbackHelpful } = await import('../intentHandlers/common/feedback')
  const { feedbackNotHelpful } = await import('../intentHandlers/common/feedback')
  const { feedbackComplete } = await import('../intentHandlers/common/feedback')
  const { mapDeliverMap, mapRoot } = await import('../intentHandlers/common/map')
  const { mapDeliverMapAndCountyOffice } = await import('../intentHandlers/common/map')

  // START MSCJ
}