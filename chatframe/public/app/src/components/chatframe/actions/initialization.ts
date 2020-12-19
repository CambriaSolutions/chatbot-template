import get from 'lodash/get'
import { reportError } from '../reportError'
import {
  SET_TITLE,
  SHOW_WINDOW,
  HIDE_WINDOW,
  FULLSCREEN,
  WINDOWED,
  SET_CONVERSATION_STARTED,
  SHOW_PRIVACY_POLICY,
  HIDE_PRIVACY_POLICY,
  SET_PRIVACY_POLICY,
  SET_GOOGLE_MAPS_KEY,
  SET_CENTER_COORDINATES,
  SET_ACTIVATION_TEXT,
  SET_FEEDBACK_URL,
  SET_REPORT_ERROR_URL,
} from './actionTypes'

import { setupClient } from './conversation'
import { sendEvent } from './dialogflow'

export function showWindow() {
  return (dispatch, getState) => {
    const { conversationStarted } = getState().conversation
    dispatch({ type: SHOW_WINDOW })
    if (!conversationStarted) {
      dispatch(sendEvent('Welcome'))
      dispatch({ type: SET_CONVERSATION_STARTED })
    }
  }
}
export function showPrivacyPolicy() {
  return { type: SHOW_PRIVACY_POLICY }
}
export function hidePrivacyPolicy() {
  return { type: HIDE_PRIVACY_POLICY }
}
export function hideWindow() {
  return { type: HIDE_WINDOW }
}
export function showFullscreen() {
  return { type: FULLSCREEN }
}
export function showWindowed() {
  return { type: WINDOWED }
}

export function initialize(props) {
  return dispatch => {
    const {
      title,
      client,
      clientOptions,
      initialActive,
      fullscreen,
      policyText,
      mapConfig,
      activationText,
      feedbackUrl,
      reportErrorUrl,
    } = props

    dispatch({ type: SET_TITLE, title })
    dispatch(setupClient(client, clientOptions))

    if (policyText && policyText !== '') {
      dispatch({ type: SET_PRIVACY_POLICY, policyText })
    }

    if (activationText && activationText !== '') {
      dispatch({ type: SET_ACTIVATION_TEXT, activationText })
    }

    if (feedbackUrl) {
      dispatch({ type: SET_FEEDBACK_URL, feedbackUrl })
    }

    if (reportErrorUrl) {
      dispatch({ type: SET_REPORT_ERROR_URL, reportErrorUrl })
    }

    if (mapConfig) {
      const { googleMapsKey, centerCoordinates } = mapConfig
      const latitude = get(centerCoordinates, 'lat', null)
      const longitude = get(centerCoordinates, 'lng', null)

      if (googleMapsKey && googleMapsKey !== '') {
        dispatch({ type: SET_GOOGLE_MAPS_KEY, googleMapsKey })
      }
      if (centerCoordinates) {
        try {
          if (
            typeof centerCoordinates === 'object' &&
            latitude !== null &&
            longitude !== null
          ) {
            dispatch({ type: SET_CENTER_COORDINATES, centerCoordinates })
          } else {
            throw new Error(
              'Please provide valid latitude and longitude coordinates, see README'
            )
          }
        } catch (error) {
          reportError(error, reportErrorUrl).then()
        }
      }
    }

    if (initialActive === true) {
      dispatch({ type: SET_CONVERSATION_STARTED })
      dispatch(sendEvent('Welcome'))
      dispatch(showWindow())
    } else {
      dispatch(hideWindow())
    }

    if (fullscreen === true) {
      dispatch(showFullscreen())
    } else {
      dispatch(showWindowed())
    }
  }
}
