import { BinanceAccountInformation, BinanceOrder, BinanceTrade } from '@sw/shared/src/graphql'
import { ReturnPromise } from '../types'
import { binanceQuery } from './api'
import {
  DepositHistory,
  FiatOrderHistory,
  FiatPaymentHistory,
  UniversalTransferHistory
} from "@sw/shared/src/binanceTypes";
import { isDollarAsset } from "@sw/shared/src";

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
  newOrder: '/api/v3/order',
  depositHistory: '/sapi/v1/capital/deposit/hisrec',
  withdrawHistory: '/sapi/v1/capital/withdraw/history',
  fundingHistory: '/sapi/v1/asset/get-funding-asset',
  fiatOrderHistory: '/sapi/v1/fiat/orders',
  fiatPaymentHistory: '/sapi/v1/fiat/payments',
  universalTransferHistory: '/sapi/v1/asset/transfer'
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

export const getUserDataStreamKey = async (): Promise<string> =>
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

export const updateUserDataStreamKey = async (listenKey: string): ReturnPromise<string> =>
  new Promise((resolve) => {
    binanceQuery(
      {
        method: 'put',
        url: EPs.userDataStream,
        params: {
          listenKey
        }
      },
      false
    ).then(
      (response) => {
        console.log(response.data)

        if (response.data === null) {
          return resolve({
            error: '',
            errorData: undefined,
            data: 'OK'
          })
        }

        return resolve({
          error: 'UPDATE_USER_DATA_STREAM_KEY_FAILED',
          errorData: response.data,
          data: ''
        })
      },
      (error) => {
        console.log(error)
        return resolve({
          error: 'UPDATE_USER_DATA_STREAM_KEY_FAILED',
          errorData: error,
          data: ''
        })
      }
    )
  })

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

export const getOrder = async (orderId: number, userId: string, symbol: string): ReturnPromise<BinanceOrder> =>
  new Promise((resolve) => {
    binanceQuery(
      {
        method: 'get',
        url: EPs.newOrder,
        params: {
          orderId,
          symbol
        }
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

        if (response.data) {
          const data = { ...response.data }

          strToNbr.forEach((key) => {
            data[key] = parseFloat(data[key])
          })

          return resolve({
            error: '',
            errorData: undefined,
            data
          })
        }

        return resolve({
          error: 'GET_ORDER_FAILED',
          errorData: undefined,
          data: {} as any
        })
      },
      (error) => {
        console.log(error)
        return resolve({
          error: 'GET_ORDER_FAILED',
          errorData: error,
          data: {} as any
        })
      }
    )
  })

