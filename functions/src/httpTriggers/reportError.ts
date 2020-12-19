export const reportError = async (req: Request, res: Response) => {
  try {
    if (!req.body || !req.body.error) {
      res.status(400).send('The "error" parameter is required')
    } else {
      console.error('An error was reported from the chatframe UI', new Error(req.body.error))
      res.status(200).send()
    }
  } catch (e) {
    console.error(e)
    res.status(500).send()
  }
}
