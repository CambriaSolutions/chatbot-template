import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { parse, format, isSameDay, subDays } from 'date-fns'
import grey from '@material-ui/core/colors/grey'
import Typography from '@material-ui/core/Typography'
import Markdown from 'markdown-to-jsx'
import Link from '@material-ui/core/Link'
import { withTheme } from '@material-ui/core/styles'
import { sysTimeFormat } from './config/dateFormats'
import Loading from './Loading'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 5px;
  height: min-content;
  align-items: ${(p: any) => (p.entity === 'user' ? 'flex-end' : 'flex-start')};
  scroll-margin: 15px;
  p, div {
    font-size: 14px;
  }
` as any

const ChatBubble = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  padding: 0;
  justify-content: ${(p: any) => (p.entity === 'user' ? 'flex-end' : 'flex-start')};
` as any

const ExternalMessage = styled.div`
  && {
    background: ${grey[400]};
    border-top-right-radius: 10px;
    border-top-left-radius: 1px;
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
    padding: 9px;
  }
` as any

const UserMessage = styled.div`
  && {
    max-width: 360px;
    overflow: hidden;
    background-color: ${p => p.theme.palette.primary.main};
    color: #ffffff;
    border-top-left-radius: 10px;
    border-top-right-radius: 1px;
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
    padding: 9px;
  }
` as any

const Timestamp = styled(Typography)`
  && {
    color: ${grey[500]};
    margin-top: 6px;
    padding-left: 5px;
    padding-right: 2px;
    font-size: 13px;
  }
`

const markdownOptions = {
  forceBlock: true,
  overrides: {
    h6: {
      component: Typography,
      props: {
        variant: 'h6',
      },
    },
    p: {
      component: Typography,
      props: {
        variant: 'body1',
      },
    },
    a: {
      component: Link,
    },
    b: {
      component: ({ children }) => (
        <b>{children}</b>
      )
    }
  },
}

class Message extends Component<any> {
  state = { isResponseDelayed: false }
  loadingTimer: any = null

  componentDidMount() {
    const { isLoading } = this.props

    if (isLoading) {
      this.loadingTimer = setTimeout(() => {
        this.setState(() => ({ isResponseDelayed: true }))
      }, 8000)
    }
  }

  componentWillUnmount() {
    clearTimeout(this.loadingTimer)
  }

  render() {
    const {
      message,
      entity,
      isLoading,
      timestamp,
      currentTime,
      theme,
      showTimestamp,
      error,
      className,
      key
    } = this.props

    const { isResponseDelayed } = this.state

    const parsedTimestamp = parse(
      timestamp,
      sysTimeFormat,
      new Date(currentTime)
    )
    const isToday = isSameDay(new Date(), parsedTimestamp)
    const isYesterday = isSameDay(parsedTimestamp, subDays(new Date(), 1))

    let formattedTimestamp = null

    if (isToday) {
      formattedTimestamp = `Today ${format(parsedTimestamp, 'h:mm aa')}`
    } else if (isYesterday) {
      formattedTimestamp = `Yesterday ${format(parsedTimestamp, 'h:mm aa')}`
    } else {
      formattedTimestamp = format(parsedTimestamp, 'MMMM dd, yyyy h:mm aa')
    }

    let filteredBotMessage

    if (message && message[0] !== '') {
      filteredBotMessage = message
    } else {
      filteredBotMessage = [
        'I’m sorry, I am having trouble understanding that question right now. Please try again later or ask me something else.',
      ]
    }
    const delayedResponseMessage = 'Thank you for your patience, I’m working hard to get you the best answer. Hold tight!'

    return (
      <Container entity={entity} className={className} key={key}>
        <ChatBubble entity={entity}>
          {entity === 'user' ?
            (
              <UserMessage elevation={1} theme={theme}>
                {message}
              </UserMessage>
            ) : null}
          {entity !== 'user' ?
            (
              <ExternalMessage elevation={1}>
                {isLoading && !error && !isResponseDelayed ? <Loading /> : null}
                {isLoading && !error && isResponseDelayed ? (
                  <Markdown options={markdownOptions}>
                    {delayedResponseMessage}
                  </Markdown>
                ) : null}
                {isLoading && error}
                {!isLoading ? (
                  <Markdown options={markdownOptions}>
                    {filteredBotMessage[0]}
                  </Markdown>
                ) : null}
              </ExternalMessage>
            ) : null}
        </ChatBubble>
        {showTimestamp ? (
          <Timestamp variant='caption'>{formattedTimestamp}</Timestamp>
        ) : null}
      </Container>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentTime: state.conversation.currentTime,
    error: state.error,
  }
}
export default withTheme()(connect(mapStateToProps)(Message))
