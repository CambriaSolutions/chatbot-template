import { Suggestion } from 'dialogflow-fulfillment'

export const globalRestart = async (agent, intentMap: { [name: string]: IntentHandler }, exclusionList = []) => {
  const currentIntent = agent.intent
  const currentIntentFunction = intentMap[currentIntent]

  const globalRestartFunction: IntentHandler = async () => {
    await currentIntentFunction(agent)
    if (!exclusionList.includes(agent.intent)) {
      await agent.add(new Suggestion('Start Over'))

      // Necessary to overwrite @sys.any
      await agent.context.set({
        name: 'waiting-global-restart',
        lifespan: 999,
      })
    }
  }
  intentMap[currentIntent] = globalRestartFunction

  if (agent.intent === 'global-restart') {
    await agent.contexts.forEach(async context => {
      if (context.name !== 'previous-agent-states') {
        await agent.context.delete(context.name)
      }
    })
  }
}