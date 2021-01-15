import gql from 'graphql-tag'

export const GET_USER_PROFILE = gql`
  query {
    getUserProfile {
      dashboard {
        watchedSymbols {
          description
          displaySymbol
          symbol
          type
        }
      }
    }
  }
`

export const LAST_PRICE_SUBSCRIPTION = gql`
  subscription lastPriceSubscription($symbol: String!) {
    lastPrice(symbol: $symbol) {
      price
      symbol
      timestamp
      volume
    }
  }
`

export const GET_ROC_INDICATOR = gql`
  query GetRocIndicator($symbol: String!) {
    getRocIndicator(symbol: $symbol) {
      sum
      days {
        date
        value
      }
    }
  }
`
export const GET_QUOTE = gql`
  query GetQuote($symbol: String!) {
    getQuote(symbol: $symbol) {
      currentPrice
      highPrice
      lowPrice
      openPrice
      previousClose
    }
  }
`

export const SYMBOL_LIST_QUERY = gql`
  query FindSymbols($search: String!) {
    findSymbols(filter: { search: $search }) {
      description
      symbol
      displaySymbol
      type
    }
  }
`

export const SAVE_SYMBOL_TO_DASHBOARD = gql`
  mutation SaveSymbolToDashboard($symbol: String!) {
    saveSymbolToDashboard(symbol: $symbol) {
      description
      symbol
      displaySymbol
      type
    }
  }
`
