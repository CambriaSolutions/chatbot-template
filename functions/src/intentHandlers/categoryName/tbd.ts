import { handleEndConversation } from "../globalFunctions"

export const tbd = async (agent: Agent) => {
    const tbdMessage = 'I plead the 5th.'
    agent.add(tbdMessage)
    await handleEndConversation(agent)
}