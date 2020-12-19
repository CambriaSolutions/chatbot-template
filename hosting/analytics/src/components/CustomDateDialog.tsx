import React from 'react'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { KeyboardDatePicker } from '@material-ui/pickers'
import { format, isValid, endOfDay } from 'date-fns'
import styled from 'styled-components'

import {
  updateFiltersWithRange,
  toggleDateDialog,
} from '../store/actions/filterActions'

const StyledButton = styled(Button)`
  && {
    color: #fff;
  }
`
const PickerContainer = styled.div`
  display: flex;
  justify-content: center;
`
const Picker = styled(KeyboardDatePicker)`
  && {
    margin-left: 15px;
  }
`

function CustomDateDialog(props) {
  const {
    filterStartDate,
    filterEndDate,
    updateFiltersWithRange,
    filterLabel,
    openDateDialog,
    toggleDateDialog,
  } = props

  const [buttonText, setButtonText] = React.useState('')
  const [startDate, setStartDate] = React.useState(null)
  const [endDate, setEndDate] = React.useState(null)

  const handleClickOpen = () => {
    toggleDateDialog(true)
  }

  const handleClose = () => {
    toggleDateDialog(false)
  }

  const handleUpdate = () => {
    if (isValid(startDate) && isValid(endDate)) {
      updateFiltersWithRange(startDate, endDate)
      toggleDateDialog(false)
      setButtonText(
        `${format(startDate, 'M/d/yy')} - ${format(endDate, 'M/d/yy')}`
      )
    }
  }

  return (
    <>
      {filterLabel === 'Custom' && (
        <StyledButton onClick={handleClickOpen}>{buttonText}</StyledButton>
      )}
      <Dialog open={openDateDialog} onClose={handleClose}>
        <DialogTitle>Custom Time Range</DialogTitle>
        <DialogContent>
          <PickerContainer>
            <Picker
              autoOk
              variant='inline'
              inputVariant='outlined'
              label='Start Date'
              initialFocusedDate={filterStartDate}
              format='MM/dd/yy'
              value={startDate}
              invalidDateMessage='Try mm/dd/yy'
              maxDate={endDate ? endDate : new Date('2100-01-01')}
              onChange={date => setStartDate(date)}
            />
            <Picker
              disableFuture
              autoOk
              variant='inline'
              inputVariant='outlined'
              label='End Date'
              initialFocusedDate={filterEndDate}
              format='MM/dd/yy'
              value={endDate}
              invalidDateMessage='Try mm/dd/yy'
              minDate={startDate ? startDate : false}
              onChange={date => setEndDate(endOfDay(date))}
            />
          </PickerContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleUpdate} color='primary'>
            Update Date Filter
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const mapStateToProps = state => {
  return {
    filterLabel: state.filters.filterLabel,
    filterStartDate: state.filters.dateFilters.start,
    filterEndDate: state.filters.dateFilters.end,
    openDateDialog: state.filters.openDateDialog,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateFiltersWithRange: (startDate, endDate) =>
      dispatch(updateFiltersWithRange(startDate, endDate)),
    toggleDateDialog: shouldOpen => dispatch(toggleDateDialog(shouldOpen)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomDateDialog)
