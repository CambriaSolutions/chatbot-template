import React, { PureComponent } from 'react'
import styled from 'styled-components'

// Colors
import green from '@material-ui/core/colors/green'

const Container = styled.div`
  text-align: center;
  width: 42px;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  align-items: center;
`

const Dot = styled.div`
  animation: dot-keyframes 1s infinite ease-in-out;
  background-color: ${green[900]};
  border-radius: 10px;
  display: inline-block;
  height: 8px;
  width: 8px;

  &:nth-child(2) {
    animation-delay: 0.25s;
  }

  &:nth-child(3) {
    animation-delay: 0.5s;
  }

  @keyframes dot-keyframes {
    0% {
      opacity: 0.4;
      transform: scale(1, 1);
    }

    50% {
      opacity: 1;
      transform: scale(1.3, 1.3);
    }

    100% {
      opacity: 0.4;
      transform: scale(1, 1);
    }
  }
`

class Loading extends PureComponent {
  render() {
    return (
      <Container>
        <Dot />
        <Dot />
        <Dot />
      </Container>
    )
  }
}

export default Loading
