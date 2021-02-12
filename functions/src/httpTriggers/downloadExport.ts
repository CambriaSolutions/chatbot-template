import dotenv from 'dotenv'
dotenv.config()

// Calculate metrics based on requests
export const downloadExport = async (req, res) => {
  // Google Cloud Storage Setup
  const { Storage } = await import('@google-cloud/storage')
  const storage = new Storage()
  const bucketName = 'daily-json-exports'

  const reqData = req.body
  if (!reqData) {
    res.send(500, 'The request body doesn\'t contain expected parameters')
  }

  // Check that filename exists on the request
  if (!reqData.filename) {
    res.send(500, 'Missing file parameters')
  }

  const filename = reqData.filename
  const bucket = storage.bucket(bucketName)
  const file = bucket.file(filename)

  const [fileExists] = await file.exists()
  if (fileExists) {
    res.setHeader(
      'Content-disposition',
      'attachment; filename=' + filename
    )
    res.setHeader('Content-type', 'application/json')

    const readStream = file.createReadStream()
    return readStream.pipe(res)
  } else {
    res.send(404, 'The requested file doesn\'t exist')
  }
}
