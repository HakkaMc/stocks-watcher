import { WebSocketLink } from '@apollo/client/link/ws'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'

import { GRAPHQL_ENDPOINT } from '../constants'

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

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: websocketLink,
  credentials: 'include'
})
