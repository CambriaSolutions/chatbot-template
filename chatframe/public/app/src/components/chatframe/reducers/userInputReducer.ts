import * as t from '../actions/actionTypes'

const initialState = {
  value: '',
  charLength: 0,
  maxExceeded: false,
}
function userInput(state = initialState, action) {
  switch (action.type) {
    case t.SAVE_USER_INPUT:
      return action.userInput
    default:
      return state
  }
}

export default userInput
