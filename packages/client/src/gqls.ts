import gql from 'graphql-tag'

export const GET_DASHBOARD = gql`
  query {
    getDashboard {
      watchlists {
        _id
        name
        hidden
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

export const BINANCE_LAST_PRICE_SUBSCRIPTION = gql`
  subscription BinanceLastPriceSubscription($symbol: String!) {
    binanceLastPrice(symbol: $symbol) {
      ask
      bid
      diff
      diffPercentage
      middle
      symbol
      timestamp
    }
  }
`

export const BINANCE_BALANCE_UPDATE_SUBSCRIPTION = gql`
  subscription binanceBalanceUpdate {
    binanceBalanceUpdate {
      asset
      clearTime
      delta
      eventTime
    }
  }
`

export const BINANCE_ORDER_UPDATE_SUBSCRIPTION = gql`
  subscription binanceOrderUpdate {
    binanceOrderUpdate {
      eventTime
      orderId
      side
      symbol
      transactionTime
    }
  }
`

export const BINANCE_OCO_ORDER_UPDATE_SUBSCRIPTION = gql`
  subscription binanceOcoOrderUpdate {
    binanceOcoOrderUpdate {
      eventTime
      symbol
      transactionTime
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
    findSymbols(filter: { search: $search }, sort: SYMBOL_ASC) {
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

export const CHANGE_WATCHLIST_SETTINGS = gql`
  mutation ChangeWatchlistSettings($id: String!, $hidden: Boolean, $name: String) {
    changeWatchlistSettings(id: $id, hidden: $hidden, name: $name)
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
    getNote {
      text
    }
  }
`

export const SAVE_NOTE = gql`
  mutation($text: String!) {
    saveNote(text: $text)
  }
`

export const GET_PRICE_ALERTS = gql`
  query getPriceAlerts($symbol: String!) {
    getPriceAlerts(symbol: $symbol) {
      _id
      symbol
      targetPrice
      actualPrice
    }
  }
`

export const SET_PRICE_ALERT = gql`
  mutation setPriceAlert($symbol: String!, $targetPrice: Float!) {
    setPriceAlert(symbol: $symbol, targetPrice: $targetPrice)
  }
`

export const REMOVE_PRICE_ALERT = gql`
  mutation setPriceAlert($id: String!) {
    removePriceAlert(id: $id)
  }
`

export const GET_REMINDERS = gql`
  query {
    getReminders {
      _id
      title
      text
      timestamp
    }
  }
`

export const SET_REMINDER = gql`
  mutation setReminder($title: String!, $text: String!, $timestamp: Float!) {
    setReminder(title: $title, text: $text, timestamp: $timestamp)
  }
`

export const REMOVE_REMINDER = gql`
  mutation removeReminder($id: String!) {
    removeReminder(id: $id)
  }
`

export const GET_BINANCE_ACCOUNT_INFORMATION = gql`
  {
    getBinanceAccountInformation {
      accountType
      balances {
        asset
        free
        locked
      }
      buyerCommission
      canDeposit
      canTrade
      canWithdraw
      makerCommission
      permissions
      sellerCommission
      takerCommission
      updateTime
    }
  }
`

// export const GET_BINANCE_REPORT = gql`
//   {
//     getBinanceReport {
//       actualPrice
//       gain
//       percentageGain
//       price
//       symbols {
//         symbol
//         actualPricePerShare
//         amount
//         pricePerShare
//         realizedProfit
//         unrealizedProfit
//         price
//         actualPrice
//         unrealizedPercentageProfit
//       }
//     }
//   }
// `
export const SET_BINANCE_SELL_ORDER = gql`
  query setBinanceSellOrder(
    $symbol: String!
    $priceType: String!
    $price: Float!
    $quantityType: String!
    $quantity: Float!
    $quoteOrderQty: Float!
  ) {
    setBinanceSellOrder(
      symbol: $symbol
      priceType: $priceType
      price: $price
      quantityType: $quantityType
      quantity: $quantity
      quoteOrderQty: $quoteOrderQty
    )
  }
`

export const SET_BINANCE_BUY_ORDER = gql`
  query setBinanceBuyOrder(
    $symbol: String!
    $priceType: String!
    $price: Float!
    $quantityType: String!
    $quantity: Float!
    $quoteOrderQty: Float!
  ) {
    setBinanceBuyOrder(
      symbol: $symbol
      priceType: $priceType
      price: $price
      quantityType: $quantityType
      quantity: $quantity
      quoteOrderQty: $quoteOrderQty
    )
  }
`

export const GET_BINANCE_TRADES = gql`
  query getBinanceTrades($symbol: String!) {
    getBinanceTrades(symbol: $symbol) {
      commission
      commissionAsset
      id
      isBuyer
      orderId
      price
      qty
      quoteQty
      symbol
      time
    }
  }
`

export const GET_BINANCE_EXCHANGE_INFORMATION = gql`
  query getBinanceExchangeInformation {
    getBinanceExchangeInformation {
      baseAsset
      filters
      ocoAllowed
      quoteAsset
      symbol
    }
  }
`

export const GET_BINANCE_ORDERS = gql`
  query getBinanceOrders {
    getBinanceOrders {
      symbol
      orderId
      orderListId
      clientOrderId
      price
      origQty
      executedQty
      cummulativeQuoteQty
      status
      timeInForce
      type
      side
      stopPrice
      time
      updateTime
      isWorking
      origQuoteOrderQty
    }
  }
`

export const CANCEL_BINANCE_ORDER = gql`
  query cancelBinanceOrder($symbol: String!, $orderId: Int!, $origClientOrderId: String!) {
    cancelBinanceOrder(symbol: $symbol, orderId: $orderId, origClientOrderId: $origClientOrderId) {
      clientOrderId
      cummulativeQuoteQty
      executedQty
      orderId
      orderListId
      origClientOrderId
      origQty
      price
      side
      status
      symbol
      timeInForce
      type
    }
  }
`

export const SET_TRAILING_STOP_ORDER = gql`
  mutation setTrailingStopOrder(
    $activateOnPrice: Float!
    $sellOnPrice: Float!
    $symbol: String!
    $priceType: String!
    $quantityType: String!
    $quantity: Float!
    $quoteOrderQty: Float!
  ) {
    setTrailingStopOrder(
      symbol: $symbol
      activateOnPrice: $activateOnPrice
      sellOnPrice: $sellOnPrice
      priceType: $priceType
      quantityType: $quantityType
      quantity: $quantity
      quoteOrderQty: $quoteOrderQty
    )
  }
`

export const SET_MOVING_BUY_ORDER = gql`
  mutation setMovingBuyOrder(
    $activateOnPrice: Float!
    $percent: Float!
    $symbol: String!
    $priceType: String!
    $quantityType: String!
    $quantity: Float!
    $quoteOrderQty: Float!
  ) {
    setMovingBuyOrder(
      symbol: $symbol
      activateOnPrice: $activateOnPrice
      percent: $percent
      priceType: $priceType
      quantityType: $quantityType
      quantity: $quantity
      quoteOrderQty: $quoteOrderQty
    )
  }
`

export const GET_ORDERS = gql`
  query getOrders {
    getOrders {
      _id
      fixedTrailingStop {
        activateOnPrice
        sellOnPrice
        activatedTimestamp
        priceType
        quantity
        quantityType
        quoteOrderQty
      }
      movingBuy {
        activateOnPrice
        percent
        priceType
        quantity
        quantityType
        quoteOrderQty
      }
      percentageTrailingStop {
        activateOnPrice
        percentageDecrease
      }
      type
      createdAt
      symbol
      exchange
    }
  }
`

export const CANCEL_ORDER = gql`
  mutation cancelOrder($orderId: String!) {
    cancelOrder(orderId: $orderId)
  }
`
