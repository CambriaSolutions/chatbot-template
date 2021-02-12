import { Suggestion } from 'dialogflow-fulfillment'

export const snapRoot = async (agent: Agent) => {
  const spanishGuideLink = 'https://www.mdhs.ms.gov/wp-content/uploads/2020/08/12377.7363_TARGET-Spanish_SNAP-facts-for-language-1.pdf'
  const vietnameseGuideLink = 'https://www.mdhs.ms.gov/wp-content/uploads/2020/08/12377.7363_TARGET-Vietnamese_SNAP-facts-for-language-1.pdf'

  try {
    await agent.add('What can I help you with?')
    await agent.add(`Para espanol, presione <a href="${spanishGuideLink}" target="_blank">aqui.</a>`)
    await agent.add(`Bằng tiếng việt, nhấn vào <a href="${vietnameseGuideLink}" target="_blank">đây.</a>`)

    await agent.add(new Suggestion('Application'))
    await agent.add(new Suggestion('Doc Upload'))
    await agent.add(new Suggestion('Eligibility Checker'))
    await agent.add(new Suggestion('SNAP Online Purchasing'))
    await agent.add(new Suggestion('Change Reporting'))

    await agent.context.set({
      name: 'snap-subject-matter',
      lifespan: 999,
    })
  } catch (err) {
    console.error(err.message, err)
  }
}