import { finnhubWsUrl, token } from '../constants'
import { pubSub } from '../pubSub'
import { setLastPrice } from '../cache'
import { LastPriceData, Trade } from '../types/finnhub'
import { Websocket } from '../utils/websocket'

const priceTimestamp: Record<string, number> = {}
let refreshWebsocketRef: ReturnType<typeof setTimeout>

const processLastPrice = (tradeDataArray: Array<LastPriceData>) => {
  tradeDataArray.forEach((tradeData) => {
    if (
      (!tradeData.c || tradeData.c?.length === 0) &&
      (!priceTimestamp[tradeData.s] || priceTimestamp[tradeData.s] + 2000 < tradeData.t)
    ) {
      priceTimestamp[tradeData.s] = tradeData.t
      const formatedData = {
        price: tradeData.p,
        symbol: tradeData.s,
        timestamp: tradeData.t,
        volume: tradeData.v
      }

      pubSub.publish(`LAST_PRICE_${formatedData.symbol}`, formatedData)
      setLastPrice(formatedData.symbol, formatedData.price, formatedData.timestamp)
    }
  })
}

const websocket = new Websocket({
  name: 'Finnhub',
  wsUrl: `${finnhubWsUrl}?token=${token}`,
  lazyConnect: true
})

websocket.onConnect = () => {
  clearInterval(refreshWebsocketRef)

  Array.from(subscriptionList.keys()).forEach((symbol) => {
    websocket.send(JSON.stringify({ type: 'subscribe', symbol }))
  })

  refreshWebsocketRef = setInterval(() => {
    if (websocket.lastPingPongTimestamp < Date.now() - 15 * 60 * 1000) {
      websocket.reconnect()
    }
  }, 5 * 60 * 1000)
}

websocket.onDisconnect = () => {
  clearInterval(refreshWebsocketRef)

  websocket.reconnect()

  Array.from(subscriptionList.keys()).forEach((symbol) => {
    websocket.send(JSON.stringify({ type: 'subscribe', symbol }))
  })
}

websocket.onMessage = (data) => {
  const trade: Trade = data

  switch (trade.type) {
    case 'trade': {
      const tradeDataArray: Array<LastPriceData> = trade.data
      processLastPrice(tradeDataArray)
      break
    }
    default:
      break
  }
}

const subscriptionList = new Map<string, Set<string>>()

export const lastPriceSubscribe = (symbol: string, userId: string) => {
  if (!subscriptionList.has(symbol)) {
    subscriptionList.set(symbol, new Set())
  }

  if (userId) {
    subscriptionList.get(symbol)?.add(userId)
  }

  websocket.send(JSON.stringify({ type: 'subscribe', symbol }))
}

// TODO unsubscribe user if connection loses (keep in mind the user can connect from multiple places)
export const lastPriceUnsubscribe = (symbol: string, userId: string) => {
  if (subscriptionList.has(symbol)) {
    if (userId && subscriptionList.get(symbol)?.has(userId)) {
      subscriptionList.get(symbol)?.delete(userId)
    }

    if (subscriptionList.get(symbol)?.size === 0) {
      subscriptionList.delete(symbol)
      websocket.send(JSON.stringify({ type: 'unsubscribe', symbol }))
    }
  }
}
