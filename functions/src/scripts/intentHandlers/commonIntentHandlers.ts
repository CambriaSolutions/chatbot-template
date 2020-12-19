import { commonFallback, noneOfThese } from '../../intentHandlers/common/commonFallback'

// Feedback
import {
  feedbackRoot,
  feedbackHelpful,
  feedbackNotHelpful,
  feedbackComplete,
} from '../../intentHandlers/common/feedback'

export const commonIntentHandlers = {
  'none-of-these': noneOfThese,
  'Default Fallback Intent': commonFallback,

  // Feedback intents
  'feedback-root': feedbackRoot,
  'feedback-helpful': feedbackHelpful,
  'feedback-not-helpful': feedbackNotHelpful,
  'feedback-complete': feedbackComplete,

  // Complaints
  'complaints-root': feedbackRoot,
}