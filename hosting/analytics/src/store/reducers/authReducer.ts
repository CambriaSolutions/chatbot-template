import * as actionTypes from '../actions/actionTypes'

const initialState = {
  isLoggedIn: false,
  user: null,
  isLoading: true,
  isAuthenticating: false
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_USER:
      return {
        ...state,
        user: action.user,
        isLoggedIn: action.isLoggedIn,
      }
    case actionTypes.UPDATE_USER_STATUS:
      return {
        ...state,
        isLoggedIn: true
      }
    case actionTypes.SIGNIN_START:
      return {
        ...state,
        isLoading: true,
        isAuthenticating: true
      }
    case actionTypes.SIGNIN_FAIL:
      return {
        ...state,
        isLoading: false,
        isAuthenticating: false
      }
    case actionTypes.SIGNIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        user: action.user,
        isLoading: false,
        isAuthenticating: false
      }
    case actionTypes.SIGNOUT_USER:
      return {
        ...state,
        isLoggedIn: false,
        isLoading: false,
        isAuthenticating: false,
        user: null,
      }
    default:
      return state
  }
}

export default reducer
