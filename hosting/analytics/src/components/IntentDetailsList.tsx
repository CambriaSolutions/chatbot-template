import React from 'react'
import styled from 'styled-components'

import { convertHex } from '../common/helper'
import { format, addHours } from 'date-fns'

// Material UI
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'

const StyledDialogContent = styled(DialogContent)`
  min-height: 440px;
`
const DetailDiv = styled.div`
  font-size: 0.85em;
`
const DetailText = styled.div`
  padding: 8px;
`
const DetailDate = styled.div`
  text-align: right;
  font-size: 0.8em;
  color: #999;
`

// Remove waiting text from all context
const beautifyContext = context => {
  const newName = context.replace('waiting-', '').replace(/-/g, ' ')
  return newName.charAt(0).toUpperCase() + newName.slice(1)
}

const IntentDetailsList = props => {
  const items = props.data.map((row, index) => {
    const itemStyles =
      index % 2
        ? { backgroundColor: convertHex(props.color, 25) }
        : { backgroundColor: convertHex(props.color, 10) }

    const contextDiv =
      row.outputContexts.length > 0 ? (
        <div>
          <strong>Context: </strong>
          {row.outputContexts.map(c => beautifyContext(c.context)).join(' - ')}
        </div>
      ) : (
        ''
      )

    // Convert server time to subject matter's timezone
    const SERVER_TIMEZONE_OFFSET = -7
    const timeDiffOffset =
      SERVER_TIMEZONE_OFFSET >= props.timezoneOffset
        ? SERVER_TIMEZONE_OFFSET - props.timezoneOffset
        : props.timezoneOffset - SERVER_TIMEZONE_OFFSET

    return (
      <DetailDiv style={itemStyles}>
        <DetailText>
          <strong>Message: </strong>
          {row.messageText}
          {contextDiv}
          <DetailDate>
            {format(addHours(row.createdAt, timeDiffOffset), 'ccc PPP \'at\' p')}
          </DetailDate>
        </DetailText>
      </DetailDiv>
    )
  })

  return (
    <React.Fragment>
      <DialogTitle>
        {beautifyContext(props.data[0].intentName)} details
      </DialogTitle>
      <StyledDialogContent>
        {items.map((item, index) => <div key={index}>{item}</div>)}
      </StyledDialogContent>
    </React.Fragment>
  )
}

export default IntentDetailsList
