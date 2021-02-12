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
    case 'casey-handoff':
      const { caseyHandoff } = await import('./globalFunctions')
      return caseyHandoff
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
    case 'doc-upload':
      const { docUpload } = await import('./common/docUpload')
      return docUpload
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

    // START CSE
    case 'cse-contact-support-handoff':
      const { contactSupportHandoff } = await import('./childSupport/contactQA')
      return contactSupportHandoff
    case 'cse-pmt-calc-root':
      const { pmtCalcRoot } = await import('./childSupport/paymentsCalculator')
      return pmtCalcRoot
    case 'cse-pmt-calc-restart':
      const { pmtCalcRootRestart } = await import('./childSupport/paymentsCalculator')
      return pmtCalcRootRestart
    case 'cse-pmt-calc-income-term':
      const { pmtCalcIncomeTerm } = await import('./childSupport/paymentsCalculator')
      return pmtCalcIncomeTerm
    case 'cse-pmt-calc-gross-income':
      const { pmtCalcGrossIncome } = await import('./childSupport/paymentsCalculator')
      return pmtCalcGrossIncome
    case 'cse-pmt-calc-tax-deductions':
      const { pmtCalcTaxDeductions } = await import('./childSupport/paymentsCalculator')
      return pmtCalcTaxDeductions
    case 'cse-pmt-calc-ss-deductions':
      const { pmtCalcSSDeductions } = await import('./childSupport/paymentsCalculator')
      return pmtCalcSSDeductions
    case 'cse-pmt-calc-retirement-contributions':
      const { pmtCalcRetirementContributions } = await import('./childSupport/paymentsCalculator')
      return pmtCalcRetirementContributions
    case 'cse-pmt-calc-child-support':
      const { pmtCalcChildSupport } = await import('./childSupport/paymentsCalculator')
      return pmtCalcChildSupport
    case 'cse-pmt-calc-child-support-no-retirement':
      const { pmtCalcChildSupportNoRetirement } = await import('./childSupport/paymentsCalculator')
      return pmtCalcChildSupportNoRetirement
    case 'cse-pmt-calc-final-estimation':
      const { pmtCalcFinalEstimation } = await import('./childSupport/paymentsCalculator')
      return pmtCalcFinalEstimation
    case 'cse-pmt-calc-final-estimation-no-other-children':
      const { pmtCalcFinalEstimationNoOtherChildren } = await import('./childSupport/paymentsCalculator')
      return pmtCalcFinalEstimationNoOtherChildren
    case 'cse-iwo-confirm-estimate':
      const { iwoConfirmEstimate } = await import('./childSupport/incomeWithholding')
      return iwoConfirmEstimate
    case 'cse-iwo-is-supporting':
      const { iwoIsSupporting } = await import('./childSupport/incomeWithholding')
      return iwoIsSupporting
    case 'cse-iwo-in-arrears':
      const { iwoInArrears } = await import('./childSupport/incomeWithholding')
      return iwoInArrears
    case 'cse-iwo-disposable-income':
      const { iwoDisposableIncome } = await import('./childSupport/incomeWithholding')
      return iwoDisposableIncome
    case 'cse-iwoQA-arrears-balance':
      const { iwoQAArrearsBalance } = await import('./childSupport/incomeWithholding')
      return iwoQAArrearsBalance
    case 'cse-pmtMethods-checkOrMoneyOrder':
      const { pmtMethodsCheckOrMoneyOrder } = await import('./childSupport/paymentMethods')
      return pmtMethodsCheckOrMoneyOrder
    case 'cse-pmtMethods-mail-address':
      const { pmtMethodsMailAddress } = await import('./childSupport/paymentMethods')
      return pmtMethodsMailAddress
    case 'cse-pmtMethods-cant-make-qualifying':
      const { pmtMethodsCantMakeQualifying } = await import('./childSupport/paymentMethods')
      return pmtMethodsCantMakeQualifying
    case 'cse-pmtMethods-cant-make-qualifying-help':
      const { pmtMethodsCantMakeQualifyingHelp } = await import('./childSupport/paymentMethods')
      return pmtMethodsCantMakeQualifyingHelp
    case 'cse-pmtMethods-cant-make-qualifying-no-help':
      const { pmtMethodsCantMakeQualifyingNoHelp } = await import('./childSupport/paymentMethods')
      return pmtMethodsCantMakeQualifyingNoHelp
    case 'cse-close-cscQA-close-case':
      const { closeCSCQACloseCase } = await import('./childSupport/closeChildSupportCase')
      return closeCSCQACloseCase
    case 'cse-appts-office-locations-handoff':
      const { apptsOfficeLocationsHandoff } = await import('./childSupport/appointments')
      return apptsOfficeLocationsHandoff
    case 'cse-support-root':
      const { supportRoot } = await import('./childSupport/support')
      return supportRoot
    case 'cse-support-parent-paying-more':
      const { supportParentPayingMore } = await import('./childSupport/support')
      return supportParentPayingMore
    case 'cse-support-parent-receiving-more':
      const { supportParentReceivingMore } = await import('./childSupport/support')
      return supportParentReceivingMore
    case 'cse-support-handle-employment-status':
      const { supportHandleEmploymentStatus } = await import('./childSupport/support')
      return supportHandleEmploymentStatus
    case 'cse-support-collect-new-employer-name':
      const { supportCollectNewEmployerName } = await import('./childSupport/support')
      return supportCollectNewEmployerName
    case 'cse-support-no-new-employer':
      const { supportNoNewEmployer } = await import('./childSupport/support')
      return supportNoNewEmployer
    case 'cse-support-new-employer-unknown-phone':
      const { supportNewEmployerUnknownPhone } = await import('./childSupport/support')
      return supportNewEmployerUnknownPhone
    case 'cse-support-collect-new-employer-phone':
      const { supportCollectNewEmployerPhone } = await import('./childSupport/support')
      return supportCollectNewEmployerPhone
    case 'cse-support-type':
      const { supportType } = await import('./childSupport/support')
      return supportType
    case 'cse-support-collect-company-name':
      const { supportCollectCompanyName } = await import('./childSupport/support')
      return supportCollectCompanyName
    case 'cse-support-collect-first-name':
      const { supportCollectFirstName } = await import('./childSupport/support')
      return supportCollectFirstName
    case 'cse-support-collect-last-name':
      const { supportCollectLastName } = await import('./childSupport/support')
      return supportCollectLastName
    case 'cse-support-phone-number':
      const { supportPhoneNumber } = await import('./childSupport/support')
      return supportPhoneNumber
    case 'cse-support-no-phone-number':
      const { supportNoPhoneNumber } = await import('./childSupport/support')
      return supportNoPhoneNumber
    case 'cse-support-email':
      const { supportEmail } = await import('./childSupport/support')
      return supportEmail
    case 'cse-support-no-email':
      const { supportNoEmail } = await import('./childSupport/support')
      return supportNoEmail
    case 'cse-support-handle-email-retry':
      const { supportHandleEmailRetry } = await import('./childSupport/support')
      return supportHandleEmailRetry
    case 'cse-support-handle-phone-retry':
      const { supportHandlePhoneRetry } = await import('./childSupport/support')
      return supportHandlePhoneRetry
    case 'cse-support-case-number':
      const { supportCaseNumber } = await import('./childSupport/support')
      return supportCaseNumber
    case 'cse-support-no-case-number':
      const { supportNoCaseNumber } = await import('./childSupport/support')
      return supportNoCaseNumber
    case 'cse-support-collect-issue':
      const { supportCollectIssue } = await import('./childSupport/support')
      return supportCollectIssue
    case 'cse-support-submit-issue':
      const { supportSubmitIssue } = await import('./childSupport/support')
      return supportSubmitIssue
    case 'cse-support-edit-provider-employment':
      const { supportEditProviderEmployment } = await import('./childSupport/support')
      return supportEditProviderEmployment
    case 'cse-support-report-provider-employment':
      const { supportReportProviderEmployment } = await import('./childSupport/support')
      return supportReportProviderEmployment
    case 'cse-support-submitSupportRequest-cooperation':
      const { supportSubmitSupportRequestCooperation } = await import('./childSupport/support')
      return supportSubmitSupportRequestCooperation
    case 'cse-support-submitSupportRequest-inquiry':
      const { supportSubmitSupportRequestInquiry } = await import('./childSupport/support')
      return supportSubmitSupportRequestInquiry
    case 'cse-support-submitSupportRequest-safety':
      const { supportSubmitSupportRequestSafety } = await import('./childSupport/support')
      return supportSubmitSupportRequestSafety
    case 'cse-support-submitSupportRequest-goodCause':
      const { supportSubmitSupportRequestGoodCause } = await import('./childSupport/support')
      return supportSubmitSupportRequestGoodCause
    case 'cse-support-submitSupportRequest-verification':
      const { supportSubmitSupportRequestVerification } = await import('./childSupport/support')
      return supportSubmitSupportRequestVerification
    case 'cse-support-submitSupportRequest-interstate':
      const { supportSubmitSupportRequestInterstate } = await import('./childSupport/support')
      return supportSubmitSupportRequestInterstate
    case 'cse-support-submitSupportRequest-requestPaymentHistory':
      const { supportSubmitSupportRequestRequestPaymentHistory } = await import('./childSupport/support')
      return supportSubmitSupportRequestRequestPaymentHistory
    case 'cse-caseQA-increase-review':
      const { caseQAIncreaseReview } = await import('./childSupport/caseQA')
      return caseQAIncreaseReview
    case 'cse-caseQA-change-personal-info':
      const { caseQAChangePersonalInfo } = await import('./childSupport/caseQA')
      return caseQAChangePersonalInfo
    case 'cse-caseQA-compliance-support-request':
      const { caseQAComplianceSupportRequest } = await import('./childSupport/caseQA')
      return caseQAComplianceSupportRequest
    case 'cse-eppi-fees':
      const { eppiFees } = await import('./childSupport/eppiCard')
      return eppiFees
    case 'cse-pmtQA-havent-received':
      const { pmtQAHaventReceived } = await import('./childSupport/paymentsQA')
      return pmtQAHaventReceived
    case 'cse-pmtQA-payment-reduction':
      const { pmtQAPaymentReduction } = await import('./childSupport/paymentsQA')
      return pmtQAPaymentReduction
    case 'cse-pmtQA-yes-payment-reduction':
      const { pmtQAYesPaymentReduction } = await import('./childSupport/paymentsQA')
      return pmtQAYesPaymentReduction
    case 'cse-pmtQA-over-21':
      const { pmtQAOver21 } = await import('./childSupport/paymentsQA')
      return pmtQAOver21
    case 'cse-pmtQA-employer-payment-status':
      const { pmtQAEmployerPaymentStatus } = await import('./childSupport/paymentsQA')
      return pmtQAEmployerPaymentStatus
    case 'cse-pmtQA-yes-employer-payment-status':
      const { pmtQAYesEmployerPaymentStatus } = await import('./childSupport/paymentsQA')
      return pmtQAYesEmployerPaymentStatus
    case 'cse-pmtQA-NCP-payment-status':
      const { pmtQANCPPaymentStatus } = await import('./childSupport/paymentsQA')
      return pmtQANCPPaymentStatus
    case 'cse-childCare-root':
      const { childCare } = await import('./childSupport/childCare')
      return childCare
    case 'cse-fee-root':
      const { fee } = await import('./childSupport/fee')
      return fee
    case 'cse-legal-root':
      const { legal } = await import('./childSupport/legal')
      return legal
    case 'cse-map-root':
      moduleImport = await import('./common/map')
      return moduleImport.mapRoot('cse')

    // START TANF
    case 'tanf-root':
      const { tanfRoot } = await import('./tanf/tanfRoot')
      return tanfRoot
    case 'tanf-eligibilityChecker':
      moduleImport = await import('./common/eligibilityChecker')
      return moduleImport.eligibilityChecker
    case 'tanf-pebt-root':
      moduleImport = await import('./common/pebt')
      return moduleImport.pebtRoot
    case 'tanf-map-root':
      moduleImport = await import('./common/map')
      return moduleImport.mapRoot('tanf')

    // START SNAP
    case 'snap-root':
      const { snapRoot } = await import('./snap/snapRoot')
      return snapRoot
    case 'snap-eligibilityChecker':
      moduleImport = await import('./common/eligibilityChecker')
      return moduleImport.eligibilityChecker
    case 'snap-pebt-root':
      moduleImport = await import('./common/pebt')
      return moduleImport.pebtRoot
    case 'snap-map-root':
      moduleImport = await import('./common/map')
      return moduleImport.mapRoot('snap')

    // START WFD 
    case 'wfd-map-root':
      moduleImport = await import('./common/map')
      return moduleImport.mapRoot('wfd')

    default:
      return null
  }
}