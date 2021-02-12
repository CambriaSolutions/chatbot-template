export const eppiFees = async (agent: Agent) => {
  try {
    const { Card } = await import('dialogflow-fulfillment')
    const { handleEndConversation } = await import('../globalFunctions')

    await agent.add(
      new Card({
        title: 'ATM Withdrawals "in-network"',
        text: `
        Total of three (3) free each calendar month; $1.75 each for any additional.
       `,
      })
    )
    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}