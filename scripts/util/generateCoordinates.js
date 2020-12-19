require('dotenv').config()
const URL = require('url').URL
const fetch = require('node-fetch')
const fs = require('fs')
const parser = require('parse-address')
const mapsKey = process.env.GOOGLE_MAPS_KEY

// This script is used to generate a JSON file with the coordinate objects used
// with the google maps API to display the nearest offices. 
// The coordinates json files will be created in functions/coordinates

console.log('\n', 'Retrieving address coordinates ...', '\n')

// Create an array of MSCJ locations to send to the geocode api
const locationsSet1 = [
  '108 S. Whitworth Ave Brookhaven, MS 39601',
  '157 Issaquena Ave Clarksdale, MS 38614',
  '822 N Davis Ave Cleveland, MS 38732',
  '811 Main Street, Suite 18 Columbia, MS 39429',
  '610 S. Cass St Corinth, MS 38834',
  '643 HWY 1, Greenville, MS 38701',
  '1400 Wooded Dr Grenada, MS 38901',
  '10415 Express Drive, Gulfport, MS 39503',
  '5 Willow Bend Drive, Hattiesburg, MS 39402',
  '165 W. South St, Suite 100 Hernando, MS 38632',
  '128 W Washington St Kosciusko, MS 39090',
  '1600 Highway 15 N Laurel, MS 39440',
  '110 First Ave SE Magee, MS 39111',
  '907 S. Locust St Suite C McComb, MS 39648',
  '2911 8th St, Suite A Meridian, MS 39301',
  '119 Jefferson Davis Blvd, Suite A Natchez, MS 39120',
  '2550 W Jackson Ave, Suite 2550-6 Oxford, MS 38655',
  '3664 14 St Pascagoula, MS 39567',
  '1122 E Main St, Suite 1 Philadelphia, MS 39328',
  '950 E County Line Road, Suite G Ridgeland, MS 39157',
  '600 Russell St, Suite 110 Starkville, MS 39759',
  '600 Main St, Suite B Tupelo, MS 38804',
  '1507 Washington St, 1st Floor Vicksburg, MS 39180',
  '128 W. Jefferson St Yazoo City, MS 39194',
]

// Send the address to the geocode api to return the latitude, longitude and placeId
const retrieveCoordinates = async address => {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json'),
    params = { address: address, key: mapsKey }

  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

  const response = await fetch(url)
  const json = await response.json()

  if (json.results.length !== 0) {
    const geoCode = {
      lat: json.results[0].geometry.location.lat,
      lng: json.results[0].geometry.location.lng,
    }
    const placeId = json.results[0].place_id
    const unformattedAddressComponents = json.results[0].address_components
    const addressComponents = {}
    const streetComponents = []

    let suiteName = ''
    // Only include components for street name and city
    unformattedAddressComponents.forEach(component => {
      if (component.types.indexOf('route') !== -1) {
        streetComponents.push(component.long_name)
      }
      if (component.types.indexOf('street_number') !== -1) {
        streetComponents.push(component.long_name)
      }
      if (component.types.indexOf('locality') !== -1) {
        addressComponents.city = component.long_name
      }
      if (component.types.indexOf('subpremise') !== -1) {
        if (component.long_name.includes('Suite')) {
          suiteName = ` ${component.long_name}`
        } else {
          suiteName = ` Suite ${component.long_name}`
        }
      }
    })

    addressComponents.street = streetComponents.join(' ') + suiteName

    const result = {
      addressComponents,
      lat: geoCode.lat,
      lng: geoCode.lng,
      placeId,
    }
    return result
  } else {
    return false
  }
}

// Map through the array of locations to send each to the geocode api
const coordinatesRequests = async (locations) => {
  const promises = locations.map(async location => {
    let coordinates = await retrieveCoordinates(location)

    // Sometimes extra address components (suite #, apartment #, etc.) cause the geolocation
    // call to fail. In the case of failure, we attempt to remove the troubling components, and retry
    if (!coordinates) {
      // The call has failed to return results

      // Parse the address into individual address components
      let cleanedAddress = ''
      let addressUnitComponents = ''
      const parsedAddress = parser.parseAddress(location)

      for (let addressComponent in parsedAddress) {
        if (
          addressComponent !== 'sec_unit_type' &&
          addressComponent !== 'sec_unit_num'
        ) {
          // Populate a string without the troubling components to send to the
          // geocoding api
          cleanedAddress += `${parsedAddress[addressComponent]} `
        } else {
          // Populate a separate string with the troubling components,
          // to be added back to the street property upon successful geocoding retrieval
          addressUnitComponents += `${parsedAddress[addressComponent]} `
        }
      }

      // Try to retrieve the coordinates again without the troubling address components
      coordinates = await retrieveCoordinates(cleanedAddress)

      if (!coordinates) {
        // The call has failed again, throw an error to call attention to the address
        throw new Error(
          `Unable to retrieve coordinates for location: ${location}`
        )
      } else {
        // Return the components to the street property
        coordinates.addressComponents.street += `, ${addressUnitComponents}`
      }
      return coordinates
    } else {
      return coordinates
    }
  })

  const result = await Promise.all(promises)

  return result
}

// Send each request to the geocode api and create a file with the results inside
// the functions directory. We will use these to populate the custom payload for the
// map intent fulfillment
Promise.all([
  coordinatesRequests(locationsSet1), // MSCJ
]).then(responses => {
  // MSCJ
  fs.writeFileSync('../functions/coordinates/coordinatesSet1.json', JSON.stringify(responses[0]))
  console.log('Coordinates retrieved - files created!')
})
