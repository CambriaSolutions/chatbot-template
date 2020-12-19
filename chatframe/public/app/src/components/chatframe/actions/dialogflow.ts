import { format, parse, differenceInMilliseconds } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { get, find, omit } from 'lodash'
import { reportError } from '../reportError'
import {
  SAVE_CLIENT,
  SAVE_RESPONSE,
  INITIATE_LOADING,
  SHOW_BUTTON_BAR,
  HIDE_BUTTON_BAR,
  DISPLAY_ERROR,
  CLEAR_ERROR,
  RECEIVE_WEBHOOK_DATA,
  DISABLE_INPUT,
  ENABLE_INPUT,
  SET_CONVERSATION_ENDED,
  SET_OUTPUT_CONTEXTS
} from './actionTypes'
// Date Format
import { sysTimeFormat } from '../config/dateFormats'

import { Client } from '../conversationClient'

export function setupDialogflow(clientOptions) {
  return dispatch => {
    const client = new Client(clientOptions)
    const clientName = 'dialogflow'
    dispatch({ type: SAVE_CLIENT, client, clientName })
  }
}

export function saveResponse(data) {
  return (dispatch, getState) => {
    const { messages } = getState().conversation
    const hasSuggestion = find(data.responses, ['type', 'suggestion'])

    if (hasSuggestion) {
      dispatch({ type: SHOW_BUTTON_BAR })
    } else {
      dispatch({ type: HIDE_BUTTON_BAR })
    }
    if (messages.length === 0) {
      dispatch({ type: SAVE_RESPONSE, newConversationArray: [data] })
    } else {
      const newConversationArray = messages
        .map(msg => {
          return msg.loading ? data : msg
        })
        .sort((a, b) => {
          const dateA = parse(
            a.systemTime,
            sysTimeFormat,
            new Date(a.systemTime)
          )
          const dateB = parse(
            b.systemTime,
            sysTimeFormat,
            new Date(b.systemTime)
          )
          const diff = differenceInMilliseconds(dateA, dateB)
          return diff
        })

      dispatch({ type: SAVE_RESPONSE, newConversationArray })
    }
  }
}

export function getMessageFromDialogflow(response) {
  return (dispatch, getState) => {
    function mapMessageTypeToDescriptor(type) {
      switch (type) {
        case 'text':
          return 'text'
        case 'card':
          return 'card'
        case 'quickReplies':
          return 'suggestion'
        case 'image':
          return 'image'
        case 'payload':
          return 'payload'
        default:
          return 'text'
      }
    }
    const rawOutputContexts = get(response, 'queryResult.outputContexts', [])
    dispatch({ type: SET_OUTPUT_CONTEXTS, rawOutputContexts })

    const rawResponses = get(response, 'queryResult.fulfillmentMessages', [])
    let unfilteredResponses = []
    let containsDisablePayload = false
    try {
      unfilteredResponses = rawResponses.map(msg => {
        const type = mapMessageTypeToDescriptor(msg.message)
        const suggestions = get(msg, 'quickReplies.quickReplies', [])
        const text = get(msg, 'text.text', null)
        const card = {
          title: get(msg, 'card.title', ''),
          subtitle: get(msg, 'card.subtitle', ''),
          imageUrl: get(msg, 'card.imageUri', ''),
          buttons: get(msg, 'card.buttons', []),
        }
        const image = {
          imageUri: get(msg, 'image.imageUri', ''),
          accessibilityText: get(msg, 'image.accessibilityText', ''),
        }

        const payload: any = {}
        if (type === 'payload') {
          const rawPayload = get(msg, 'payload.fields', {})
          for (const [field, data] of Object.entries(rawPayload) as any) {
            if (data.kind === 'stringValue') {
              try {
                // Attempt to parse data.stringValue as JSON in case it is
                payload[field] = JSON.parse(data.stringValue)
              } catch (err) {
                // It's not JSON, just add the string
                payload[field] = data.stringValue
              }
            } else if (data.kind && data.kind !== 'stringValue') {
              throw new Error('Use stringValue to send payloads')
            } else {
              return payload
            }
          }
          // Check for disable input property
          if ('disableInput' in payload) {
            // If there is more than just a dispable input propert in the payload
            // remove disableInput and handle the rest of the payload data
            if (Object.keys(payload).length > 1) {
              const modifiedPayload = omit(payload, ['disableInput'])
              dispatch({ type: RECEIVE_WEBHOOK_DATA, modifiedPayload })
            }
            containsDisablePayload = true
            dispatch({ type: DISABLE_INPUT })
          } else {
            dispatch({ type: RECEIVE_WEBHOOK_DATA, payload })
          }
        }

        switch (type) {
          case 'text':
            return { type, text }

          case 'image':
            return { type, image }

          case 'suggestion':
            return { type, suggestions }

          case 'card':
            return { type, card }

          case 'payload':
            return { type, payload }

          default:
            return { type, text }
        }
      })
    } catch (error) {
      reportError(error, getState().config.reportErrorUrl).then()
    }

    let responses
    if (containsDisablePayload) {
      responses = unfilteredResponses.filter(response => {
        const containsDisableInput = get(
          response,
          'payload.disableInput',
          false
        )
        return !containsDisableInput
      })
    } else {
      dispatch({ type: ENABLE_INPUT })
      responses = unfilteredResponses
    }
    const systemTime = format(new Date(), sysTimeFormat)
    const data = {
      entity: 'bot',
      loading: false,
      messageId: response.responseId,
      key: uuidv4(),
      messageSession: response.session,
      language: response.queryResult.languageCode,
      systemTime,
      responses,
    }

    dispatch(saveResponse(data))
  }
}

