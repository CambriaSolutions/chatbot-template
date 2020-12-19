// We use this function to lazy load dependencies because
// google cloud functions has issues when cold starting
export const getIntentHandler = (subjectMatter: SubjectMatter) => async (intentName: string): Promise<IntentHandler> | null => {
  let moduleImport = null
  let subjectMatterLocationsModule = null

  switch (intentName) {
    // STAR GLOBAL
    case 'Default Welcome Intent':
      const { welcome } = await import('./globalFunctions')
      return welcome
    case 'acknowledge-privacy-statement':
      const { acknowledgePrivacyStatement } = await import('./globalFunctions')
      return acknowledgePrivacyStatement
    case 'global-restart':
      const { globalRestart } = await import('./globalFunctions')
      return globalRestart
    case 'restart-conversation':
      const { restartConversation } = await import('./globalFunctions')
      return restartConversation
    case 'set-context':
      const { setContext } = await import('./globalFunctions')
      return setContext

    // START COMMON
    case 'none-of-these':
      const { noneOfThese } = await import('./common/commonFallback')
      return noneOfThese
    case 'Default Fallback Intent':
      const { commonFallback } = await import('./common/commonFallback')
      return commonFallback
    case 'feedback-root':
      moduleImport = await import('./common/feedback')
      return moduleImport.feedbackRoot
    case 'feedback-helpful':
      const { feedbackHelpful } = await import('./common/feedback')
      return feedbackHelpful
    case 'feedback-not-helpful':
      const { feedbackNotHelpful } = await import('./common/feedback')
      return feedbackNotHelpful
    case 'feedback-complete':
      const { feedbackComplete } = await import('./common/feedback')
      return feedbackComplete
    case 'complaints-root':
      moduleImport = await import('./common/feedback')
      return moduleImport.feedbackRoot
    case 'map-deliver-map':
      const { mapDeliverMap } = await import('../intentHandlers/common/map')
      subjectMatterLocationsModule = await import('../constants/constants')
      return mapDeliverMap(subjectMatter, subjectMatterLocationsModule.subjectMatterLocations[subjectMatter])
    case 'map-deliver-map-county-office':
      const { mapDeliverMapAndCountyOffice } = await import('../intentHandlers/common/map')
      subjectMatterLocationsModule = await import('../constants/constants')
      return mapDeliverMapAndCountyOffice(subjectMatter, subjectMatterLocationsModule.subjectMatterLocations[subjectMatter])

    // START MSCJ

    default:
      return null
  }
}