import * as t from '../actions/actionTypes'

const initialState = {
  visible: false,
  buttons: [],
}
function config(state = initialState, action) {
  switch (action.type) {
    case t.SHOW_BUTTON_BAR:
      return {
        ...state,
        visible: true,
      }
    case t.HIDE_BUTTON_BAR:
      return {
        ...state,
        visible: false,
      }

    case t.INITIATE_LOADING:
      return {
        ...state,
        paginationPage: 1
      }

    case t.SAVE_RESPONSE:
      return {
        ...state,
        paginationPage: 1
      }

    case t.SAVE_USER_RESPONSE:
      return {
        ...state,
        paginationPage: 1
      }

    case t.CHANGE_SUGGESTION_PAGE:
      return {
        ...state,
        paginationPage: action.paginationPage
      }

    default:
      return state
  }
}

export default config
