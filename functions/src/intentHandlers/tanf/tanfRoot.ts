import { Suggestion } from 'dialogflow-fulfillment'

export const tanfRoot = async (agent: Agent) => {
  try {
    await agent.add('What can I help you with?')

    await agent.add(new Suggestion('Application'))
    await agent.add(new Suggestion('Doc Upload'))
    await agent.add(new Suggestion('Eligibility Checker'))
    await agent.add(new Suggestion('Change Reporting'))

    await agent.context.set({
      name: 'tanf-subject-matter',
      lifespan: 999,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}