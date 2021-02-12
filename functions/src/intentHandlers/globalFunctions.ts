import { Suggestion, Payload } from 'dialogflow-fulfillment'
import { getSubjectMatter } from '../utils/getSubjectMatter'
import { subjectMatterContexts, subjectMatterLabels } from '../constants/constants'
import { map } from 'lodash'

import admin from 'firebase-admin'
const db = admin.firestore()

const getSessionIdFromPath = path => /[^/]*$/.exec(path)[0]

export const handleEndConversation = async (agent: Agent) => {
  const helpMessage = 'Is there anything else I can help you with today?'

  await agent.add(helpMessage)
  await agent.add(new Suggestion('Submit Feedback'))

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
  const tbdMessage = 'At this time, I am not able to answer specific questions about your case. If you are seeking information MDHS programs, please visit www.mdhs.ms.gov or contact us <a href="https://www.mdhs.ms.gov/contact/" target="_blank">here</a>'
  await agent.add(tbdMessage)
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

  const tbdMessage = 'At this time, I am not able to answer specific questions about your case. If you are seeking information MDHS programs, please visit www.mdhs.ms.gov or contact us <a href="https://www.mdhs.ms.gov/contact/" target="_blank">here</a>'
  await agent.add(tbdMessage)
}

// Used to calculate the percentage of income for employers to withhold
export const calculatePercentage = (isSupporting, inArrears) => {
  if (isSupporting && inArrears) {
    return 55
  } else if (isSupporting && !inArrears) {
    return 50
  } else if (!isSupporting && !inArrears) {
    return 60
  } else if (!isSupporting && inArrears) {
    return 65
  } else {
    throw new Error('Cannot calculate percentage.')
  }
}

// Used to validate that the user has provided a valid case number
// Valid case numbers start with a 6, are nine digits long, and may have
// a letter of the alphabet at the end.
export const validateCaseNumber = caseNumber => {
  let validCaseNumber = true
  if (caseNumber.charAt(0) !== '6') {
    validCaseNumber = false
  }
  if (caseNumber.length !== 9 && caseNumber.length !== 10) {
    validCaseNumber = false
  }
  if (
    caseNumber.length === 10 &&
    caseNumber.charAt(9).match(/[a-z]/g === null)
  ) {
    validCaseNumber = false
  }
  if (caseNumber.length === 10) {
    const numberWithoutAlpha = caseNumber.slice(0, 9)

    if (isNaN(numberWithoutAlpha)) {
      validCaseNumber = false
    }
  }
  if (caseNumber.length === 9 && isNaN(caseNumber)) {
    validCaseNumber = false
  }
  return validCaseNumber
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

// Format description text for Support Requests
export const formatDescriptionText = supportType => {
  let descriptionText
  if (supportType === 'request contempt action') {
    descriptionText =
      'Please describe your request for assistance regarding your Request for Contempt Action.'
  } else if (supportType === 'child support increase or decrease') {
    descriptionText =
      'Please describe your request for review of your child support payments.'
  } else if (supportType === 'change personal information') {
    descriptionText =
      'Please share with me the changes to your personal information. I can record changes that apply for the parent who pays or receives child support.'
  } else if (supportType === 'request payment history or record') {
    descriptionText =
      'What do you need exactly regarding payment history or payment records?'
  } else if (
    supportType === 'report information about the parent who pays support'
  ) {
    descriptionText = 'What information do you want to share regarding the parent who pays child support? Helpful information includes this parent\'s address and phone number, employer information, asset information or information about this parent\'s ability to work.'
  } else if (supportType === 'request case closure') {
    descriptionText =
      'What information do you want to share regarding your request for case closure?'
  } else if (supportType === 'add authorized user') {
    descriptionText =
      'Please tell us the name and relationship of the person you are authorizing.'
  } else {
    descriptionText = 'Please describe your request.'
  }
  return descriptionText
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
    await agent.add(
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

// Directs the user to Casey
export const caseyHandoff = async (agent: Agent) => {
  try {
    await agent.add(
      'Click <a href="https://mdhs-policysearch.web.app" target="_blank">Here</a> to search the Child Support Policy Manual'
    )
    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

// Handles default unhandled intent when no categories are found
export const defaultFallback = async (agent: Agent) => {
  try {
    const subjectMatter = getSubjectMatter(agent)
    // This is the default message, but it should never be used. There should always be a subject matter
    let message = 'I\'m sorry, I\'m not familiar with that right now, but I\'m still learning! I can help answer a wide variety of questions; \
    <strong>please try rephrasing</strong> or click on one of the options provided.'

    if (subjectMatter === 'cse') {
      message = 'I\'m sorry, I\'m not familiar with that right now, but I\'m still learning! I can help answer a wide variety of questions \
      about Child Support; <strong>please try rephrasing</strong> or click on one of the options provided. If you need immediate assistance, \
      please contact the Child Support Call Center at <a href="tel:+18778824916">877-882-4916</a>.'
    } else if (subjectMatter === 'snap' || subjectMatter === 'tanf') {
      message = `I'm sorry, I'm not familiar with that right now, but I'm still learning! I can help answer a wide variety of questions \
      about ${subjectMatter.toUpperCase()}; please try rephrasing or click on the options provided.`
    } else if (subjectMatter === 'wfd') {
      const myresourcesLink = '<a target="_blank" href="https://myresources.mdhs.ms.gov/"> MyResources</a>'
      message = `I'm sorry, I'm not familiar with that right now, but I'm still learning! I can help answer a wide variety of questions; \
      please try rephrasing or click on one of the options provided. For more information, you can access ${myresourcesLink}`
    }

    await agent.add(message)
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
  const termsAndConditionsLink = 'https://www.mdhs.ms.gov/privacy-disclaimer'

  try {
    await agent.add(
      'Hi, I\'m Gen. I am not a real person, but I can help you with Child Support, SNAP, TANF or Workforce Development requests.'
    )

    await agent.add(
      'The information I provide is not legal advice. Also, <b>please do not enter SSN or DOB information at any time during your conversations with me</b>.'
    )

    await agent.add(
      `By clicking "I Acknowledge" below you are acknowledging receipt and understanding of these statements and the MDHS Website \
      Disclaimers, Terms, and Conditions found <a href="${termsAndConditionsLink}" target="_blank">here</a>, and that you wish to continue.`
    )

    await disableInput(agent)
    await agent.add(new Suggestion('I ACKNOWLEDGE'))

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
    name: 'cse-enableHome',
    lifespan: 1,
  })

  await agent.context.set({
    name: 'tanf-enableHome',
    lifespan: 1,
  })

  await agent.context.set({
    name: 'snap-enableHome',
    lifespan: 1,
  })

  await agent.context.set({
    name: 'wfd-enableHome',
    lifespan: 1,
  })

  await Promise.all([...suggestionPromises, ...contextPromises])
}

export const acknowledgePrivacyStatement = async (agent: Agent) => {
  try {
    await agent.add('Great! Select one of the options below.')
    await selectSubjectMatter(agent)
    // await startRootConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

// Handle startOfConversation
export const startRootConversation = async (agent: Agent) => {
  try {
    await agent.add('Select one of the options below.')
    await selectSubjectMatter(agent)
    // await startRootConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}
