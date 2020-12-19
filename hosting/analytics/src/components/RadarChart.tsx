import React from 'react'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts'
import EmptyChart from './EmptyChart'

const radarChart = props => {
  let chartUI
  if (props.data && props.data.length > 0) {
    chartUI = (
      <ResponsiveContainer>
        <RadarChart outerRadius={90} width={500} height={300} data={props.data}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey={'name'}
            width={110}
            style={{ fontSize: 12 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, props.total]} />
          <Tooltip />
          <Radar
            name='Count'
            dataKey={props.dataKey}
            stroke={props.color}
            fill={props.color}
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    )
  } else {
    chartUI = <EmptyChart message='No feedback found' />
  }

  return <div style={{ width: '100%', height: 300 }}>{chartUI}</div>
}

export default radarChart
