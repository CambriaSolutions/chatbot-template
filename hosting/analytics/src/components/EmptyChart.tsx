import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import Icon from '@material-ui/core/Icon'

class EmptyChart extends Component<any> {
  render() {
    const CenterDiv = styled.div`
      text-align: center;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      width: 300px;
      height: 100px;
      max-width: 100%;
      max-height: 100%;
      overflow: auto;
      .material-icons {
        font-size: 50px;
        color: ${this.props.mainColor};
        opacity: 0.6;
      }
      h4 {
        color: #999;
        margin-top: 2px;
      }
    `

    return (
      <CenterDiv>
        <Icon>{this.props.icon ? this.props.icon : 'speaker_notes_off'}</Icon>
        <h4>{this.props.message}</h4>
      </CenterDiv>
    )
  }
}

const mapStateToProps = state => {
  return {
    mainColor: state.filters.mainColor,
  }
}

export default connect(mapStateToProps)(EmptyChart)
