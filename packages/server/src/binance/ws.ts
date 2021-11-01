import { pubSub } from '../pubSub'
import { binanceWsUrl } from '../constants'
import { Websocket } from '../utils/websocket'
import { getExchangeInfo } from "./queries";
import { binanceSymbolGraphql, BinanceSymbolTsModel } from "../database/binanceSymbol/schema";
import { toUpper } from "lodash";

type LastPrice = {
  symbol: string
  ask: number
  bid: number
  middle: number
  diff: number
  diffPercentage: number
  timestamp: number
}

const eTypes = {
  aggTrade: 'aggTrade',
  trade: 'trade',
  bookTicker: 'bookTicker',
  kline_1m: 'kline_1m',
  RESULT: 'RESULT'
}
const subscribeBuffer: Array<{
  symbol: string
  id: number
  method: string
  params: Array<string>
}> = []
let subscriptionsBackup: Array<string> = []
const subscriptions = new Set()
const results: Record<string, Function> = {}
const lastPrices: Record<string, LastPrice> = {}
let refreshWebsocketRef: ReturnType<typeof setTimeout>

const websocket = new Websocket({
  name: 'Binance',
  wsUrl: `${binanceWsUrl}/ws/myStream`,
  lazyConnect: true
})

websocket.onConnect = () => {
  clearInterval(refreshWebsocketRef)

  console.log('Binance WS - onConnect - refresh subscriptionKeys')
  subscriptionsBackup.forEach((item) => lastPriceSubscribe(item, false))

  refreshWebsocketRef = setInterval(() => {
    if (
      websocket.lastPingPongTimestamp < Date.now() - 15 * 60 * 1000 ||
      websocket.connectedTimestamp < Date.now() - 24 * 60 * 60 * 1000
    ) {
      websocket.reconnect()
    }
  }, 5 * 60 * 1000)
}

websocket.onDisconnect = () => {
  subscriptionsBackup = Array.from(subscriptions.keys()) as Array<string>
  subscriptions.clear()
  clearInterval(refreshWebsocketRef)
}

websocket.onMessage = (data) => {
  if (typeof data === 'object' && !data.e && data.b && data.B) {
    // book ticker
    data.e = eTypes.bookTicker
  } else if (typeof data === 'object' && 'result' in data && data.id) {
    data.e = eTypes.RESULT
  }

  // console.log('data: ', data)

  switch (data.e) {
    case eTypes.RESULT:
      if (results[data.id]) {
        results[data.id](data.result)
      }
      break

    case eTypes.bookTicker:
      const ask = parseFloat(data.a)
      const bid = parseFloat(data.b)
      const diff = ask - bid
      const diffPercentage = (100 / bid) * ask - 100
      const middle = (ask + bid) / 2

      const formattedData = {
        symbol: data.s,
        ask,
        bid,
        middle,
        diff,
        diffPercentage,
        timestamp: Date.now()
      }

      // console.log(data.s, ask, bid)

      const lastPrice = lastPrices[formattedData.symbol]
      if (!lastPrice || lastPrice.timestamp < formattedData.timestamp - 5000) {
        lastPrices[formattedData.symbol] = formattedData
        pubSub.publish(`BINANCE_LAST_PRICE_${data.s.toUpperCase()}`, formattedData)
      }
      break
    default:
  }
}

const validSymbolsCache = new Set<string>()

export const lastPriceSubscribe = async (symbol: string, force?: boolean) => {
  let isValidSymbol = true

  let subscription = symbol.toLowerCase()
  if (symbol.indexOf('@') < 0) {
    subscription = `${symbol.toLowerCase()}@${eTypes.bookTicker}`

    if(!validSymbolsCache.has(symbol.toUpperCase())) {
      isValidSymbol = await BinanceSymbolTsModel.exists({ symbol: symbol.toUpperCase() })

      if(isValidSymbol) {
        validSymbolsCache.add(symbol.toUpperCase())
      }
    }
  }

  if (isValidSymbol && (force || !subscriptions.has(subscription))) {
    subscriptions.add(subscription)

    const id = websocket.requestCounter

    results[id] = (result: string | null) => {
      if (result === null || result === 'null') {
        console.log(`${symbol} subscribed successfully`)
      } else {
        subscriptions.delete(subscription)
        console.error('Binance subscribe ', symbol, 'failed!')
      }
    }

    subscribeBuffer.push({
      symbol,
      method: 'SUBSCRIBE',
      params: [subscription],
      id
    })

    // subscribeBuffer.push(()=>{
    //   console.log('subscribe ', symbol, id, subscription)
    //
    //   websocket.send(
    //     JSON.stringify({
    //       method: 'SUBSCRIBE',
    //       params: [subscription],
    //       id
    //     })
    //   )
    // })
  }
}

setInterval(()=>{
  if(subscribeBuffer.length){
    const data = subscribeBuffer.shift()
    if(data){
      console.log('subscribe ', data.symbol, data.id, data.params)

        websocket.send(
          JSON.stringify({
            method: data.method,
            id: data.id,
            params: data.params
          })
        )
    }
  }
}, 2000)

export const getCachedLastPrice = (symbol: string): LastPrice | undefined => lastPrices[symbol]
