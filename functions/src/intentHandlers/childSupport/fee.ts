export const fee = async (agent: Agent) => {
  const { tbd } = await import('../globalFunctions')

  try {
    await tbd(agent)
  } catch (err) {
    console.error(err.message, err)
  }
}