import React from 'react'
import styled from 'styled-components'

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Icon from '@material-ui/core/Icon'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'

const StyledCard = styled(Card)`
  color: #fff;
  width: '100%';
  display: flex;
  padding: 5px;
  height: 90%;
`

const Details = styled(CardContent)`
  display: inline-block;
  flex: 70%;
  color: #fff;
  text-align: left;
  padding-right: 5px !important;
  h5 {
    font-size: 1.6em;
    display: inline;
  }
  p {
    margin: 0 5px 5px 0;
  }
`

const Notes = styled.div`
  font-size: 12px;
`

const Image = styled.div`
  display: inline-block;
  flex: 30%;
  text-align: right;
  .material-icons {
    margin-top: 10px;
    font-size: 60px;
    color: #fff;
    opacity: 0.4;
    padding-right: 10px;
  }
`

const card = props => {
  const cardStyle = {
    backgroundColor: `${props.color}`,
  }

  const tooltipIconStyle = {
    color: '#ffffff'
  }

  return (
    <StyledCard style={cardStyle}>
      <Tooltip TransitionComponent={Zoom} title={props.tooltip} arrow placement='top-start'>
        <HelpOutlineIcon style={tooltipIconStyle} />
      </Tooltip>
      <Details>
        <h5>{props.value}</h5>
        <p>{props.label}</p>
        <Notes>{props.notes}</Notes>
      </Details>
      <Image>
        <Icon>{props.icon}</Icon>
      </Image>
    </StyledCard>
  )
}

export default card
