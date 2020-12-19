import React, { Component } from 'react'
import styled from 'styled-components'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts'
import EmptyChart from './EmptyChart'
import { chunkString } from '../common/helper'

const ChartContainer = styled.div`
  height: ${(props: any) => (props.height ? props.height : '300px')};
` as any

class CustomizedAxisTick extends Component<any> {
  render() {
    const {
      x,
      y,
      payload,
      width,
      maxChars,
      lineHeight,
      fontSize,
      fill,
    }: any = this.props

    const chunks = chunkString(payload.value, maxChars)
    const yPos = chunks.length === 1 ? 4 : chunks.length === 2 ? -2 : -9
    const tspans = chunks.map((s, i) => (
      <tspan x={0} y={yPos} dy={i * lineHeight} key={s}>
        {s}
      </tspan>
    ))
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          width={width}
          height='auto'
          textAnchor='end'
          fontSize={fontSize}
          fill={fill}
        >
          {tspans}
        </text>
      </g>
    )
  }
}

(CustomizedAxisTick as any).defaultProps = {
  width: 50,
  maxChars: 14,
  fontSize: 12,
  lineHeight: 12,
  fill: '#333',
}

const barChart = props => {
  let chartUI
  if (props.data && props.data.length > 0) {
    chartUI = (
      <ResponsiveContainer>
        <BarChart
          width={500}
          height={300}
          data={props.data}
          layout='vertical'
          margin={{
            top: 5,
            right: 20,
            left: 30,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis type='number' />
          <YAxis
            type='category'
            dataKey={'name'}
            tick={<CustomizedAxisTick maxChars={props.maxChars} />}
            width={props.width}
          />
          <Tooltip />
          <Bar dataKey={props.dataKey} fill='#8884d8' maxBarSize={45} label>
            {props.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={props.colors[index]} />
            ))}
            {props.dataLabel && (
              <LabelList dataKey={`${props.dataLabel}`} position='right' />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  } else {
    chartUI = <EmptyChart icon='contact_support' message={props.emptyMsg} />
  }

  return <ChartContainer height={props.height}>{chartUI}</ChartContainer>
}

export default barChart
