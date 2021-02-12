import { Suggestion } from 'dialogflow-fulfillment'
import { handleEndConversation } from '../globalFunctions'
import { supportInquiries, supportReviewPayments } from './support'

export const pmtMethodsCantMakeQualifying = async (agent: Agent) => {
  try {
    const qualifying = agent.parameters.qualifying
    if (qualifying === 'yes') {
      await agent.add(
        'Would you like to submit a request for your child support amount to be reviewed?'
      )
      await agent.add(new Suggestion('Yes'))
      await agent.add(new Suggestion('No'))
      await agent.context.set({
        name: 'waiting-pmtMethods-cant-make-qualifying-help',
        lifespan: 2,
      })
    } else {
      await agent.add(
        'Would you like to submit an inquiry to our support team for additional information about your options for making child support payments?'
      )
      await agent.add(new Suggestion('Yes'))
      await agent.add(new Suggestion('No'))
      await agent.context.set({
        name: 'waiting-pmtMethods-cant-make-qualifying-no-help',
        lifespan: 2,
      })
    }
  } catch (err) {
    console.error(err.message, err)
  }
}

export const pmtMethodsCantMakeQualifyingNoHelp = async (agent: Agent) => {
  try {
    const needsInquiry = agent.parameters.needsInquiry
    if (needsInquiry === 'yes') {
      await supportInquiries(agent)
    } else {
      await agent.add(
        'Click <a href="https://www.mississippiworks.org/" target="_blank">here</a> to visit MS Works for help with employment.'
      )
      await handleEndConversation(agent)
    }
  } catch (err) {
    console.error(err.message, err)
  }
}

export const pmtMethodsCantMakeQualifyingHelp = async (agent: Agent) => {
  try {
    const needsHelp = agent.parameters.needsHelp
    if (needsHelp === 'yes') {
      await supportReviewPayments(agent)
    } else {
      await handleEndConversation(agent)
    }
  } catch (err) {
    console.error(err.message, err)
  }
}

export const pmtMethodsCheckOrMoneyOrder = async (agent, isGlobal = false) => {
  try {
    await agent.add(
      `Please mail to:  
      MDHS/SDU  
      P.O. Box 23094  
      Jackson, MS 39225  `
    )
    await agent.add(
      'Make sure to include your Social Security Number AND Case Number.'
    )
    await handleEndConversation(agent)
    if (isGlobal !== true) {
      await agent.add(new Suggestion('Other Options'))
    }
  } catch (err) {
    console.error(err.message, err)
  }
}

// This is for the mail address intent
export const pmtMethodsMailAddress = async (agent: Agent) => {
  const isGlobal = true
  await pmtMethodsCheckOrMoneyOrder(agent, isGlobal)
}
