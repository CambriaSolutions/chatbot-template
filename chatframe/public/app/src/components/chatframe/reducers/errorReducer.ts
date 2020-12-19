import * as t from '../actions/actionTypes'

const initialState = ''
function config(state = initialState, action) {
  switch (action.type) {
    case t.DISPLAY_ERROR:
      return action.error

    case t.CLEAR_ERROR:
      return initialState

    default:
      return state
  }
}

export default config
