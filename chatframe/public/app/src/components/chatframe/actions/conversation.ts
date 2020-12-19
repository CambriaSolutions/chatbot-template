import { format } from 'date-fns'
import { reportError } from '../reportError'
import {
  SAVE_USER_RESPONSE,
  DISPLAY_ERROR,
  HIDE_BUTTON_BAR,
} from './actionTypes'
import { setupDialogflow, sendMessageWithDialogflow, sendEvent } from './dialogflow'
// Date Format
import { sysTimeFormat } from '../config/dateFormats'

export function setupClient(client, clientOptions) {
  return (dispatch, getState) => {
    try {
      if (!client) {
        throw new Error('No conversation provider selected.')
      }
      // Setup Dialogflow
      if (client.toLowerCase() === 'dialogflow') {
        dispatch(setupDialogflow(clientOptions))
      } else {
        // Unrecognized client
        dispatch({
          type: DISPLAY_ERROR,
          error: `Unable to connect to ${client}`,
        })
        throw new Error(`${client} is not a recognized conversation provider.`)
      }
    } catch (error) {
      reportError(error, getState().config.reportErrorUrl).then()
    }
  }
}
export function sendMessage(message, isEvent = false) {
  return (dispatch, getState) => {
    const { clientName } = getState().conversation
    try {
      if (clientName.toLowerCase() === 'dialogflow') {
        dispatch(isEvent ? sendEvent(message.replace(' ', '-')) : sendMessageWithDialogflow(message))
      } else {
        throw new Error(
          `${clientName} is not a recognized conversation provider.`
        )
      }
    } catch (error) {
      reportError(error, getState().config.reportErrorUrl).then()

      // Unrecognized client
      dispatch({
        type: DISPLAY_ERROR,
        error: `Unable to connect to ${clientName}`,
      })
    }
  }
}

export function sendQuickReply(text, isEvent = false) {
  return (dispatch, getState) => {
    const numMessages = getState().conversation.messages.length
    const systemTime = format(new Date(), sysTimeFormat)
    const response = {
      entity: 'user',
      messageId: `usermessage-${numMessages}`,
      systemTime,
      text,
    }
    dispatch({ type: SAVE_USER_RESPONSE, response })
    dispatch({ type: HIDE_BUTTON_BAR })
    dispatch(sendMessage(text, isEvent))
  }
}