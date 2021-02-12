import { Suggestion } from 'dialogflow-fulfillment'
import { handleEndConversation } from '../globalFunctions'
import {
  supportInquiries,
  supportReviewPayments
} from './support'

export const pmtQAHaventReceived = async (agent: Agent) => {
  try {
    await agent.add(
      'Parents who pay support have the full month to pay. If you would like more information, then please call <a href="tel:+18778824916">1-877-882-4916</a>.'
    )
    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

export const pmtQAPaymentReduction = async (agent: Agent) => {
  try {
    await agent.add(
      'I can help you submit a request to have your case reviewed to see if a modification is appropriate. Please note that this can modify your payments upwards or downwards. Would you like to continue?'
    )
    await agent.add(new Suggestion('Yes'))
    await agent.add(new Suggestion('No'))

    await agent.context.set({
      name: 'waiting-pmtQA-yes-payment-reduction',
      lifespan: 2,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}

export const pmtQAYesPaymentReduction = async (agent: Agent) => {
  try {
    const continuePaymentReduction = agent.parameters.continuePaymentReduction
    if (continuePaymentReduction === 'yes') {
      await supportReviewPayments(agent)
    } else {
      await handleEndConversation(agent)
    }
  } catch (err) {
    console.error(err.message, err)
  }
}

export const pmtQAOver21 = async (agent: Agent) => {
  try {
    await agent.add(
      'If you owe back child support, you still have to pay that support. There are other special circumstances that may also require continued payments. If you would like more information, I can help you submit a support request.'
    )
    await agent.add(new Suggestion('Submit Support Request'))
    await agent.context.set({
      name: 'waiting-support-submitSupportRequest-inquiry',
      lifespan: 1
    })
    await agent.context.set({
      name: 'waiting-restart-conversation',
      lifespan: 2,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}

export const pmtQAEmployerPaymentStatus = async (agent: Agent) => {
  try {
    await agent.add('Have you reported your employer to CSE?')
    await agent.add(new Suggestion('Yes'))
    await agent.add(new Suggestion('No'))

    await agent.context.set({
      name: 'waiting-pmtqa-yes-employer-payment-status',
      lifespan: 2,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}

export const pmtQAYesEmployerPaymentStatus = async (agent: Agent) => {
  try {
    const reportCSE = agent.parameters.reportCSE

    if (reportCSE === 'yes') {
      await supportInquiries(agent)
    } else {
      await agent.context.set({
        name: 'ticketinfo',
        lifespan: 100,
        parameters: {
          supportType: 'Change of Employment Status',
          employmentChangeType: 'Change Or Add Employer',
        },
      })
      await agent.add('Which of the following applies to you?')
      await agent.add(new Suggestion('Full Time to Part Time'))
      await agent.add(new Suggestion('Part Time to Full Time'))
      await agent.add(new Suggestion('Loss of Employer'))
      await agent.add(new Suggestion('Change or Add Employer'))
      await agent.context.set({
        name: 'waiting-support-handle-employment-status',
        lifespan: 3,
      })
    }
  } catch (err) {
    console.error(err.message, err)
  }
}

export const pmtQANCPPaymentStatus = async (agent: Agent) => {
  try {
    await agent.add('Click <a href="https://www.eppicard.com/" target="_blank">here</a> to check your EPPI card statement.')
    await agent.add('At this time, I cannot answer this question. However, I can help you get the answer to this question through submitting a support ticket.')

    await agent.add(new Suggestion('Submit Support Request'))

    await agent.context.set({
      name: 'waiting-support-submitSupportRequest-inquiry',
      lifespan: 1
    })
    await agent.context.set({
      name: 'waiting-restart-conversation',
      lifespan: 2,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}
