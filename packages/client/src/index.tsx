import React from 'react'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import { Provider as ReduxProvider } from 'react-redux'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { WebSocketLink } from '@apollo/client/link/ws'
import { StoreProvider } from './contexts'
import { dictionary } from './locales'
import { store } from './redux'
import { initSagas } from './redux/sagas'
import { GRAPHQL_ENDPOINT } from './constants'

import App from './modules/App/App'

initSagas()

const locale = 'cs'

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new WebSocketLink({
    uri: GRAPHQL_ENDPOINT,
    reconnect: true,
    lazy: true
  })
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <ReduxProvider store={store}>
      <IntlProvider messages={dictionary[locale]} locale={locale} defaultLocale="en">
        <StoreProvider>
          <App />
        </StoreProvider>
      </IntlProvider>
    </ReduxProvider>
  </ApolloProvider>,
  document.getElementById('root')
)
