import { map, filter, find, forEach } from 'lodash'
import { Suggestion } from 'dialogflow-fulfillment'

// Gets text responses from the fulfillment messages in the request
// There might be multiple text objects in the fulfillmentMessages array, but every "text" object will always have one 
// text object inside of it, will only one string in the array, hence we always look at index 0
export const getTextResponses = (fulfillmentMessages) => map(filter(fulfillmentMessages, f => f.text), x => x.text.text[0])

export const getSuggestions = (fulfillmentMessages) => {
  // There should only ever be one payload object in the fulfillmentMessage object
  const customPayload = find(fulfillmentMessages, x => x.payload) ? find(fulfillmentMessages, x => x.payload).payload : null

  return customPayload ? customPayload.suggestions : []
}

export const shouldHandleEndConversation = (fulfillmentMessages) => {
  // There should only ever be one payload object in the fulfillmentMessage object
  const customPayload = find(fulfillmentMessages, x => x.payload) ? find(fulfillmentMessages, x => x.payload).payload : null

  return customPayload ? customPayload.handleEndConversation : false
}

// If a request comes in with responses set in dialogflow, or a custom payload specifying
// which suggestions to include, this function will handle it.
export const genericHandler = (agent, textResponses, suggestions) => {
  if (textResponses) {
    forEach(textResponses, text => {
      if (text) {
        agent.add(text)
      }
    })
  }

  if (suggestions) {
    forEach(suggestions, suggestion => {
      if (suggestion) {
        new Suggestion(suggestion)
      }
    })
  }
  forEach(suggestions, x => agent.add(new Suggestion(x)))
}