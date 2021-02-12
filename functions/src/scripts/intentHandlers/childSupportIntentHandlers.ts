import { mapRoot } from '../../intentHandlers/common/map'

// Payment calculator intents
import {
  pmtCalcRoot,
  pmtCalcRootRestart,
  pmtCalcIncomeTerm,
  pmtCalcGrossIncome,
  pmtCalcTaxDeductions,
  pmtCalcSSDeductions,
  pmtCalcRetirementContributions,
  pmtCalcChildSupport,
  pmtCalcChildSupportNoRetirement,
  pmtCalcFinalEstimation,
  pmtCalcFinalEstimationNoOtherChildren,
} from '../../intentHandlers/childSupport/paymentsCalculator'

// Payment methods intents
import {
  pmtMethodsCantMakeQualifying,
  pmtMethodsCantMakeQualifyingHelp,
  pmtMethodsCantMakeQualifyingNoHelp,
  pmtMethodsCheckOrMoneyOrder,
  pmtMethodsMailAddress
} from '../../intentHandlers/childSupport/paymentMethods'

// Close Child Support Case
import { closeCSCQACloseCase } from '../../intentHandlers/childSupport/closeChildSupportCase'

// Case specific intents
import {
  caseQAIncreaseReview,
  caseQAChangePersonalInfo,
  caseQAComplianceSupportRequest,
} from '../../intentHandlers/childSupport/caseQA'

// Appointments intents
import {
  apptsOfficeLocationsHandoff,
} from '../../intentHandlers/childSupport/appointments'

// Support intents
import {
  supportRoot,
  supportParentReceivingMore,
  supportParentPayingMore,
  supportEditProviderEmployment,
  supportReportProviderEmployment,
  supportHandleEmploymentStatus,
  supportCollectNewEmployerName,
  supportNoNewEmployer,
  supportNewEmployerUnknownPhone,
  supportCollectNewEmployerPhone,
  supportType,
  supportCollectCompanyName,
  supportCollectFirstName,
  supportCollectLastName,
  //supportCollectName,
  supportPhoneNumber,
  supportNoPhoneNumber,
  supportCaseNumber,
  supportNoCaseNumber,
  supportEmail,
  supportNoEmail,
  supportHandlePhoneRetry,
  supportHandleEmailRetry,
  supportCollectIssue,
  // supportSummarizeIssue,
  // supportReviseIssue,
  supportSubmitIssue,
  supportSubmitSupportRequestCooperation,
  supportSubmitSupportRequestInquiry,
  supportSubmitSupportRequestSafety,
  supportSubmitSupportRequestGoodCause,
  supportSubmitSupportRequestVerification,
  supportSubmitSupportRequestInterstate,
  supportSubmitSupportRequestRequestPaymentHistory,
} from '../../intentHandlers/childSupport/support'

// EppiCard intents
import { eppiFees } from '../../intentHandlers/childSupport/eppiCard'

// IWO intents
import {
  iwoIsSupporting,
  iwoInArrears,
  iwoConfirmEstimate,
  iwoDisposableIncome,
  iwoQAArrearsBalance,
} from '../../intentHandlers/childSupport/incomeWithholding'

// Contact QA
import {
  contactSupportHandoff,
} from '../../intentHandlers/childSupport/contactQA'

// Payments QA
import {
  pmtQAHaventReceived,
  pmtQAPaymentReduction,
  pmtQAYesPaymentReduction,
  pmtQAOver21,
  pmtQAEmployerPaymentStatus,
  pmtQAYesEmployerPaymentStatus,
  pmtQANCPPaymentStatus
} from '../../intentHandlers/childSupport/paymentsQA'

// TBD
import { childCare } from '../../intentHandlers/childSupport/childCare'
import { fee } from '../../intentHandlers/childSupport/fee'
import { legal } from '../../intentHandlers/childSupport/legal'

