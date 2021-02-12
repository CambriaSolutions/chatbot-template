import React, { useState } from 'react'
import ComposedChart from '../components/ComposedChart'
import { prepareDataForComposedChart } from '../scripts/metricUtil'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { map } from 'lodash'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { Line, Tooltip } from 'recharts'

const Header = styled.h3`
  display: flex
`

const HeaderText = styled.span`
  flex: 1
`

const StyledTooltipContent = styled.p`
  background-color: black
  color: white
  padding: 10px
  border-radius: 10px
`

// Capitalizes the first letter of (all) words. e.g. good cause => Good Cause
const capitalizeFirstLetter = string => {
  const strings = string.split(' ')
  const stringsCapitalized = map(strings, x => x.charAt(0).toUpperCase() + x.slice(1))
  return stringsCapitalized.join(' ')
}

const CustomTooltip = ({ active, payload, label }) => {
  // payload[0].value could be zero, so can't do !!payload[0].value
  if (active && !!payload && !!payload[0] && payload[0].value !== undefined && payload[0].value !== null) {
    return (
      <div >
        <StyledTooltipContent className="label">{`${label} : ${payload[0].value}`}</StyledTooltipContent>
      </div>
    )
  } else {
    return null
  }
}

const SupportRequestChart = props => {
  const { data, typesOfSupportRequests } = prepareDataForComposedChart(props.metrics, props.filterLabel, props.filterStartDate, props.filterEndDate)
  const [filter, setFilter] = useState(typesOfSupportRequests[0])

  return (
    <>
      <Header>
        <HeaderText>
          Support Requests
        </HeaderText>
        <Select
          value={filter}
          onChange={event => setFilter(event.target.value)}
          name='support'>
          {map(typesOfSupportRequests, supportRequestType => (
            <MenuItem
              key={supportRequestType}
              value={supportRequestType}>
              {capitalizeFirstLetter(supportRequestType)}
            </MenuItem>))}
        </Select>
      </Header>
      <ComposedChart
        data={data}
        xKey='label'>
        <Line type="monotone" dataKey={filter} stroke={props.colors[0]} />
        <Tooltip content={CustomTooltip} />
      </ComposedChart>
    </>
  )
}

const mapStateToProps = state => {

  return {
    filterLabel: state.filters.filterLabel,
    filterStartDate: state.filters.dateFilters.start,
    filterEndDate: state.filters.dateFilters.end,
    metrics: state.metrics.dailyMetrics
  }
}

export default connect(
  mapStateToProps
)(SupportRequestChart)
