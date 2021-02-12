import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import isEqual from 'lodash/isEqual'
import merge from 'lodash/merge'
import grey from '@material-ui/core/colors/grey'
import { forEachRight, sortBy } from 'lodash'
import Message from './Message'
import CardResponse from './CardResponse'
import MapResponse from './MapResponse'
import FeedbackResponse from './FeedbackResponse'
import { media } from './styles/media'

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* Vertically flips the container element to achieve flex-direction:column-reverse effect */
  transform: scale(1, -1);
  overflow: auto;
  ${(media as any).tablet`
    flex-direction: column-reverse;
    overflow: auto;
    transform: none;
  `};
` as any

const Content = styled.div`
  background: ${grey[100]};
  z-index: 4;
  grid-area: chatwindow;
  margin-bottom: 1px;

  /* Vertically flips the content element so that the messages won't be upside down */
  transform: scale(1, -1);

  ${(media as any).tablet`
   transform: none;
  `};
` as any

function buildUserMessage(message) {
  return (
    <Message
      message={message.text}
      entity={message.entity}
      key={message.key}
      timestamp={message.systemTime}
      isLoading={false}
    />
  )
}

function buildLoadingMessage(message) {
  return (
    <Message
      key='loading'
      entity='bot'
      timestamp={message.systemTime}
      isLoading={message.loading}
    />
  )
}

function buildFeedbackResponse(message, shouldScrollIntoView = false) {
  return (
    <FeedbackResponse
      feedbackData={message.payload.feedback}
      session={message.session}
      entity={message.entity}
      key={message.key}
      isLoading={false}
      timestamp={message.systemTime}
      className={shouldScrollIntoView ? 'scrollIntoView' : ''}
    />
  )
}

function buildBotTextMessage(message, showTimestamp, shouldScrollIntoView = false) {
  return (
    <Message
      message={message.text}
      entity={message.entity}
      key={message.key}
      isLoading={false}
      timestamp={message.systemTime}
      showTimestamp={showTimestamp}
      className={shouldScrollIntoView ? 'scrollIntoView' : ''}
    />
  )
}

function buildBotCardMessage(message, shouldScrollIntoView = false) {
  return (
    <CardResponse
      data={message.card}
      key={message.key}
      className={shouldScrollIntoView ? 'scrollIntoView' : ''}
    />
  )
}

function buildBotMapMessage(message, shouldScrollIntoView = false) {
  return (
    <MapResponse
      data={message.payload.mapPayload}
      timestamp={message.systemTime}
      key={message.key}
      className={shouldScrollIntoView ? 'scrollIntoView' : ''}
    />
  )
}
class ChatWindow extends PureComponent<any> {
  componentRef = React.createRef()

  state = { messageElements: [] }

  messages = []

  constructor(props) {
    super(props)
    this.componentRef = React.createRef()
  }

  componentDidMount() {
    (this.componentRef.current as any).addEventListener('wheel', this.handleWheel, { passive: false })
  }

  componentDidUpdate() {
    const newMessages = this.parseMessages()
    if (!isEqual(this.messages, newMessages)) {
      this.messages = newMessages
      this.createMessageElements()
    }
  }

  // Sometimes Gen's response is so long it exceeds the height of the
  // chat window and the window automatically scrolls to the bottom. This
  // function identifies the index of the first content bubble in Gen's latest
  // reply so we can use that index to auto scroll to the start of the response.
  findIndexFirstElementInLastResponse = (messages) => {
    let index: any = 0
    let indexFound = false

    // We use forEachRight because we can't just reverse the collection.
    // Need the index to decrease each iteration.
    forEachRight(messages, (m, mIndex) => {
      if (m.entity === 'bot') {
        if (!indexFound) {
          index = mIndex
        }
      } else {
        indexFound = true
      }
    })

    return index
  }

  // Parse the raw message structure from the Redux props and convert
  // it into the appropriate format for each Message
  parseMessages = () => {
    const { messages } = this.props
    const messageData = []

    messages.forEach(msg => {
      // We want to make sure that each message has all of the metadata
      // The structure of the response is not consistent, so we are building
      // a consistent object describing each message.
      const metadata = {
        systemTime: msg.systemTime,
        entity: msg.entity,
        session: msg.messageSession,
        key: msg.key,
      }

      if (msg.loading) {
        const loadingMessage = merge(msg, metadata)
        messageData.push(loadingMessage)
      } else if (msg.entity === 'bot') {
        // Bot messages contain an array of 'responses' -- we don't want to
        // display all of them here (e.g. suggestions), so we only push
        // the ones we display to the final array
        msg.responses.forEach((res, i) => {
          if (
            res.type === 'text' ||
            res.type === 'card' ||
            res.type === 'payload'
          ) {
            const botMessage = merge(res, { ...metadata, key: `${metadata.key}_${i}` })
            messageData.push(botMessage)
          }
        })
      } else if (msg.entity === 'user') {
        const userMessage = merge(msg, metadata)
        messageData.push(userMessage)
      }
    })
    return messageData
  }

  // For each message, create the appropriate React component and save
  // it for later use.
  createMessageElements = () => {
    const newMessages = this.parseMessages()
    const msgElements = []

    let sortedNewMessages = newMessages

    if (newMessages.length > 1) {
      sortedNewMessages = sortBy(newMessages, m => new Date(m.systemTime))
    }

    const indexFirstElementInLastResponse =
      this.findIndexFirstElementInLastResponse(sortedNewMessages)

    sortedNewMessages.forEach((msg, i) => {
      const shouldScrollIntoView = i === indexFirstElementInLastResponse
      let showTimestamp = false
      // set timestamp display flag to true if it's the last message
      if (i === sortedNewMessages.length - 1) {
        showTimestamp = true
      }

      if (msg.loading) {
        msgElements.push(buildLoadingMessage(msg))
      } else if (msg.entity === 'user') {
        msgElements.push(buildUserMessage(msg))
      } else if (msg.entity === 'bot' && msg.type === 'text') {
        msgElements.push(buildBotTextMessage(msg, showTimestamp, shouldScrollIntoView))
      } else if (msg.entity === 'bot' && msg.type === 'card') {
        msgElements.push(buildBotCardMessage(msg, shouldScrollIntoView))
      } else if (
        msg.entity === 'bot' &&
        msg.type === 'payload' &&
        msg.payload.mapPayload
      ) {
        msgElements.push(buildBotMapMessage(msg, shouldScrollIntoView))
      } else if (
        msg.entity === 'bot' &&
        msg.type === 'payload' &&
        msg.payload.feedback
      ) {
        msgElements.push(buildFeedbackResponse(msg, shouldScrollIntoView))
      } else {
        msgElements.push(
          buildBotTextMessage({ text: ['Something went wrong.'] }, false)
        )
      }
    })

    this.setState((prevState) => ({ ...prevState, messageElements: msgElements }), () => {
      // Only after state has been updated, scroll specified element into view.
      if (document.getElementsByClassName('scrollIntoView')[0]) {
        // Setting a timeout to 0 is a little trick meant to force the DOM call
        // to happen after the DOM has rendered.
        // This logic fails if the element doesn't exist by the time this line is reached.
        setTimeout(() => document.getElementsByClassName('scrollIntoView')[0].scrollIntoView(false), 0)
      }
    })
  }

  handleWheel = e => {
    // reverse scroll to handle the transform property
    if (e.deltaY) {
      e.preventDefault()
      e.currentTarget.scrollTop -=
        parseFloat(
          getComputedStyle(e.currentTarget).getPropertyValue('font-size')
        ) *
        (e.deltaY < 0 ? -1 : 1) *
        2
    }
  }

  render() {
    const { messageElements } = this.state

    return (
      <ContentWrapper ref={this.componentRef}>
        <Content elevation={1} square>
          {messageElements}
        </Content>
      </ContentWrapper>
    )
  }
}

const mapStateToProps = state => {
  return {
    messages: state.conversation.messages,
    buttonBarVisible: state.buttonBar.visible,
    error: state.error,
  }
}

export default connect(mapStateToProps)(ChatWindow)
