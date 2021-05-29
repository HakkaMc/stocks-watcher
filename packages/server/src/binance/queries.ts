import { BinanceAccountInformation, BinanceOrder, BinanceTrade } from '@sw/shared/src/graphql'
import { ReturnPromise } from '../types'
import { binanceQuery } from './api'

export type Balance = {
  asset: string
  locked: string
  free: string
}

export type ExchangeInfo = {
  symbol: string
  baseAsset: string
  quoteAsset: string
  filters: Record<string, Record<string, string | number | boolean>>
  ocoAllowed: boolean
}

const EPs = {
  accountInfo: '/api/v3/account',
  orders: '/api/v3/allOrderList',
  trades: '/api/v3/myTrades',
  recentTrades: '/api/v3/trades',
  historicalTrades: '/api/v3/historicalTrades',
  aggTrades: '/api/v3/aggTrades',
  openedOrders: '/api/v3/openOrders',
  exchangeInfo: '/api/v3/exchangeInfo',
  symbolAveragePrice: '/api/v3/avgPrice',
  symbolLatestPrice: '/api/v3/ticker/price',
  userDataStream: '/api/v3/userDataStream',
  testOrder: '/api/v3/order/test',
  newOrder: '/api/v3/order'
}

const symbolToPriceMap: Record<string, number> = {}

const exchangeInfoCache: { timestamp: number; data: Record<string, ExchangeInfo> } = {
  timestamp: 0,
  data: {}
}
export const getExchangeInfo = async (symbol?: string): ReturnPromise<Record<string, ExchangeInfo>> =>
  new Promise((resolve) => {
    if (exchangeInfoCache.timestamp < Date.now() - 30 * 60 * 1000) {
      if (symbol && exchangeInfoCache.data[symbol]) {
        return resolve({
          error: '',
          errorData: undefined,
          data: exchangeInfoCache.data
        })
      }
    }

    const params: any = {}

    if (symbol) {
      params.symbol = symbol
    }

    binanceQuery(
      {
        method: 'get',
        url: EPs.exchangeInfo,
        params
      },
      false
    ).then(
      (response) => {
        if (Array.isArray(response.data?.symbols)) {
          const symbolsMap: Record<string, ExchangeInfo> = {}

          response.data?.symbols.forEach((item: any) => {
            const filterMap: Record<string, any> = {}

            const filterAttributes = new Set([
              'avgPriceMins',
              'limit',
              'maxNumAlgoOrders',
              'maxNumOrders',
              'maxPrice',
              'maxQty',
              'minNotional',
              'minPrice',
              'minQty',
              'stepSize',
              'tickSize',
              'multiplierDown',
              'multiplierUp'
            ])

            if (Array.isArray(item.filters)) {
              item.filters.forEach((filter: Record<string, any>) => {
                const enhancedFilter = { ...filter }

                Object.entries(filter).forEach(([key, value]) => {
                  if (filterAttributes.has(key)) {
                    enhancedFilter[key] = parseFloat(value)
                  }
                })

                filterMap[filter.filterType] = enhancedFilter
              })
            }

            symbolsMap[item.symbol] = {
              ...item,
              filters: filterMap
            }
          })

          exchangeInfoCache.data = symbolsMap
          exchangeInfoCache.timestamp = Date.now()

          return resolve({
            error: '',
            errorData: undefined,
            data: exchangeInfoCache.data
          })
        }

        return resolve({
          error: 'GET_EXCHANGE_INFO_FAILED',
          errorData: undefined,
          data: {}
        })
      },
      (error) => {
        console.log(error)
        return resolve({
          error: 'GET_EXCHANGE_INFO_FAILED',
          errorData: error,
          data: {}
        })
      }
    )
  })

export const getUserDataStreamKey = async (): Promise<Record<string, string>> =>
  binanceQuery(
    {
      method: 'post',
      url: EPs.userDataStream
    },
    false
  ).then(
    (response) => {
      return response.data?.listenKey || ''
    },
    (error) => {
      console.log(error)
      return ''
    }
  )

const getSymbolPrice = async (symbol: string, url: string): ReturnPromise<number> =>
  new Promise((resolve) => {
    binanceQuery(
      {
        method: 'get',
        url,
        params: {
          symbol
        }
      },
      false
    ).then(
      (response) => {
        if (response.data) {
          symbolToPriceMap[symbol] = parseFloat(response.data?.price) || 0
          return resolve({
            error: '',
            errorData: undefined,
            data: symbolToPriceMap[symbol]
          })
        }
        return resolve({
          error: 'GET_SYMBOL_PRICE_FAILED',
          errorData: undefined,
          data: Number.NaN
        })
      },
      (error) => {
        console.log(error)
        return resolve({
          error: 'GET_SYMBOL_PRICE_FAILED',
          errorData: error,
          data: Number.NaN
        })
      }
    )
    // }
  })

export const getSymbolAveragePrice = async (symbol: string): ReturnPromise<number> =>
  getSymbolPrice(symbol, EPs.symbolAveragePrice)

export const getSymbolLatestPrice = async (symbol: string): ReturnPromise<number> =>
  getSymbolPrice(symbol, EPs.symbolLatestPrice)

export const getAccountInformation = async (): Promise<{
  error: string
  errorData: any
  data: BinanceAccountInformation | undefined
}> =>
  new Promise(async (resolve) => {
    binanceQuery(
      {
        method: 'get',
        url: EPs.accountInfo
      },
      true
    ).then(
      async (response) => {
        const data = response.data as BinanceAccountInformation

        data.balances.forEach((balance) => {
          balance.free = parseFloat(balance.free.toString())
          balance.locked = parseFloat(balance.locked.toString())
        })

        return resolve({ error: '', errorData: undefined, data })
      },
      (error) => {
        console.log(error)
        return resolve({
          error: 'GET_ACCOUNT_INFORMATION_FAILED',
          errorData: error,
          data: undefined
        })
      }
    )
  })

