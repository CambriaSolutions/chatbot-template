import { defaultFallback } from '../globalFunctions'

export const noneOfThese = async (agent: Agent) => {
  try {
    await defaultFallback(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

export const commonFallback = async (agent: Agent) => {
  return defaultFallback(agent)  
}