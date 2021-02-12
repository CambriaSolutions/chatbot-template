import { defaultFallback } from '../globalFunctions'

export const noneOfThese = async (agent: Agent) => {
  try {
    await defaultFallback(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}

export const commonFallback = async (agent: Agent) => {
  if (agent.context.get('cse-subject-matter') !== undefined) {
    const { autoMlFallback } = await import('./categorizeAndPredict')

    return autoMlFallback(agent)
  } else {
    return defaultFallback(agent)
  }
}