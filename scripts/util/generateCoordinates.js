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

// Create an array of CSE locations to send to the geocode api
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

// Create an array of SNAP, TANF, and WFD locations to send to the geocode api. SNAP, TANF, and WFD have the same offices.
const locationsSet2 = [
  '150 EAST FRANKLIN NATCHEZ, MS 39120',
  '2690 S HARPER ROAD CORINTH, MS 38834',
  '185 IRENE ST LIBERTY, MS 39645',
  '717 FAIRGROUND RD KOSCIUSKO, MS 39090',
  '183 COURT ST ASHLAND, MS 38603',
  '212 NORTH PEARMAN AVE CLEVELAND, MS 38732-1628',
  '706 BRADFORD ST ROSEDALE, MS 38769',
  '237 SOUTH MURPHREE ST PITTSBORO, MS 38951',
  '205 LEE ST VAIDEN, MS 39176',
  '745 WEST CHURCH ST HOUSTON, MS 38851',
  '583 WEST MAIN ST ACKERMAN, MS 39735',
  '417 INDUSTRIAL DR PORT GIBSON, MS 39150',
  '29 HARRIS AVE QUITMAN, MS 39355',
  '266 WASHINGTON ST WEST POINT, MS 39773',
  '923 OHIO AVE CLARKSDALE, MS 38614',
  '640 GEORGETOWN ST, SUITE 2 HAZELHURST, MS 39083',
  '107 N ARRINGTON AVE COLLINS, MS 39428',
  '3210 HWY 51 SOUTH HERNANDO, MS 38632',
  '1604 W PINE ST HATTIESBURG, MS 39401',
  '90 MILL RD BUDE, MS 39630',
  '38 LONDON ST, SUITE B LUCEDALE, MS 39452',
  '1008 JACKSON AVE LEAKESVILLE, MS 39451',
  '1240 FAIRGOUND RD, SUITE B GRENADA, MS 38901',
  '856 HWY 90, SUITE D BAY ST LOUIS, MS 39520',
  '10260 LARKIN SMITH DR GULFPORT, MS 39505-3400',
  '4777 MEDGAR EVERS BLVD JACKSON, MS 39213',
  '22419 DEPOT ST LEXINGTON, MS 39095',
  '16463 US HWY 49, SUITE C BELZONI, MS 39038',
  '129 COURT ST MAYERSVILLE, MS 39113',
  '305 WEST CEDAR ST FULTON, MS 38843',
  '5343 JEFFERSON AVE, SUITE 7 MOSS POINT, MS 39563',
  '37 WEST 8TH AVE BAY SPRINGS, MS 39422',
  '235 MEDGAR EVERS BLVD FAYETTE, MS 39069',
  '1185B FRONTAGE RD PRENTISS, MS 39474',
  '5110 HWY 11 NORTH ELLISVILLE, MS 39437',
  '110 PONDEROSA AVE DEKALB, MS 39328',
  '72 F.D. BUDDY EAST PARKWAY SUITE 301 OXFORD, MS 38655',
  '207 MAIN ST PURVIS, MS 39475',
  '5224 VALLEY ST MERIDIAN, MS 39307',
  '1200 NOLA RD P O BOX 577 MONTICELLO, MS 39654',
  '202 CO BROOKS ST, SUITE 103 CARTHAGE, MS 39051',
  '220 SOUTH INDUSTRIAL RD, SUITE A TUPELO, MS 38801',
  '216 HWY 7 SOUTH GREENWOOD, MS 38935',
  '300 EAST CHICKASAW ST  BROOKHAVEN, MS 39601',
  '1604 COLLEGE ST COLUMBUS, MS 39701',
  '867 MARTIN LUTHER KING CANTON, MS 39046',
  '1111 HWY 98 BYPASS, SUITE C COLUMBIA, MS 39429',
  '230 EAST COLLEGE ST HOLLY SPRINGS, MS 38635',
  '104 ½ N MATTUBBA ST ABERDEEN, MS 39730',
  '705 ALBERTA DR WINONA, MS 38967',
  '1016 HOLLAND AVE PHILADELPHIA, MS 39350',
  '14712 HWY 15 SOUTH DECATUR, MS 39327',
  '601 WEST PEARL ST MACON, MS 39341',
  '213 YEATES ST STARKVILLE, MS 39760-0865',
  '240 TOWER DR. BATESVILLE, MS 38606',
  '153 SAVANNAH MILLARD RD, SUITE C POPLARVILLE, MS 39470',
  '201 1ST WEST NEW AUGUSTA, MS 39462',
  '341 C CENTER RIDGE DR PONTOTOC, MS 38863',
  '200 BRIDGE STREET BOONEVILLE, MS 38829',
  '1054 MARTIN LUTHER KING DR MARKS, MS 38646',
  '603 MARQUETTE RD BRANDON, MS 39042',
  '521 AIRPORT RD FOREST, MS 39074',
  '613 MARTIN LUTHER KING JR ST ROLLING FORK, MS 39159',
  '109 WEST PINE, SUITE 1 MENDENHALL, MS 39114',
  '353 HWY 37 RALEIGH, MS 39153',
  '648 FAIRGROUNDS ST WIGGINS, MS 39577',
  '225 MARTIN LUTHER KING DR INDIANOLA, MS 38751',
  '630 ELISHA & EVERETT LANGDON ST RULEVILLE, MS 38771',
  '181 SOUTH MARKET ST CHARLESTON, MS 38921',
  '1428 BROWNS FERRY RD SENATOBIA, MS 38668',
  '159 BAILS RD RIPLEY, MS 38663',
  '1008 BATTLEGROUND DR, ROOM 104 IUKA, MS 38852',
  '1490 EDWARDS AVE TUNICA, MS 38676',
  '923 FAIRGROUND SPUR RD NEW ALBANY, MS 38652',
  '901 UNION RD TYLERTOWN, MS 39667',
  '1316 OPENWOOD ST VICKSBURG, MS 39183',
  '925 MAIN ST GREENVILLE, MS 38702',
  '1104-A CEDAR ST WAYNESBORO, MS 39367',
  'E 53 GOVERNMENT AVE EUPORA, MS 39744',
  '1391 HWY 61 SOUTH WOODVILLE, MS 39669',
  'R 165 VANCE ST LOUISVILLE, MS 39339',
  '217 FROSTLAND DR WATER VALLEY, MS 38965',
  '1315 GRADY AVE YAZOO CITY, MS 39194',
  '1002 Warren Krout Rd, McComb, MS 39648'
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
  coordinatesRequests(locationsSet1), // CSE
  coordinatesRequests(locationsSet2) // SNAP, TANF, WFD
]).then(responses => {
  // CSE
  fs.writeFileSync('../functions/coordinates/coordinatesSet1.json', JSON.stringify(responses[0]))

  // SNAP, TANF, WFD have the same offices
  fs.writeFileSync('../functions/coordinates/coordinatesSet2.json', JSON.stringify(responses[1]))

  console.log('Coordinates retrieved - files created!')
})
