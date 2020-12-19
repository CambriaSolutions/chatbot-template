import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import red from '@material-ui/core/colors/red'

const Container = styled.div`
  grid-area: errorbar;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  padding: ${(p: any) => (p.visible ? '24px 16px' : '0 16px')};
  background: ${red[300]};
  border-top: ${(p: any) => (p.visible ? `1px solid ${red[500]}` : 'none')};
  color: ${red[700]};
` as any

class ErrorBar extends PureComponent<{ error: State['error'] }> {
  render() {
    const { error } = this.props
    return <Container visible={error !== ''}>{error}</Container>
  }
}

const mapStateToProps = state => {
  return {
    error: state.error,
  }
}

export default connect(mapStateToProps)(ErrorBar)
