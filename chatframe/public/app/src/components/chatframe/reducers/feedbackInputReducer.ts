import * as t from '../actions/actionTypes'

const initialState = {
  submitted: false,
  wasHelpful: null,
  feedbackList: null,
}

function feedbackInput(state = initialState, action) {
  switch (action.type) {
    case t.SAVE_FEEDBACK_INPUT:
      return {
        ...state,
        feedbackList: state.feedbackList.map(item => {
          if (item.value === action.value.value) {
            return { ...item, checked: action.value.checked }
          }
          return item
        }),
      }
    case t.SET_FEEDBACK_OPTIONS:
      return {
        ...state,
        wasHelpful: action.value.helpful,
        feedbackList: action.value.options.map(item => {
          return { ...item, checked: false }
        }),
      }
    case t.SET_FEEDBACK_SUBMITTED:
      return { ...state, submitted: true }
    default:
      return state
  }
}

export default feedbackInput
