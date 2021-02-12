import { Suggestion } from 'dialogflow-fulfillment'
import { map, first, filter, find } from 'lodash'
import { genericHandler } from '../utils/fulfillmentMessages'

/************************************************************************************************
 * The snapshotCurrentState takes the agent as a parameter and continually appends the current
 *  intent information to the userConversationPath parameter of the 'previous-agent-states' context.
 ************************************************************************************************/

const snapshotCurrentState = async (agent, subjectMatter: SubjectMatter, fulfillmentMessages) => {
  const { shouldHandleEndConversation } = await import('../utils/fulfillmentMessages')

  // Grab all the existing contexts except for 'previous-agent-states'
  const currentContexts = []
  await agent.contexts.forEach(context => {
    if (context.name !== 'previous-agent-states') {
      currentContexts.push(context)
    }
  })

  // Take a snapshot of the conversation.
  const newIntentAndParams = {
    name: agent.intent,
    parameters: agent.parameters || {},
    contexts: currentContexts,
    content: map(filter(fulfillmentMessages, fm => fm.text && fm.text.text[0]), fm => first(fm.text.text)),
    suggestions: find(fulfillmentMessages, fm => fm.payload) ? find(fulfillmentMessages, fm => fm.payload).payload.suggestions : [],
    subjectMatter,
    handleEndConversation: shouldHandleEndConversation(fulfillmentMessages)
  }

  // Get the 'previous-intent' context
  const previousContexts = agent.context.get('previous-agent-states')

  /* If the 'previous-intent' context is undefined aka it is the first time
  the context is being set, set 'previous-agent-states' to the an array with
  the first element as the current intent name and parameters. Else,
  append the current intent name and parameters to the the 
  userConversationPath parameter.*/
  if (previousContexts === undefined) {
    await agent.context.set({
      name: 'previous-agent-states',
      lifespan: 99999,
      parameters: {
        userConversationPath: [newIntentAndParams],
      },
    })
  } else {
    const previousIntentsAndParams =
      previousContexts.parameters.userConversationPath

    await agent.context.set({
      name: 'previous-agent-states',
      parameters: {
        userConversationPath: previousIntentsAndParams.concat(
          newIntentAndParams
        ),
      },
    })
  }
}

/************************************************************************************************
 * backFunction takes the webhookClient and returns an async
 * function that sets previous webhookClient state (intent, parameters, and context) and calls
 * the function that is associated with that intent.
 ************************************************************************************************/

const backFunction = (agent: any): IntentHandler => {
  return async () => {
    try {
      const userConversationPath = agent.context.get('previous-agent-states')
        .parameters.userConversationPath

      // Clear all the contexts that are currently set.
      agent.contexts.forEach(context => {
        if (context.name !== 'previous-agent-states') {
          agent.context.delete(context.name)
        }
      })

      // Remove the back Intent	that's at the end of the path.
      userConversationPath.pop()

      // Remove the intent where the user wants to move back from.
      if (userConversationPath.length > 1) {
        userConversationPath.pop()
      }

      // Get the last intent in the array, set the agent parameters, match the intent name to
      // the function and call that function.
      const conversationPathLength = userConversationPath.length
      const lastIntent = userConversationPath[conversationPathLength - 1]

      agent.intent = lastIntent.name
      agent.parameters = lastIntent.parameters
      lastIntent.contexts.forEach(context => {
        if (context.name !== 'previous-agent-states') {
          agent.context.set(context)
        }
      })
      const { getIntentHandler } = await import('../intentHandlers/getIntentHandler')

      const lastIntentHandler = await getIntentHandler(lastIntent.subjectMatter)(lastIntent.name)

      // Intent handler may not exist for this intent because content and 
      // suggestions are set directly in dialogflow. So we "handle" the intent 
      // using the "content" and "suggestions" data stored in the last intent
      // in "userConversationPath"
      const previousIntent = lastIntentHandler ? lastIntentHandler : async (_agent) => {
        await genericHandler(_agent, lastIntent.content, lastIntent.suggestions)

        if (lastIntent.handleEndConversation) {
          const { handleEndConversation } = await import('../intentHandlers/globalFunctions')
          await handleEndConversation(_agent)
        }
      }

      await previousIntent(agent)
    } catch (err) {
      console.error(err.message, err)
    }
  }
}

/************************************************************************************************
 * fulfillmentWrapper takes the webhookClient and the intentMap for dialogflow and creates a new
 * function for the intent where the 'Go Back' suggestion is added to the the intent if the
 * 'previous-agent-states' context has captured more than 1 state. Also adds the context needed
 * for the back button functionality.
 ************************************************************************************************/

const fulfillmentWrapper = (agent, intentMap: { [name: string]: IntentHandler }) => {
  const currentIntentFulfillmentFunction = intentMap[agent.intent]
  const prevIntents = agent.context.get('previous-agent-states')

  const maskFunction: IntentHandler = async (agent: Agent) => {
    await currentIntentFulfillmentFunction(agent)
    await agent.context.set({
      name: 'waiting-go-back',
      lifespan: 999,
    })
    if (prevIntents.parameters.userConversationPath.length > 1) {
      await agent.add(new Suggestion('Go Back'))
    }
  }
  intentMap[agent.intent] = maskFunction
}

/************************************************************************************************
 * backIntentCycle does the following:
 *
 * 1. Snapshot the current state of the agent.
 * 2. Creating a fulfillment function for the 'go-back' intent.
 * 3. Set the intent map for dialogflow.
 * 4. Create a fulfillment wrapper for the current intent that sets context to recognize the
 * training phrase and create 'Go Back' suggestion button.
 ************************************************************************************************/

const backIntentCycle = async (agent, intentMap: IntentHandlersByName, subjectMatter: SubjectMatter, name, fulfillmentMessages) => {
  await snapshotCurrentState(agent, subjectMatter, fulfillmentMessages)
  const back = backFunction(agent)
  intentMap[name] = back
  fulfillmentWrapper(agent, intentMap)
}

/************************************************************************************************
 * backIntent checks if the current intent is within the list of intents what will reset the
 * back button context or else it will go through the cycle of the back button:
 *
 * 1. Snapshot the current state of the agent.
 * 2. Creating a fulfillment for the 'go-back' intent.
 * 3. Set the intent map for dialogflow.
 * 4. Create a fulfillment wrapper for the current intent that sets context to recognize the
 * training phrase and create 'Go Back' suggestion button.
 *
 * Parameters:
 *  - agent: WebHookClient
 *  - intentMap: Object
 *  - resetBackButtonIntentList: Array (Optional. Defaults to an empty array.)
 *  - backIntentName: String (Optional. Defaults to 'go-back')
 *
 ************************************************************************************************/

export const back = async (
  agent: Agent,
  intentMap: IntentHandlersByName,
  fulfillmentMessages: any,
  subjectMatter: SubjectMatter,
  resetBackButtonIntentList: any = [],
  backIntentName: string = 'go-back'
) => {
  const currentIntent = agent.intent
  if (resetBackButtonIntentList.includes(currentIntent)) {
    agent.context.delete('previous-agent-states')
  } else {
    await backIntentCycle(agent, intentMap, subjectMatter, backIntentName, fulfillmentMessages)
  }
}