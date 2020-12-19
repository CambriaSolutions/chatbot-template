import { parse, format, differenceInMilliseconds } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import * as t from '../actions/actionTypes'
import { sysTimeFormat } from '../config/dateFormats'
import { findLast, find } from 'lodash'

const initialState: State['conversation'] = {
  client: null,
  clientName: null,
  messages: [],
  webhookPayload: null,
  disableInput: false,
  lastUpdateTime: format(new Date(), sysTimeFormat),
  currentTime: format(new Date(), sysTimeFormat),
  timer: null,
  conversationStarted: false,
  suggestions: []
}

const findLastMessageWithSuggestions = (messages) => findLast(messages, m => {
  const hasSuggestions = find(m.responses, ['type', 'suggestion'])
  return hasSuggestions
})

const getSuggestionsFromMessage = message => message && message.responses ? message.responses.filter(m => m.type === 'suggestion')[0].suggestions : []

function conversation(state = initialState, action) {
  let suggestions = []
  let newMessages = []

  switch (action.type) {
    case t.SAVE_CLIENT:
      return { ...state, client: action.client, clientName: action.clientName }

    case t.INITIATE_LOADING:
      newMessages = [
        ...state.messages,
        {
          loading: true,
          entity: 'bot',
          systemTime: format(new Date(), sysTimeFormat),
        },
      ]

      suggestions = getSuggestionsFromMessage(findLastMessageWithSuggestions(newMessages))

      return {
        ...state,
        messages: newMessages,
        suggestions
      }

    case t.SAVE_RESPONSE:
      suggestions = getSuggestionsFromMessage(findLastMessageWithSuggestions(action.newConversationArray))

      return {
        ...state,
        lastUpdateTime: format(new Date(), sysTimeFormat),
        messages: action.newConversationArray,
        suggestions
      }

    case t.SAVE_USER_RESPONSE:
      newMessages = [...state.messages, { ...action.response, key: uuidv4() }].sort((a, b) => {
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
        const diff = differenceInMilliseconds(dateB, dateA)
        return diff
      })

      suggestions = getSuggestionsFromMessage(findLastMessageWithSuggestions(newMessages))

      return {
        ...state,
        lastUpdateTime: format(new Date(), sysTimeFormat),
        messages: newMessages,
        suggestions
      }

    case t.RECEIVE_WEBHOOK_DATA:
      return {
        ...state,
        webhookPayload: action.payload,
      }

    case t.ENABLE_INPUT:
      return {
        ...state,
        disableInput: false,
      }

    case t.DISABLE_INPUT:
      return {
        ...state,
        disableInput: true,
      }

    case t.SET_CONVERSATION_STARTED:
      return {
        ...state,
        conversationStarted: true,
      }

    case t.SET_CONVERSATION_ENDED:
      return {
        ...state,
        conversationStarted: false,
      }

    case t.SET_OUTPUT_CONTEXTS:
      return {
        ...state,
        outputContexts: action.rawOutputContexts
      }

    default:
      return state
  }
}

export default conversation