export const childSupportIntentHandlers = {
  // Contact number intents
  'cse-contact-support-handoff': contactSupportHandoff,

  // Payment calculation intents
  'cse-pmt-calc-root': pmtCalcRoot,
  'cse-pmt-calc-restart': pmtCalcRootRestart,
  'cse-pmt-calc-income-term': pmtCalcIncomeTerm,
  'cse-pmt-calc-gross-income': pmtCalcGrossIncome,
  'cse-pmt-calc-tax-deductions': pmtCalcTaxDeductions,
  'cse-pmt-calc-ss-deductions': pmtCalcSSDeductions,
  'cse-pmt-calc-retirement-contributions': pmtCalcRetirementContributions,
  'cse-pmt-calc-child-support': pmtCalcChildSupport,
  'cse-pmt-calc-child-support-no-retirement': pmtCalcChildSupportNoRetirement,
  'cse-pmt-calc-final-estimation': pmtCalcFinalEstimation,

  'cse-pmt-calc-final-estimation-no-other-children': pmtCalcFinalEstimationNoOtherChildren,

  // IWO intents
  'cse-iwo-confirm-estimate': iwoConfirmEstimate,
  'cse-iwo-is-supporting': iwoIsSupporting,
  'cse-iwo-in-arrears': iwoInArrears,
  'cse-iwo-disposable-income': iwoDisposableIncome,
  'cse-iwoQA-arrears-balance': iwoQAArrearsBalance,

  // Payment methods intents
  'cse-pmtMethods-checkOrMoneyOrder': pmtMethodsCheckOrMoneyOrder,
  'cse-pmtMethods-mail-address': pmtMethodsMailAddress,
  'cse-pmtMethods-cant-make-qualifying': pmtMethodsCantMakeQualifying,
  'cse-pmtMethods-cant-make-qualifying-help': pmtMethodsCantMakeQualifyingHelp,
  'cse-pmtMethods-cant-make-qualifying-no-help': pmtMethodsCantMakeQualifyingNoHelp,

  // Open a Child Support Case
  'cse-close-cscQA-close-case': closeCSCQACloseCase,

  // Appointment intents
  'cse-appts-office-locations-handoff': apptsOfficeLocationsHandoff,

  // Support intents
  'cse-support-root': supportRoot,
  'cse-support-parent-paying-more': supportParentPayingMore,
  'cse-support-parent-receiving-more': supportParentReceivingMore,
  'cse-support-handle-employment-status': supportHandleEmploymentStatus,
  'cse-support-collect-new-employer-name': supportCollectNewEmployerName,
  'cse-support-no-new-employer': supportNoNewEmployer,
  'cse-support-new-employer-unknown-phone': supportNewEmployerUnknownPhone,
  'cse-support-collect-new-employer-phone': supportCollectNewEmployerPhone,
  'cse-support-type': supportType,
  'cse-support-collect-company-name': supportCollectCompanyName,
  // 'support-collect-name': supportCollectName,
  'cse-support-collect-first-name': supportCollectFirstName,
  'cse-support-collect-last-name': supportCollectLastName,
  'cse-support-phone-number': supportPhoneNumber,
  'cse-support-no-phone-number': supportNoPhoneNumber,
  'cse-support-email': supportEmail,
  'cse-support-no-email': supportNoEmail,
  'cse-support-handle-email-retry': supportHandleEmailRetry,
  'cse-support-handle-phone-retry': supportHandlePhoneRetry,
  'cse-support-case-number': supportCaseNumber,
  'cse-support-no-case-number': supportNoCaseNumber,
  'cse-support-collect-issue': supportCollectIssue,
  // 'support-revise-issue': supportReviseIssue,
  'cse-support-submit-issue': supportSubmitIssue,
  'cse-support-edit-provider-employment': supportEditProviderEmployment,
  'cse-support-report-provider-employment': supportReportProviderEmployment,
  'cse-support-submitSupportRequest-cooperation': supportSubmitSupportRequestCooperation,
  'cse-support-submitSupportRequest-inquiry': supportSubmitSupportRequestInquiry,
  'cse-support-submitSupportRequest-safety': supportSubmitSupportRequestSafety,
  'cse-support-submitSupportRequest-goodCause': supportSubmitSupportRequestGoodCause,
  'cse-support-submitSupportRequest-verification': supportSubmitSupportRequestVerification,
  'cse-support-submitSupportRequest-interstate': supportSubmitSupportRequestInterstate,
  'cse-support-submitSupportRequest-requestPaymentHistory': supportSubmitSupportRequestRequestPaymentHistory,

  // Case specific intents
  'cse-caseQA-increase-review': caseQAIncreaseReview,
  'cse-caseQA-change-personal-info': caseQAChangePersonalInfo,
  'cse-caseQA-compliance-support-request': caseQAComplianceSupportRequest,

  // EppiCard intents
  'cse-eppi-fees': eppiFees,


  // Payments QA intents
  'cse-pmtQA-havent-received': pmtQAHaventReceived,
  'cse-pmtQA-payment-reduction': pmtQAPaymentReduction,
  'cse-pmtQA-yes-payment-reduction': pmtQAYesPaymentReduction,
  'cse-pmtQA-over-21': pmtQAOver21,
  'cse-pmtQA-employer-payment-status': pmtQAEmployerPaymentStatus,
  'cse-pmtQA-yes-employer-payment-status': pmtQAYesEmployerPaymentStatus,
  'cse-pmtQA-NCP-payment-status': pmtQANCPPaymentStatus,

  // Childcare
  'cse-childCare-root': childCare,

  // Fee
  'cse-fee-root': fee,

  // Legal
  'cse-legal-root': legal,

  // Map
  'cse-map-root': mapRoot('cse')
}

