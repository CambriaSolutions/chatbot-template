import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

// Material UI
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import CustomDateDialog from './CustomDateDialog'

import {
  updateFilters,
  updateFiltersWithRange,
} from '../store/actions/filterActions'

const Dropdown = styled(Select)`
  color: #fff !important;
  margin-left: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.42) !important;
  &:after {
    border-bottom: 2px solid #fff !important;
  }
  input {
    color: #fff;
  }
  svg {
    color: #fff;
  }
`

const CustomMenuItem = styled(MenuItem)`
  && {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    padding-bottom: 0px;
  }
`

class DateFilter extends Component<any> {
  constructor(props) {
    super(props)
    this.state = {
      startDate: null,
      endDate: null,
    }
  }

  handlePickerClose = ({ startDate, endDate }) => {
    if (startDate && endDate) {
      this.props.updateFiltersWithRange(startDate, endDate)
    }
  }
  render() {
    const { isCustomDateRange, filterLabel } = this.props

    return (
      <>
        <Dropdown
          value={filterLabel}
          onChange={event => this.props.onFilterChange(event)}
          name='filter'>
          <MenuItem value={'Today'}>Today</MenuItem>
          <MenuItem value={'Yesterday'}>Yesterday</MenuItem>
          <MenuItem value={'Last 7 days'}>Last 7 days</MenuItem>
          <MenuItem value={'Last 30 days'}>Last 30 days</MenuItem>
          <MenuItem value={'Last 90 days'}>Last 90 days</MenuItem>
          <MenuItem value={'Last quarter'}>Last quarter</MenuItem>
          <MenuItem value={'Last 12 months'}>Last 12 months</MenuItem>
          <CustomMenuItem value={'Custom'}>Custom</CustomMenuItem>
        </Dropdown>
        {isCustomDateRange && <CustomDateDialog />}
      </>
    )
  }
}

const mapStateToProps = state => {
  return {
    filterLabel: state.filters.filterLabel,
    isCustomDateRange: state.filters.isCustomDateRange,
    filterStartDate: state.filters.dateFilters.start,
    filterEndDate: state.filters.dateFilters.end,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onFilterChange: newFilter => dispatch(updateFilters(newFilter)),
    updateFiltersWithRange: (startDate, endDate) =>
      dispatch(updateFiltersWithRange(startDate, endDate)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DateFilter)
