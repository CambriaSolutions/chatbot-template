import dotenv from 'dotenv'

dotenv.config()

const options = {
  method: 'GET',
  url: process.env.FULFILLMENT_URL
}

export const coldStartFulfillment = async () => {
  const rp = await import('request-promise')

  try {
    // Test dialogflow fulfillment
    await rp.default(options)

  } catch (err) {
    console.error(err.message, err)
  }
}
