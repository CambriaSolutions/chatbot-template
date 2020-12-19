import * as functions from 'firebase-functions'

export const eventRequest = async (req: functions.https.Request, res: functions.Response<any>) => {
  if (!req.query || !req.query.query) {
    return 'The "query" parameter is required'
  }

  if (!req.query || !req.query.uuid) {
    return 'The "uuid" parameter is required'
  }
  const { dialogflowRequest } = await import('../utils/dialogflowRequest')

  const response = await dialogflowRequest(req, 'event')

  res.json(response)
}