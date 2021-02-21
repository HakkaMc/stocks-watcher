import gql from 'graphql-tag'

export const GET_DASHBOARD = gql`
  query {
    getDashboard {
      watchlists{
        _id
        name
        symbols
        symbolsData {
          _id
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

export const GET_DAILY_CHANGE_INDICATOR = gql`
  query GetDailyChangeIndicator($symbol: String!) {
    getDailyChangeIndicator(symbol: $symbol) {
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
    findSymbols(filter: { search: $search }, sort:SYMBOL_ASC) {
      description
      symbol
      displaySymbol
      type
    }
  }
`

export const SAVE_SYMBOL_TO_DASHBOARD = gql`
  mutation SaveSymbolToDashboard($symbol: String!, $watchlist: String!) {
    saveSymbolToDashboard(symbol: $symbol, watchlist: $watchlist)
  }
`

export const CHANGE_SYMBOL_WATCHLIST = gql`
  mutation ChangeSymbolWatchlist($symbol: String!, $watchlist: String!, $add: Boolean!) {
    changeSymbolWatchlist(symbol: $symbol, watchlist: $watchlist, add: $add)
  }
`

export const CREATE_WATCHLIST = gql`
  mutation CreateSymbolFlag($watchlist: String!) {
    createWatchlist(watchlist: $watchlist)
  }
`
export const GET_PRICES = gql`
  query($symbol: String!, $timestampFrom: Float, $timestampTo: Float, $range: String) {
    getPrices(symbol: $symbol, timestampFrom: $timestampFrom, timestampTo: $timestampTo, range: $range) {
      priceArray {
        price
        timestamp
      }
    }
  }
`

export const GET_CHART_GROUPS = gql`
  query {
    getChartGroups {
      _id
      name
      charts {
        symbol
        symbolData {
          description
          displaySymbol
          symbol
        }
      }
    }
  }
`
export const GET_CHART_GROUP = gql`
  query($chartGroupId: String!) {
    getChartGroup(chartGroupId: $chartGroupId) {
      _id
      name
      charts {
        symbol
      }
    }
  }
`

export const CREATE_CHART_GROUP = gql`
  mutation createChartGroup($name: String!) {
    createChartGroup(name: $name) {
      _id
      name
    }
  }
`

export const REMOVE_CHART_GROUP = gql`
  mutation removeChartGroup($chartGroupId: String!) {
    removeChartGroup(chartGroupId: $chartGroupId)
  }
`

export const ADD_CHART_TO_CHART_GROUP = gql`
  mutation addChartToChartGroup($chartGroupId: String!, $symbol: String!, $order: Int!, $range: String!) {
    addChartToChartGroup(chartGroupId: $chartGroupId, symbol: $symbol, order: $order, range: $range)
  }
`
export const REMOVE_CHART_FROM_CHART_GROUP = gql`
  mutation removeChartFromChartGroup($chartGroupId: String!, $symbol: String!) {
    removeChartFromChartGroup(chartGroupId: $chartGroupId, symbol: $symbol)
  }
`
export const REMOVE_SYMBOL_FROM_DASHBOARD = gql`
  mutation removeSymbolFromDashboard($symbol: String!) {
    removeSymbolFromDashboard(symbol: $symbol)
  }
`

export const GET_NOTE = gql`
  query {
    getNote{
      text
    }
  }
`

export const SAVE_NOTE = gql`
  mutation ($text: String!){
    saveNote(text: $text)
  }
`

export const GET_PRICE_ALERTS = gql`
  query getPriceAlerts($symbol: String!){
    getPriceAlerts(symbol: $symbol){
      _id
      symbol
      targetPrice
      actualPrice
    }
  }
`

export const SET_PRICE_ALERT = gql`
  mutation setPriceAlert($symbol: String!, $targetPrice: Float!){
    setPriceAlert(symbol: $symbol, targetPrice: $targetPrice)
  }
`

export const REMOVE_PRICE_ALERT = gql`
  mutation setPriceAlert($id: String!){
    removePriceAlert(id: $id)
  }
`
