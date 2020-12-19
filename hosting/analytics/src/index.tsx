import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import ReduxThunk from 'redux-thunk'
import rootReducer from './store/reducers/rootReducer'

import './index.scss'
import App from './App'

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose // Used for local debugging
const composeEnhancers = compose

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(ReduxThunk))
)

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)