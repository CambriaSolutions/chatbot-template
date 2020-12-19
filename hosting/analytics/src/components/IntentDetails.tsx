import React, { Component } from 'react'
import styled from 'styled-components'
import IntentDetailsList from './IntentDetailsList'

// Material UI
import CircularProgress from '@material-ui/core/CircularProgress'
import DialogContent from '@material-ui/core/DialogContent'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'

const StyledContentSection = styled.div`
  min-height: 530px;
`

const CenterDiv = styled.div`
  text-align: center;
  padding-top: 25px;
  margin: auto;
  width: 250px;
  height: 150px;
  max-width: 100%;
  max-height: 100%;
`

const FlexBox = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 13px;
`

const StyledItemDisplay = styled.div`
  padding-right: 20px;
`

const StyledBackArrow = styled(ArrowBackIosIcon)`
  font-size: 19px;
`

const StyledForwardArrow = styled(ArrowForwardIosIcon)`
  font-size: 19px;
`

class IntentDetails extends Component<any> {
  state = {
    width: window.innerWidth,
    loading: false,
  }
  size = 0
  dialogRef: any = React.createRef()
  timeout: any = null

  componentDidMount() {
    this.setState({
      width: this.dialogRef.current.clientWidth,
    })
  }

  UNSAFE_componentWillMount() {
    window.addEventListener('resize', this.handleWindowSizeChange)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange)
  }

  handleWindowSizeChange = () => {
    this.setState({ loading: true })
    if (this.timeout) clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.setState({
        width: this.dialogRef.current.clientWidth,
        loading: false,
      })
    }, 200)
  }

  previousPage = () => {
    if (this.props.paginationPage > 1) {
      this.props.previousPage()
    }
  }

  nextPage = () => {
    if (this.props.paginationPage < Math.ceil(this.props.totalIntentDetailsCount / 4)) {
      this.props.nextPage()
    }
  }

  render() {
    const {
      totalIntentDetailsCount,
      paginationPage
    } = this.props

    let detailsUI = (
      <DialogContent>
        <CenterDiv>
          <h3>Loading intent details...</h3>
          <CircularProgress />
        </CenterDiv>
      </DialogContent>
    )

    if (
      !this.props.loading &&
      this.props.data.length > 0 &&
      !this.state.loading
    ) {
      this.size = this.props.data.length
      detailsUI = (
        <IntentDetailsList
          color={this.props.color}
          data={this.props.data}
          timezoneOffset={this.props.timezoneOffset}
          width={this.state.width}
        />
      )
    }

    return (
      <div ref={this.dialogRef}>
        <StyledContentSection>
          {detailsUI}
        </StyledContentSection>
        <FlexBox>
          <StyledItemDisplay>
            {`${paginationPage * 4 - 3} - ${paginationPage * 4 <= totalIntentDetailsCount ? paginationPage * 4 : totalIntentDetailsCount} of ${totalIntentDetailsCount}`}
          </StyledItemDisplay>
          <StyledBackArrow onClick={this.previousPage} />
          <StyledForwardArrow onClick={this.nextPage} />
        </FlexBox>
      </div>)
  }
}

export default IntentDetails
