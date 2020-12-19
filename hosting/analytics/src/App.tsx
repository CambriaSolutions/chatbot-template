import React, { Component } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Snackbar from '@material-ui/core/Snackbar'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles'
import ThemedApp from './containers/ThemedApp'
import PrivateRoute from './PrivateRoute'
import SignIn from './components/SignIn'
import { fetchUser, closeSnackbar } from './store/actions'

import { createGlobalStyle } from 'styled-components'
import background from './img/grey.png'

const GlobalStyle = createGlobalStyle`
  body {
    background-image: url(${background});
  }
`
const theme = {
  typography: {
    fontSize: 13,
  },
}

interface Props {
  fetchUser: () => any,
  snackbarOpen: any,
  closeSnackbar: any,
  snackbarMessage: string,
  isLoggedIn: boolean
}

class App extends Component<Props> {
  UNSAFE_componentWillMount() {
    this.props.fetchUser()
  }

  render() {
    const {
      snackbarOpen,
      closeSnackbar,
      snackbarMessage,
      isLoggedIn,
    } = this.props

    return (
      <Router>
        <div className='container'>
          <Route path='/login' component={SignIn} />

          <PrivateRoute
            exact
            path='/'
            loggedIn={isLoggedIn}
            component={ThemedApp}
          />

          <MuiThemeProvider theme={createMuiTheme(theme)}>
            <Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              open={snackbarOpen}
              autoHideDuration={4000}
              onClose={closeSnackbar}
              message={<span id='message-id'>{snackbarMessage}</span>}
            />
          </MuiThemeProvider>
        </div>
        <GlobalStyle />
      </Router>
    )
  }
}

const mapStateToProps = (state: any) => {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    isLoading: state.auth.isLoading,
    snackbarOpen: state.config.snackbarOpen,
    snackbarMessage: state.config.snackbarMessage,
  }
}

export default connect(
  mapStateToProps,
  { fetchUser, closeSnackbar }
)(App)
