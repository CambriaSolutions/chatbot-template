import React from 'react'
import Button from '@material-ui/core/Button'
import BarChart from './BarChart'
import ChartModal from './ChartModal'
import Paper from '@material-ui/core/Paper'
import styled from 'styled-components'

const ViewMoreButton = styled(Button)`
  && {
    height: 38px;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`
const GraphWrap = styled(Paper)`
  padding: 15px;
  position: relative;
  background-color: rgb(250, 250, 250) !important;
  height: 93%;
  h3 {
    margin-top: 5px;
  }
`

function SupportRequestsTile({ supportRequests, colors }) {
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }
  return (
    <>
      <GraphWrap>
        <Header>
          <h3>Top support requests</h3>
          <ViewMoreButton onClick={handleClickOpen} color='primary'>
            View All
          </ViewMoreButton>
        </Header>
        <BarChart
          data={supportRequests.slice(0, 5)}
          dataKey='occurrences'
          colors={colors}
          emptyMsg='No support requests found'
        />
        <ChartModal
          height='70vh'
          maxChars={20}
          dataKey='occurrences'
          width={110}
          dataLabel={'occurrences'}
          handleClose={handleClose}
          open={open}
          chartData={supportRequests}
          title={'Support Requests'}
          colors={colors}
        />
      </GraphWrap>
    </>
  )
}

export default SupportRequestsTile
