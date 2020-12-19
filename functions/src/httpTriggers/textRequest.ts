export const textRequest = async (req, res) => {
  if (!req.query || !req.query.query) {
    return 'The "query" parameter is required'
  }

  if (!req.query || !req.query.uuid) {
    return 'The "uuid" parameter is required'
  }
  const { dialogflowRequest } = await import('../utils/dialogflowRequest')

  const response = await dialogflowRequest(req, 'text')

  res.json(response)
}