export const getTrades = async (symbol: string, startTime: number | undefined = 0): ReturnPromise<Array<any>> =>
  new Promise(async (resolve) => {
    binanceQuery(
      {
        method: 'get',
        url: EPs.trades,
        params: {
          symbol,
          limit: 1000,
          recvWindow: 60000,
          startTime
        }
      },
      true
    ).then(
      async (response) => {
        if (response.data && Array.isArray(response.data)) {
          const numerizeKeys = ['price', 'qty', 'quoteQty', 'commission']

          response.data.forEach((item: any) => {
            numerizeKeys.forEach((key) => {
              item[key] = parseFloat(item[key]) || 0
            })
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
          error: 'GET_BINANCE_TRADES_FAILED',
          errorData: error,
          data: []
        })
      }
    )
  })

export const placeOrder = async (orderQuery: Record<string, any>, reallyPlace = false): ReturnPromise =>
  new Promise(async (resolve) => {
    binanceQuery(
      {
        method: 'post',
        url: reallyPlace ? EPs.newOrder : EPs.testOrder,
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
          data: response.data
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

export const getDepositHistory = async (): ReturnPromise => new Promise(async (resolve)=>{
  const startTimestamp = new Date('2021-04-01 00:00')
  const now = new Date()
  const promises = []
  const loopCount = Math.ceil(now.getDate()-startTimestamp.getDate()/90)

  for(let i = 0; i<loopCount;i++){
    const startTime = new Date(startTimestamp)
    startTime.setDate(startTime.getDate()+(i===0?0:i*90+1))
    const endTime = new Date(startTime)
    endTime.setDate(endTime.getDate()+90)

    promises.push(binanceQuery(
      {
        method: 'get',
        url: EPs.depositHistory,
        params: {
          startTime: startTime.getTime(),
          endTime: endTime.getTime()
        }
      },
      true
    ))
  }

  console.log('Deposit history: ')

  await Promise.all(promises).then(async responses=>{
    responses.forEach(response=>{
      const data = response.data as DepositHistory

      if(Array.isArray(data)){
        data.forEach(item=>{
          console.log(item.amount, item.coin, new Date(item.insertTime).toLocaleString(), item.status)
        })
      }
    })
  }, error=>{
    console.log('GET_DEPOSIT_HISTORY_FAILED')
    console.log(error)
    return resolve({
      error: 'GET_DEPOSIT_HISTORY_FAILED',
      errorData: error,
      data: undefined
    })
  })
})

export const getWithdrawHistory = async (): ReturnPromise => new Promise(async (resolve)=>{
  binanceQuery(
    {
      method: 'get',
      url: EPs.withdrawHistory
    },
    true
  ).then(
    async (response) => {
      const data = response.data

      console.log('Withdraw history: ')
      console.log(data)

      return resolve({ error: '', errorData: undefined, data })
    },
    (error) => {
      console.log(error)
      return resolve({
        error: 'GET_WITHDRAW_HISTORY_FAILED',
        errorData: error,
        data: undefined
      })
    }
  )
})

export const getFundingHistory = async (): ReturnPromise => new Promise(async (resolve)=>{
  binanceQuery(
    {
      method: 'post',
      url: EPs.fundingHistory
    },
    true
  ).then(
    async (response) => {
      const data = response.data

      console.log('Funding history: ')
      console.log(data)

      return resolve({ error: '', errorData: undefined, data })
    },
    (error) => {
      console.log(error)
      return resolve({
        error: 'GET_FUNDING_HISTORY_FAILED',
        errorData: error,
        data: undefined
      })
    }
  )
})

export const getFiatOrderHistory = async (): ReturnPromise => new Promise(async (resolve)=>{
  const startTimestamp = new Date('2021-04-01 00:00')
  const now = new Date()
  const promises = []
  const loopCount = Math.ceil(now.getDate()-startTimestamp.getDate()/90)

  for(let i = 0; i<loopCount;i++) {
    const startTime = new Date(startTimestamp)
    startTime.setDate(startTime.getDate() + (i === 0 ? 0 : i * 90 + 1))
    const endTime = new Date(startTime)
    endTime.setDate(endTime.getDate() + 90)

    promises.push(binanceQuery(
      {
        method: 'get',
        url: EPs.fiatOrderHistory,
        params: {
          // TODO - call for both types
          transactionType: '0', // 0-deposit,1-withdraw,
          beginTime: startTime.getTime(),
          endTime: endTime.getTime()
        }
      },
      true))
  }

  await Promise.all(promises).then(async responses=>{
    console.log('Fiat Order history: ')

    responses.forEach(response=>{
      const data = response.data as FiatOrderHistory

      if(Array.isArray(data?.data)){
        data.data.forEach(item=>{
          if(item.status === 'Successful'){
            console.log(item.amount, item.fiatCurrency, new Date(item.createTime).toLocaleString(), item.method)
          }
        })
      }
    })

    return resolve({ error: '', errorData: undefined, data: '' })
  }, error=>{
    console.log('GET_FIAT_ORDER_HISTORY_FAILED')
    console.log(error)
    return resolve({
      error: 'GET_FIAT_ORDER_HISTORY_FAILED',
      errorData: error,
      data: undefined
    })
  })
})

export const getFiatPaymentHistory = async (): ReturnPromise<number|undefined> => new Promise(async (resolve)=>{
  const range = 30
  const startTimestamp = new Date('2021-01-01 00:00')
  const now = new Date()
  const promises = []
  const loopCount = Math.ceil(now.getDate()-startTimestamp.getDate()/range)

  for(let i = 0; i<loopCount;i++) {
    const startTime = new Date(startTimestamp)
    startTime.setDate(startTime.getDate() + (i === 0 ? 0 : i * range + 1))
    const endTime = new Date(startTime)
    endTime.setDate(endTime.getDate() + range)

    promises.push(binanceQuery(
      {
        method: 'get',
        url: EPs.fiatPaymentHistory,
        params: {
          // TODO - call for both types
          transactionType: '0', // 0-buy,1-sell
          beginTime: startTime.getTime(),
          endTime: endTime.getTime(),
          rows: 500,
          recvWindow: 60000,
        }
      },
      true))
  }

  await Promise.all(promises).then(async responses=>{
    console.log('Fiat Payment history: ')

    let amount = 0

    responses.forEach(response=>{
      const data = response.data as FiatPaymentHistory
      if(data?.data){

        data.data.sort((a,b)=>a.createTime-b.createTime).forEach(payment=>{
          if(payment.status === 'Completed') {
            console.log(new Date(payment.createTime).toLocaleString(),  payment.sourceAmount, payment.totalFee, payment.fiatCurrency, payment.obtainAmount, payment.cryptoCurrency, payment.price, parseFloat(payment.sourceAmount) / parseFloat(payment.price), payment.cryptoCurrency)
          }
          if(payment.status === 'Completed' && isDollarAsset(payment.cryptoCurrency)){
            amount += parseFloat(payment.sourceAmount) / parseFloat(payment.price)
          }
        })
      }
    })

    console.log('Sum: ', amount, '$')

    return resolve({ error: '', errorData: undefined, data: amount })
  }, error=>{
    console.log('GET_FIAT_PAYMENT_HISTORY_FAILED')
    console.log(error)
    return resolve({
      error: 'GET_FIAT_PAYMENT_HISTORY_FAILED',
      errorData: error,
      data: undefined
    })
  })
})

export const getUniversalTransferHistory = async (): ReturnPromise => new Promise(async (resolve)=>{
  const startTimestamp = new Date('2021-04-01 00:00')
  const now = new Date()
  const promises = []
  const loopCount = Math.ceil(now.getDate()-startTimestamp.getDate()/90)

  for(let i = 0; i<loopCount;i++){
    const startTime = new Date(startTimestamp)
    startTime.setDate(startTime.getDate()+(i===0?0:i*90+1))
    const endTime = new Date(startTime)
    endTime.setDate(endTime.getDate()+90)

    promises.push(binanceQuery(
      {
        method: 'get',
        url: EPs.universalTransferHistory,
        params: {
          startTime: startTime.getTime(),
          endTime: endTime.getTime(),
          size: 100,
          type: 'FUNDING_MAIN' //MAIN_FUNDING,FUNDING_MAIN,FUNDING_UMFUTURE,UMFUTURE_FUNDING,MARGIN_FUNDING,FUNDING_MARGIN,FUNDING_CMFUTURE, CMFUTURE_FUNDING
        }
      },
      true
    ))
  }

  await Promise.all(promises).then(async responses=>{
    console.log('Universal transfer history: ')

    responses.forEach(response=>{
      const data = response.data as UniversalTransferHistory

      if(Array.isArray(data.rows)){
        data.rows.forEach(item=>{
          console.log(item.amount, item.asset, new Date(item.timestamp).toLocaleString(), item.status)
        })
      }
    })

    return resolve({ error: '', errorData: undefined, data: '' })
  }, error=>{
    console.log('GET_UNIVERSAL_TRANSFER_HISTORY_FAILED')
    console.log(error)
    return resolve({
      error: 'GET_UNIVERSAL_TRANSFER_HISTORY_FAILED',
      errorData: error,
      data: undefined
    })
  })
})
