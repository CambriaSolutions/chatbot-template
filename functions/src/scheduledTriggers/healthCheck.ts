import dotenv from 'dotenv'
import _url from 'url'
import fetch from 'node-fetch'

dotenv.config()

const testJiraConnection = async () => {
  const rp = await import('request-promise')

  const options = {
    method: 'POST',
    uri: process.env.SERVICE_DESK_URI,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: process.env.SERVICE_DESK_KEY,
    },
    body: {
      serviceDeskId: process.env.SERVICE_DESK_ID,
      requestTypeId: process.env.REQUEST_TYPE_ID,
      requestFieldValues: {},
    },
    json: true,
  }

  const serviceRequest = rp.default(options)
    .catch(err => {
      // We do not want to create an actual JIRA ticket. We simply make a request with empty fields and expect an error message
      // related to empty fields. If we get a different error, there might be a problem with the JIRA API and/or feature.
      if (err.name !== 'StatusCodeError' || err.statusCode !== 400 || err.error.errorMessage !== "Your request could not be created. Please check the fields have been correctly filled in. Please provide a valid value for field 'Summary'") {
        throw new Error('Unexpected error during request to JIRA service. Please confirm that JIRA service and feature are working properly.')
      }
    })

  return serviceRequest
}

const testGoogleMaps = async (address) => {
  const mapsKey = process.env.GOOGLE_MAPS_KEY
  const URL = _url.URL

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  const params = {
    address,
    key: mapsKey,
  }

  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

  const response = await fetch(url)

  const json = await response.json()

  // If we don't receive a result or lat and longitude, then there might be something wrong with 
  // the google maps API 
  if (json.results.length === 0 || !json.results[0].geometry.location.lat || !json.results[0].geometry.location.lng) {
    throw new Error('Unexpected error during request to Google Maps service. Please confirm that the Google Maps service and features are working properly.')
  }
}

export const healthCheck = async () => {
  try {
    await testGoogleMaps('201 South Lamar St., Jackson, MS 39201')
    await testJiraConnection()
  } catch (err) {
    console.error(err.message, err)
  }
}
