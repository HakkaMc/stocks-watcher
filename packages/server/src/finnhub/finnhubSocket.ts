import { w3cwebsocket as WebSocket } from 'websocket'
import { finnhubWsUrl, token } from '../constants'
import { pubSub } from '../pubSub'

type LastPriceData = {
  /**
   * Symbol.
   */
  s: string

  /**
   * Last price.
   */
  p: number

  /**
   * UNIX milliseconds timestamp
   */
  t: number

  /**
   * Volume.
   */
  v: number

  /**
   * List of trade conditions. A comprehensive list of trade conditions code can be found here
   */
  c: any
}

type LastPriceReadable = {
  timestamp: number
  price: number
  volume: number
  symbol: string
}

type Trade = {
  /**
   * Message type.
   */
  type: string

  /**
   * List of trades or price updates.
   */
  data: Array<LastPriceData>
}

let socketIsOpened = false
const priceTimestamp: Record<string, number> = {}
const sendBuffer: Array<any> = []
export const socket = new WebSocket(`${finnhubWsUrl}?token=${token}`)

socket.onopen = () => {
  console.log('Finnhub socket opened')
  socketIsOpened = true

  setInterval(() => {
    if (socketIsOpened) {
      while (sendBuffer.length) {
        // console.log('send buffer')
        socket.send(sendBuffer.pop())
      }
    } else {
      // console.log('socket is closed')
    }
  }, 1000)
}

socket.onmessage = (event) => {
  if (typeof event.data === 'string') {
    const trade: Trade = JSON.parse(event.data)

    switch (trade.type) {
      case 'trade': {
        const tradeDataArray: Array<LastPriceData> = trade.data

        const map: Record<string, LastPriceReadable> = {}

        tradeDataArray.forEach((tradeData) => {
          if (
            (!tradeData.c || tradeData.c?.length === 0) &&
            (!priceTimestamp[tradeData.s] || priceTimestamp[tradeData.s] + 2000 < tradeData.t)
          ) {
            priceTimestamp[tradeData.s] = tradeData.t
            map[tradeData.s] = {
              price: tradeData.p,
              symbol: tradeData.s,
              timestamp: tradeData.t,
              volume: tradeData.v
            }
          }
        })

        Object.keys(map).forEach((symbol) => {
          pubSub.publish(`LAST_PRICE_${symbol}`, map[symbol])
        })
        break
      }
      default:
        break
    }
  }
}

socket.onclose = () => {
  console.log('Finnhub socked closed')
  socketIsOpened = false
}

// const socketSend = (data:any) =>{
//     // if(socketIsOpened){
//     //     socket.send(data)
//     // }
//     // else {
//         sendBuffer.push(data)
//     // }
// }

socket.onerror = (error) => {
  console.error('Websocket error: ', error)
}

const subscriptionList = new Set()

export const lastPriceSubscribe = (symbol: string) => {
  if (!subscriptionList.has(symbol)) {
    subscriptionList.add(symbol)
    sendBuffer.push(JSON.stringify({ type: 'subscribe', symbol }))
  }
}

export const lastPriceUnsubscribe = (symbol: string) => {
  if (subscriptionList.has(symbol)) {
    sendBuffer.push(JSON.stringify({ type: 'unsubscribe', symbol }))
    subscriptionList.delete(symbol)
  }
}