export const getAccountInfo = async (): Promise<Balance[]> =>
  new Promise(async (resolve) => {
    binanceQuery(
      {
        method: 'get',
        url: EPs.accountInfo
      },
      true
    ).then(
      async (response) => {
        return resolve(response.data?.balances || [])
      },
      (error) => {
        console.log(error)
        return resolve([])
      }
    )
  })

export const getOrders = async (): ReturnPromise<Array<BinanceOrder>> =>
  new Promise((resolve) => {
    binanceQuery(
      {
        method: 'get',
        url: EPs.openedOrders
      },
      true
    ).then(
      (response) => {
        const strToNbr = [
          'price',
          'origQty',
          'executedQty',
          'cummulativeQuoteQty',
          'stopPrice',
          'icebergQty',
          'origQuoteOrderQty'
        ]

        if (Array.isArray(response.data)) {
          response.data.forEach((item) => {
            strToNbr.forEach((key) => {
              item[key] = parseFloat(item[key])
            })
          })

          return resolve({
            error: '',
            errorData: undefined,
            data: response.data
          })
        }

        return resolve({
          error: 'GET_ORDERS_FAILED',
          errorData: undefined,
          data: []
        })
      },
      (error) => {
        console.log(error)
        return resolve({
          error: 'GET_ORDERS_FAILED',
          errorData: error,
          data: []
        })
      }
    )
  })

export const getTrades = async (symbol: string): ReturnPromise<BinanceTrade[]> =>
  new Promise(async (resolve) => {
    binanceQuery(
      {
        method: 'get',
        url: EPs.trades,
        params: {
          symbol,
          limit: 1000,
          recvWindow: 60000
        }
      },
      true
    ).then(
      async (response) => {
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach((item: any) => {
            item.price = parseFloat(item.price)
            item.qty = parseFloat(item.qty)
            item.quoteQty = parseFloat(item.quoteQty)
            item.commission = parseFloat(item.commission)
          })

          return resolve({
            error: '',
            errorData: undefined,
            data: response.data
          })
        }

        return resolve({
          error: '',
          errorData: '',
          data: []
        })
      },
      (error) => {
        console.log(error)
        return resolve({
          error: 'GET_TRADES_FAILED',
          errorData: error,
          data: []
        })
      }
    )
  })

export const placeOrder = async (orderQuery: Record<string, any>, production = false): ReturnPromise =>
  new Promise(async (resolve) => {
    binanceQuery(
      {
        method: 'post',
        url: production ? EPs.newOrder : EPs.testOrder,
        params: orderQuery
      },
      true
    ).then(
      async (response) => {
        // console.log(response)
        console.log(response.status, response.config, response.data)

        const data = { ...response.data }

        if ('status' in data) {
          const keys = ['price', 'origQty', 'executedQty', 'cummulativeQuoteQty']

          keys.forEach((key) => (data[key] = parseFloat(data[key])))
        }

        if ('status' in data && 'fills' in data && Array.isArray(data.fills)) {
          const keys = ['price', 'qty', 'commission']

          data.fills.forEach((item: Record<string, any>) => {
            keys.forEach((key) => (item[key] = parseFloat(item[key])))
          })
        }

        return resolve({
          error: '',
          errorData: undefined,
          data
        })
      },
      (error) => {
        // console.log(error.status, error.config, error.data)
        console.log(error?.response?.status, error?.config, error?.response?.data)
        return resolve({
          error: 'PLACE_ORDER_FAILED',
          errorData: error,
          data: {}
        })
      }
    )
  })

export const cancelOrder = async (orderQuery: {
  symbol: string
  orderId?: number
  origClientOrderId?: string
}): ReturnPromise =>
  new Promise(async (resolve) => {
    const enhancedOrderQuery: any = {
      symbol: orderQuery.symbol
    }

    if (typeof orderQuery.orderId === 'number' && !Number.isNaN(orderQuery.orderId)) {
      enhancedOrderQuery.orderId = orderQuery.orderId
    }

    if (typeof orderQuery.origClientOrderId === 'string' && orderQuery.origClientOrderId.length) {
      enhancedOrderQuery.origClientOrderId = orderQuery.origClientOrderId
    }

    if (!('orderId' in enhancedOrderQuery || 'origClientOrderId' in enhancedOrderQuery)) {
      return resolve({
        error: 'MISSING_ATTRIBUTE',
        errorData: '',
        data: ''
      })
    }

    const orders = await getOrders()

    if (orders.error) {
      return resolve({
        error: 'CANCEL_ORDER_FAILED',
        errorData: orders.errorData,
        data: ''
      })
    }

    if (
      !orders.data.find(
        (order) =>
          order.orderId === enhancedOrderQuery.orderId || order.clientOrderId === enhancedOrderQuery.origClientOrderId
      )
    ) {
      return resolve({
        error: 'ORDER_TO_CANCEL_NOT_FOUND',
        errorData: '',
        data: ''
      })
    }

    binanceQuery(
      {
        method: 'delete',
        url: EPs.newOrder,
        params: enhancedOrderQuery
      },
      true
    ).then(
      async (response) => {
        // console.log(response)
        console.log(response.status, response.config, response.data)
        return resolve({
          error: '',
          errorData: undefined,
          data: response
        })
      },
      (error) => {
        // console.log(error.status, error.config, error.data)
        console.log(error?.response?.status, error?.config, error?.response?.data)
        return resolve({
          error: 'CANCEL_ORDER_FAILED',
          errorData: error,
          data: {}
        })
      }
    )
  })
