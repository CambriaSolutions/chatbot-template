import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import React, { PureComponent } from 'react'
import styled from 'styled-components'
import WebFont from 'webfontloader'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import thunkMiddleware from 'redux-thunk'
import 'whatwg-fetch'
import grey from '@material-ui/core/colors/grey'
import createTheme from './createTheme'
import ActivatorButton from './ActivatorButton'
import ChatContainer from './ChatContainer'
import rootReducer from './reducers/rootReducer'
import { initialize } from './actions/initialization'
import { Theme } from '@material-ui/core'


WebFont.load({
  google: {
    families: ['Roboto:300,400,500', 'Product Sans:400'],
  },
})

const OuterContainer = styled.div`
  width: 100%;
  height: 100%;
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999999;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  align-content: center;
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
  line-height: normal; /*For WordPress*/
  & > * {
    box-sizing: border-box;
    font-family: 'Roboto', sans-serif;

    & ::-webkit-scrollbar-thumb {
      background-color: ${grey[600]};
      -webkit-border-radius: 8px;
      border-radius: 8px;
      border: 2px solid ${grey[100]};
    }
    & ::-webkit-scrollbar {
      background-color: ${grey[100]};
      width: 8px;
    }
  }
`

const composeEnhancer = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

interface Props {
  primaryColor: string;
  secondaryColor: string;
  headerColor: string;
  title: string;
  client: string;
  clientOptions: {
    eventUrl: string;
    textUrl: string;
  }
  fullscreen: boolean;
  initialActive: boolean;
  policyText: string;
  mapConfig: {
    googleMapsKey: string,
    centerCoordinates: {
      lat: number,
      lng: number
    }
  };
  feedbackUrl: string;
  activationText: string;
  reportErrorUrl: string;
}

class ChatFrame extends PureComponent<Props> {
  store = createStore(rootReducer, composeEnhancer(applyMiddleware(thunkMiddleware)))
  currentValue = null
  theme: Theme

  constructor(props: Props) {
    super(props)
    this.theme = createTheme(
      this.props.primaryColor,
      this.props.secondaryColor,
      this.props.headerColor
    )
  }

  componentDidMount() {
    // We load the initial options into the Redux store inside of the
    // componentDidMount() lifecycle hook. This lets us use Redux to manage
    // state instead of passing props down manually.
    this.store.dispatch(initialize(this.props) as any)
  }

  render() {
    return (
      <Provider store={this.store}>
        <MuiThemeProvider theme={this.theme}>
          <OuterContainer>
            <ChatContainer />
            <ActivatorButton />
          </OuterContainer>
        </MuiThemeProvider>
      </Provider>
    )
  }
}

export default ChatFrame