const constructEmptyResponse = (response) => ({
  ...response,
  queryResult: {
    ...response.queryResult,
    fulfillmentMessages: [{
      message: '',
      platform: 'PLATFORM_UNSPECIFIED',
      text: {
        text: ['']
      }
    }],
    fulfillmentText: ''
  }
})

// Code 0 === Webhook execution successful
// Code 4 === Webhook call failed. Error: DEADLINE_EXCEEDED.
// Code 14 === Webhook call failed. Error: UNAVAILABLE.
const sendDialogflowRequest = (requestFunction, payload) => {
  try {
    // Make the first attempt to fetch intent
    // Request #1
    return requestFunction(payload).then(response1 => {
      // If response timed out, try again
      if (response1.webhookStatus.code === 4) {
        // Request #2
        return requestFunction(payload).then(response2 => {
          // If the second response timed out, try one last time
          if (response2.webhookStatus.code === 4) {
            // Request #3
            return requestFunction(payload).then(response3 => {
              // The request has failed three times in a row. Something is wrong.
              if (response3.webhookStatus.code !== 0) {
                // return a response that indicates there is an issue.
                return constructEmptyResponse(response3)
              }

              // Request 3 was successful. Return response.
              return response3
            })

            // If the second request had an error other than timeout,
            // then we will not retry. Return error message.
          } else if (response2.webhookStatus.code !== 0) {
            // return a response that indicates there is an issue.
            return constructEmptyResponse(response2)
          }

          // Request 2 was successful. Return response.
          return response2
        })

        // If the first request had an error other than timeout,
        // then we will not retry. Return error message.
      } else if (response1.webhookStatus.code !== 0) {
        // return a response that indicates there is an issue.
        return constructEmptyResponse(response1)
      }

      // Request 1 was successful. Return response.
      return response1
    })
  } catch (e) {
    console.error(e)
    return {}
  }
}

const sendToDialogflow = (type: 'textRequest' | 'eventRequest', payload: any) => {
  return (dispatch, getState) => {
    const { client } = getState().conversation

    dispatch({ type: INITIATE_LOADING })
    dispatch({ type: DISABLE_INPUT })

    sendDialogflowRequest(client[type], payload)
      .then(response => {
        if (response) {
          dispatch(getMessageFromDialogflow(response))
          dispatch({ type: CLEAR_ERROR })
        } else {
          dispatch({
            type: DISPLAY_ERROR,
            error: 'No response received from chat provider. Please try again.',
          })

          if (type === 'eventRequest') {
            dispatch({ type: SET_CONVERSATION_ENDED })
          }
        }
      })
      .catch(error => {
        throw new Error(error)
      })
      .catch(error => {
        reportError(error, getState().config.reportErrorUrl).then()
        dispatch({
          type: DISPLAY_ERROR,
          error: 'Unable to connect to the chat provider. Please try again.',
        })
      })
  }
}

export const sendMessageWithDialogflow = (message) => sendToDialogflow('textRequest', message)

export const sendEvent = (event) => sendToDialogflow('eventRequest', event)
