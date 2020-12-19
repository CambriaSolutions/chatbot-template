import dotenv from 'dotenv'
dotenv.config()
import _url from 'url'
import fetch from 'node-fetch'
const mapsKey = process.env.GOOGLE_MAPS_KEY

const URL = _url.URL

const extractCounty = (geocode) => {
  const county = geocode.address_components.find(addressComponent => {
    if (addressComponent.types.includes('administrative_area_level_2')
      && addressComponent.types.includes('political')) {
      return addressComponent
    }
  })

  if (county) {
    const countyName = county.long_name.
      toLowerCase()
      .replace('county', '')
      .trim()

    return countyName
  } else {
    return null
  }
}

export const getGeocode = async address => {
  if (!address) {
    console.log('No address provided to fetch geocode.')
    return
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json'),
    params = {
      address,
      key: mapsKey,
    }
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
  const response = await fetch(url)
  const json = await response.json()
  if (json.results.length !== 0) {
    const county = extractCounty(json.results[0])
    const geoCode = {
      lat: json.results[0].geometry.location.lat,
      lng: json.results[0].geometry.location.lng,
      county: county
    }
    return geoCode
  }
}

export const getNearestThreeLocations = async (currentCoordinates, locations) => {
  if (currentCoordinates !== null) {
    const results = await Promise.all(
      locations.map(async function (place) {
        const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json'),
          params = {
            units: 'imperial',
            origins: `${currentCoordinates.lat},${currentCoordinates.lng}`,
            destinations: `${place.lat},${place.lng}`,
            key: mapsKey,
          }
        Object.keys(params).forEach(key =>
          url.searchParams.append(key, params[key])
        )

        const response = await fetch(url)
        const json = await response.json()

        if (json.rows.length !== 0) {
          const distance = json.rows[0].elements[0].distance.text
          return {
            lat: place.lat,
            lng: place.lng,
            street: place.addressComponents.street,
            city: place.addressComponents.city,
            placeId: place.placeId,
            distance,
          }
        } else {
          console.log('No results returned from Distance Matrix calculation.')
        }
      })
    )
    const sortedResults = results.sort(
      (a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance)
    )
    const nearestThreeLocations = sortedResults.slice(0, 3)
    return nearestThreeLocations
  } else {
    console.log('Unable to fetch nearest location from invalid coordinates.')
  }
}
