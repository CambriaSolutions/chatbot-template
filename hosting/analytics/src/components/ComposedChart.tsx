import React from 'react'
import { ComposedChart, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const composedChart = (props) => (
  <div>
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart width={600} height={300} data={props.data}>
        {props.children}
        <XAxis dataKey={props.xKey} />
        <YAxis />
      </ComposedChart>
    </ResponsiveContainer>
  </div>
)

export default composedChart