import { Suggestion, Payload } from 'dialogflow-fulfillment'
import { subjectMatterContexts, subjectMatterLabels } from '../constants/constants'
import { map } from 'lodash'

import admin from 'firebase-admin'
const db = admin.firestore()

const getSessionIdFromPath = path => /[^/]*$/.exec(path)[0]

export const handleEndConversation = async (agent: Agent) => {
  const helpMessage = 'Is there anything else I can help you with today?'

  agent.add(helpMessage)
  agent.add(new Suggestion('Submit Feedback'))

  await agent.context.set({
    name: 'waiting-feedback-root',
    lifespan: 2,
  })
  await agent.context.set({
    name: 'waiting-restart-conversation',
    lifespan: 2,
  })
}

export const tbd = async (agent: Agent) => {
  const tbdMessage = 'At this time, I am not able to answer specific questions about your case.'
  agent.add(tbdMessage)
  await handleEndConversation(agent)
}

export const setContext = async (agent: Agent) => {
  const sessionId = getSessionIdFromPath(agent.session)
  const preloadedContexts = await db.collection('preloadedContexts').doc(sessionId).get()
  if (preloadedContexts.exists) {
    const data = preloadedContexts.data()
    data.contexts.forEach(context => {
      agent.context.set({
        name: context,
        lifespan: 1,
      })
    })
  } else {
    console.log(`Unable to fetch contexts for ${sessionId}`)
  }

  const tbdMessage = 'At this time, I am not able to answer specific questions about your case.'
  agent.add(tbdMessage)
}

// Upper case the first letter of a string
export const toTitleCase = string => {
  const excludedWords = ['or', 'and', 'on', 'of', 'to', 'the']
  return string.replace(/\w\S*/g, text => {
    if (!excludedWords.includes(text)) {
      return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()
    } else {
      return text
    }
  })
}

// Format any number as currency, with prefixed $ sign, commas added per thousands & decimals fixed to 2
export const formatCurrency = num => {
  return (
    '$' +
    parseFloat(num)
      .toFixed(2)
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  )
}

// Send a payload to disable user input and require suggestion selection
export const disableInput = async (agent: Agent) => {
  try {
    agent.add(
      new Payload(
        agent.UNSPECIFIED,
        { disableInput: 'true' },
        {
          sendAsMessage: true,
          rawPayload: true,
        }
      )
    )
  } catch (err) {
    console.error(err.message, err)
  }
}

// Handles default unhandled intent when no categories are found
export const defaultFallback = async (agent: Agent) => {
  try {
    // This is the default message, but it should never be used. There should always be a subject matter
    let message = 'I\'m sorry, I\'m not familiar with that right now, but I\'m still learning! I can help answer a wide variety of questions; \
    <strong>please try rephrasing</strong> or click on one of the options provided.'

    agent.add(message)
  } catch (err) {
    console.error(err.message, err)
  }
}

export const restartConversation = async (agent: Agent) => {
  try {
    await startRootConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

export const globalRestart = async (agent: Agent) => {
  try {
    await startRootConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}


export const welcome = async (agent: Agent) => {
  const termsAndConditionsLink = 'http://www.replace-this.com'

  try {
    agent.add(
      'Hi, I\'m <<Bot>>. I am not a real person, but I can help you with Mississippi Center for Justice requests.'
    )

    agent.add(
      'The information I provide is not legal advice. Also, <b>please do not enter SSN or DOB information at any time during your conversations with me</b>.'
    )

    agent.add(
      `By clicking "I Acknowledge" below you are acknowledging receipt and understanding of these statements and the MSCJ Website \
      Disclaimers, Terms, and Conditions found <a href="${termsAndConditionsLink}" target="_blank">here</a>, and that you wish to continue.`
    )

    await disableInput(agent)
    agent.add(new Suggestion('I ACKNOWLEDGE'))

    await agent.context.set({
      name: 'waiting-acknowledge-privacy-statement',
      lifespan: 1,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}

export const selectSubjectMatter = async (agent: Agent) => {
  await disableInput(agent)

  // Add a suggestion for each of the system's subject matters
  const suggestionPromises = map(subjectMatterLabels, async label => agent.add(new Suggestion(label)))

  // Remove all subject matter related contexts
  const contextPromises = map(subjectMatterContexts, async context => (
    agent.context.set({
      name: context,
      lifespan: 0
    })
  ))

  await agent.context.set({
    name: 'waiting-subjectMatter',
    lifespan: 1,
  })

  await agent.context.set({
    name: 'mscj-enableHome',
    lifespan: 1,
  })

  await Promise.all([...suggestionPromises, ...contextPromises])
}

export const acknowledgePrivacyStatement = async (agent: Agent) => {
  try {
    agent.add('Great! Select one of the options below.')
    await selectSubjectMatter(agent)
    // await startRootConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

// Handle startOfConversation
export const startRootConversation = async (agent: Agent) => {
  try {
    agent.add('Select one of the options below.')
    await selectSubjectMatter(agent)
    // await startRootConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}
