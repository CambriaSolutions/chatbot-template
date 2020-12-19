import React from 'react'
import styled from 'styled-components'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import BarChart from './BarChart'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'

const Modal = styled(Dialog)`
  && {
    min-height: 70vh;
  }
`

function ChartModal({
  open,
  handleClose,
  title,
  chartData,
  colors,
  height,
  maxChars,
  dataKey,
  width,
  dataLabel,
}) {
  return (
    <div>
      <Modal onClose={handleClose} open={open} fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <BarChart
          height={height}
          maxChars={maxChars}
          data={chartData}
          dataKey={dataKey}
          colors={colors}
          width={width}
          emptyMsg={`No ${chartData} found`}
          dataLabel={dataLabel}
        />
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Modal>
    </div>
  )
}

export default ChartModal
