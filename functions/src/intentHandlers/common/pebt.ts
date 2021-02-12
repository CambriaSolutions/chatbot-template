export const pebtRoot = async (agent: Agent) => {
  try {
    const { handleEndConversation } = await import('../globalFunctions')

    await agent.add('Together the Mississippi Department of Human Services (MDHS) and Mississippi Department of Education \
    (MDE) will provide Pandemic Electronic Benefit Transfer (P-EBT) benefits to Supplemental Nutrition Assistance Program \
     (SNAP) and non-SNAP households for children who have temporarily lost access to free or reduced-price school meals due \
     to pandemic-related school closures. No application is required.')

    await handleEndConversation(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}