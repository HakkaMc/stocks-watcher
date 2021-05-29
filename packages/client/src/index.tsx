import React from 'react'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import { Provider as ReduxProvider } from 'react-redux'
import { ApolloProvider } from '@apollo/client'

import {
  createMuiTheme,
  makeStyles,
  createStyles,
  Theme as AugmentedTheme,
  ThemeProvider
} from '@material-ui/core/styles'
import { orange, blue, purple } from '@material-ui/core/colors'

import { apolloClient } from './api/apollo'
import { StoreProvider } from './contexts'
import { dictionary } from './locales'
import { store } from './redux'
import { initSagas } from './redux/sagas'

import './styles.module.scss'

import { Router } from './Router'
// import {ModalStack} from "./modules/ModalStack/ModalStack";
import { CentralModal } from './modules/CentralModal/CentralModal'
import { ModalLoader } from './modules/ModalLoader/ModalLoader'

initSagas()

const locale = 'cs'

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
  <ApolloProvider client={apolloClient}>
    <ReduxProvider store={store}>
      <IntlProvider messages={dictionary[locale]} locale={locale} defaultLocale="en">
        <StoreProvider>
          <ThemeProvider theme={theme}>
            <Router />
            <CentralModal />
            <ModalLoader />
          </ThemeProvider>
        </StoreProvider>
      </IntlProvider>
    </ReduxProvider>
  </ApolloProvider>,
  document.getElementById('root')
)
