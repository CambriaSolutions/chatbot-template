import { handleEndConversation } from '../globalFunctions'

export const apptsOfficeLocationsHandoff = async (agent: Agent) => {
  try {
    const { mapRoot } = await import('../common/map')

    const wantsLocation = agent.parameters.wantsLocation
    if (wantsLocation === 'yes') {
      await mapRoot('cse')(agent)
    } else {
      await handleEndConversation(agent)
    }
  } catch (err) {
    console.error(err.message, err)
  }
}