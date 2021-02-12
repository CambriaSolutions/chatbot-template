import { Suggestion } from 'dialogflow-fulfillment'

const rootIntents = [
  'Default Fallback Intent',
  'global-restart',
  'cse-root',
  'snap-root',
  'tanf-root',
  'wfd-root',
]

const isHomeEnabled = (agent) => {
  return agent.context.get('cse-subject-matter') !== undefined
    || agent.context.get('snap-subject-matter') !== undefined
    || agent.context.get('tanf-subject-matter') !== undefined
    || agent.context.get('wfd-subject-matter') !== undefined
}

const isRootIntent = (agent) => {
  return rootIntents.includes(agent.intent)
}

const isPreviousIntentRootIntent = (agent) => {
  const userConversationPath = agent.context.get('previous-agent-states').parameters.userConversationPath
  const conversationPathLength = userConversationPath.length
  if (conversationPathLength > 1) {
    console.log('conversationPathLength', conversationPathLength)

    const lastIntent = userConversationPath[conversationPathLength - 2]

    // If the current intent is 'go-back' and conversation path is greater than 1, then
    // the user is returning to a position that had the 'home' button, so we want to make sure 
    // it is there when they go back one intent.
    return agent.intent.toLowerCase() !== 'go-back' && rootIntents.includes(lastIntent.name)
  } else {
    return true
  }
}

export const localRestart = async (agent, intentMap: { [name: string]: IntentHandler }, subjectMatter) => {
  const currentIntent = agent.intent

  const currentIntentFunction = intentMap[currentIntent]

  const localRestartFunction: IntentHandler = async (_agent) => {
    await currentIntentFunction(_agent)

    if (isHomeEnabled(_agent) && !isRootIntent(_agent) && !isPreviousIntentRootIntent(_agent)) {
      await _agent.context.set({
        name: `${subjectMatter}-enableHome`,
        lifespan: 1,
      })

      await _agent.add(new Suggestion('Home'))
    }
  }
  intentMap[currentIntent] = localRestartFunction
}