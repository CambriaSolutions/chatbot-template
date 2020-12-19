import * as actionTypes from './actionTypes'
import { authRef } from '../../Firebase'
import { toggleSettings } from './configActions'
import { fetchSubjectMatterSettings, showSnackbar } from './configActions'

export const fetchUser = () => dispatch => {
  authRef.onAuthStateChanged(user => {
    if (user) {
      dispatch({
        type: actionTypes.UPDATE_USER_STATUS,
      })
      // Retrieve settings & permissions attached to this user and subject matter
      dispatch(fetchSubjectMatterSettings(user))
    } else {
      // If no user, reset auth state
      dispatch({
        type: actionTypes.SIGNOUT_USER,
      })
    }
  })
}

export const signIn = (username, pwd) => {
  return dispatch => {
    dispatch({
      type: actionTypes.SIGNIN_START,
    })
    authRef
      .signInWithEmailAndPassword(username, pwd)
      .then(result => {
        // Retrieve settings & permissions attached to this user and subject matter
        dispatch(fetchSubjectMatterSettings(result.user))
      })
      .catch(error => {
        dispatch({
          type: actionTypes.SIGNIN_FAIL,
        })
        dispatch(showSnackbar(error.message))
      })
  }
}

export const completeSignIn = user => {
  return {
    type: actionTypes.SIGNIN_SUCCESS,
    user: user,
  }
}

export const resetPassword = () => {
  return (dispatch, getState) => {
    const user = getState().auth.user
    if (user) {
      authRef
        .sendPasswordResetEmail(user.email)
        .then(() => {
          dispatch(
            showSnackbar(
              `A password reset email has been sent to ${user.email}`
            )
          )
        })
        .catch(error => {
          console.log(error)
        })
    } else {
      dispatch(showSnackbar('No user was found'))
    }
  }
}

export const signOut = () => dispatch => {
  authRef
    .signOut()
    .then(() => {
      dispatch(toggleSettings(false))
      dispatch({
        type: actionTypes.SIGNOUT_USER,
      })
    })
    .catch(error => {
      console.log(error)
    })
}
