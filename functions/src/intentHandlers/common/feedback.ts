import { Payload } from 'dialogflow-fulfillment'

import {
  disableInput,
} from '../globalFunctions'

export const feedbackRoot = async (agent: Agent) => {
  try {
    const { Suggestion } = await import('dialogflow-fulfillment')

    agent.add('Was <<Bot>> helpful?')
    agent.add(new Suggestion('Yes'))
    agent.add(new Suggestion('No'))
    await disableInput(agent)
    await agent.context.set({
      name: 'waiting-feedback-not-helpful',
      lifespan: 2,
    })
    await agent.context.set({
      name: 'waiting-feedback-helpful',
      lifespan: 2,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}

export const feedbackNotHelpful = async (agent: Agent) => {
  try {
    const feedback = JSON.stringify({
      helpful: false,
      options: [
        { value: 'Did not have the information I needed' },
        {
          value: 'I wasn\'t able to have my questions answered',
        },
        {
          value: 'Was difficult requesting assistance',
        },
        {
          value:
            'I would prefer calling in or visiting the office to using <<Bot>>',
        },
        {
          value: 'Was not easy conversing with <<Bot>>',
        },
        {
          value: 'Was not easy to navigate',
        },
      ],
    })
    agent.add(
      new Payload(
        agent.UNSPECIFIED,
        { feedback },
        {
          sendAsMessage: true,
          rawPayload: true,
        }
      )
    )
    await agent.context.set({
      name: 'waiting-feedback-complete',
      lifespan: 2,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}

export const feedbackHelpful = async (agent: Agent) => {
  try {
    const feedback = JSON.stringify({
      helpful: true,
      options: [
        { value: 'Had the information I needed' },
        {
          value: 'I was able to answer my question(s)',
        },
        {
          value: 'Was easy to ask for assistance',
        },
        {
          value: 'I prefer using <<Bot>> to calling or visiting an office',
        },
        {
          value: 'Was easy to navigate',
        },
        {
          value: 'Easy to converse with <<Bot>>',
        },
      ],
    })
    
    agent.add(
      new Payload(
        agent.UNSPECIFIED,
        { feedback },
        {
          sendAsMessage: true,
          rawPayload: true,
        }
      )
    )
    
    await agent.context.set({
      name: 'waiting-feedback-complete',
      lifespan: 2,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}

export const feedbackComplete = async (agent: Agent) => {
  try {
    agent.add('To start over just say hello!')
  } catch (err) {
    console.error(err.message, err)
  }
}
