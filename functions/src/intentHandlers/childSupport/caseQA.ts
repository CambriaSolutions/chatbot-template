import {
  supportReviewPayments,
  supportInquiries,
  supportType,
} from './support'

export const caseQAIncreaseReview = async (agent: Agent) => {
  try {
    await supportReviewPayments(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

export const caseQAGeneralSupportRequest = async (agent: Agent) => {
  try {
    await supportInquiries(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

export const caseQAChangePersonalInfo = async (agent: Agent) => {
  try {
    await supportType(agent, 'change personal information')
  } catch (err) {
    console.error(err.message, err)
  }
}

export const caseQAComplianceSupportRequest = async (agent: Agent) => {
  try {
    await supportInquiries(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}
