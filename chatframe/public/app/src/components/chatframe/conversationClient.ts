import { v4 as uuidv4 } from 'uuid'

// Code 0 === Webhook execution successful
// Code 4 === Webhook call failed. Error: DEADLINE_EXCEEDED.
// Code 14 === Webhook call failed. Error: UNAVAILABLE.
function fetchIntent(url) {
  try {
    // Make the first attempt to fetch intent
    // Request #1
    return fetch(url).then(req => req.json())
  } catch (e) {
    console.error(e)
    return {}
  }
}

export class Client {
  textUrl = ''
  eventUrl = ''
  uuid = ''

  constructor(options) {
    if (!options || !options.textUrl) {
      throw new Error(
        'Fulfillment URL is required to generate a conversation client'
      )
    }
    this.textUrl = options.textUrl
    this.eventUrl = options.eventUrl
    this.uuid = uuidv4()
  }

  encodeQueryData = (data) => {
    const params = []
    for (const d in data) {
      params.push(`${encodeURIComponent(d)}=${encodeURIComponent(data[d])}`)
    }
    return params.join('&')
  }

  textRequest = (query) => {
    if (!query) {
      throw new Error('Query should not be empty')
    }
    const params = {
      query,
      uuid: this.uuid,
    }

    const queryParams = this.encodeQueryData(params)
    const url = `${this.textUrl}?${queryParams}`
    return fetchIntent(url)
  }

  eventRequest = (query) => {
    if (!query) {
      throw new Error('Query should not be empty')
    }

    const params = {
      query,
      uuid: this.uuid,
    }

    const queryParams = this.encodeQueryData(params)
    const url = `${this.eventUrl}?${queryParams}`

    return fetchIntent(url)
  }
}
