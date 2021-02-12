import React from 'react'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import { Provider as ReduxProvider } from 'react-redux'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { WebSocketLink } from '@apollo/client/link/ws'
import {
  createMuiTheme,
  makeStyles,
  createStyles,
  Theme as AugmentedTheme,
  ThemeProvider
} from '@material-ui/core/styles'
import { orange, blue, purple } from '@material-ui/core/colors'

import { StoreProvider } from './contexts'
import { dictionary } from './locales'
import { store } from './redux'
import { initSagas } from './redux/sagas'
import { GRAPHQL_ENDPOINT } from './constants'

import './styles.module.scss'

import { Router } from './Router'

initSagas()

const locale = 'cs'

const websocketLink = new WebSocketLink({
  uri: `wss://${window.location.host}${GRAPHQL_ENDPOINT}`,
  options: {
    // onError: (error:any) => {
    //   console.error(error)
    //   return error
    // },
    reconnect: true,
    lazy: true
    // connectionParams: () => {
    //   // debugger
    //   const accessToken = window.sessionStorage.getItem('accessToken')
    //
    //   console.log('connectionParams: ', accessToken)
    //
    //   return {
    //     headers: {
    //       Authorization: accessToken ? `Bearer ${accessToken}` : "",
    //       authToken: accessToken
    //       // authorization: accessToken
    //     }
    //   }
    // }
  }
})

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: websocketLink,
  credentials: 'include'
})

const theme = createMuiTheme({
  palette: {
    primary: {
      main: blue[700]
    }
  },
  overrides: {
    // MuiAppBar:{
    //   colorPrimary: {
    //     backgroundColor: purple[500]
    //   }
    // }
  }
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <ReduxProvider store={store}>
      <IntlProvider messages={dictionary[locale]} locale={locale} defaultLocale="en">
        <StoreProvider>
          <ThemeProvider theme={theme}>
            <Router />
          </ThemeProvider>
        </StoreProvider>
      </IntlProvider>
    </ReduxProvider>
  </ApolloProvider>,
  document.getElementById('root')
)
