import React from 'react'
import { connect } from 'react-redux'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'

import styled from 'styled-components'
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from 'react-google-maps'
import pin from './pin.svg'
import personPin from './person-pin.svg'

const CardContainer = styled(Card)`
  && {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
    background: #fff;
    margin: 15px 16px 15px 16px;
    white-space: pre-line;
    scroll-margin: 15px;
  }
`

const TableContainer = styled.div`
  height: 150px;
  font-size: 14px;
  margin-top: 10px;
`

const StyledCardContent = styled(CardContent)`
  &&& {
    padding-top: 0;
    padding-bottom: 0;
  }
`

const StyledTableBody = styled(TableBody)`
  td {
    padding: 4px 0px 4px 0px;
  }
  tr:last-of-type {
    td {
      border-bottom: none;
    }
  }
`

const StyledAddressTableCell = styled(TableCell)`
  && {
    width: 70%;
    padding: 4px 0px 4px 0px;
  }
`

const StyledDistanceTableCell = styled(TableCell)`
  &&& {
    width: 20%;
    padding-right: 0;
    text-align: right;
  }
`

// Improve how this gets pulled in
const mediaRoot = document.getElementById('cambria-wordpress-chatframe').getAttribute('data-media-root')

// Maps documentation: https://tomchentw.github.io/react-google-maps
function MapResponse(props) {
  const { data, googleMapsKey, className, key } = props
  const cardHeight = '230px'
  const iconSize = { width: 30, height: 30 }
  const googleMapsUrl = `https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&v=3`
  const handleMarkerClick = location => {
    const url = `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${location.placeId}`
    window.open(url, '_blank')
  }

  const Map: any = withScriptjs(
    withGoogleMap(() => (
      <GoogleMap
        defaultZoom={8}
        defaultCenter={data.nearestLocations[0]}
        defaultOptions={{
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {data.locations.map((row, i) => (
          <Marker
            key={i}
            position={{ lat: row.lat, lng: row.lng }}
            icon={{
              url: (mediaRoot || '').concat(pin),
              scaledSize: iconSize,
            } as any}
            onClick={() => handleMarkerClick(row)}
          />
        ))}
        <Marker
          position={{
            lat: data.currentGeocode.lat,
            lng: data.currentGeocode.lng,
          }}
          icon={{
            url: (mediaRoot || '').concat(personPin),
            scaledSize: iconSize,
          } as any}
        />
      </GoogleMap>
    ))
  )

  return (
    <CardContainer className={className} key={key}>
      <CardHeader title='Office Locations' titleTypographyProps={{ variant: 'h6' }} />
      <StyledCardContent>
        <Map
          googleMapURL={googleMapsUrl as any}
          loadingElement={<div style={{ height: `${cardHeight}` }} />}
          containerElement={<div style={{ height: `${cardHeight}` }} />}
          mapElement={<div style={{ height: '100%' }} />}
        />
        <TableContainer>
          <Table padding='dense'>
            <StyledTableBody>
              {data.nearestLocations.map((row, i) => (
                <TableRow key={i}>
                  <StyledAddressTableCell padding='dense'>
                    <Typography>
                      <Link
                        href={`https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${row.placeId}`}
                        target='blank'
                      >
                        {`${row.street}, ${row.city}`}
                      </Link>
                    </Typography>
                  </StyledAddressTableCell>
                  <StyledDistanceTableCell padding='dense'>
                    {row.distance}
                  </StyledDistanceTableCell>
                </TableRow>
              ))}
            </StyledTableBody>
          </Table>
        </TableContainer>
      </StyledCardContent>
    </CardContainer>
  )
}

const mapStateToProps = state => {
  return {
    googleMapsKey: state.config.googleMapsKey,
  }
}

export default connect(mapStateToProps)(MapResponse)
