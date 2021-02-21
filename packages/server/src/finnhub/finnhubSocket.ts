import { w3cwebsocket as WebSocket } from 'websocket'
import { finnhubWsUrl, token } from '../constants'
import { pubSub } from '../pubSub'
import {setLastPrice} from '../cache'

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

        // const map: Record<string, LastPriceReadable> = {}

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

            // map[tradeData.s] = formatedData
            pubSub.publish(`LAST_PRICE_${formatedData.symbol}`, formatedData)
            setLastPrice(formatedData.symbol, formatedData.price, formatedData.timestamp)
          }
        })

        // Object.keys(map).forEach((symbol) => {
        //   pubSub.publish(`LAST_PRICE_${symbol}`, map[symbol])
        // })
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

const subscriptionList = new Map<string, Set<string>>()

export const lastPriceSubscribe = (symbol: string, userId:string) => {
  if (!subscriptionList.has(symbol)) {
    subscriptionList.set(symbol, new Set())
  }

  if(userId) {
    subscriptionList.get(symbol)?.add(userId)
  }

  sendBuffer.push(JSON.stringify({type: 'subscribe', symbol}))
}

// TODO unsubscribe user if connection loses (keep in mind the user can connect from multiple places)
export const lastPriceUnsubscribe = (symbol: string, userId:string) => {
  if (subscriptionList.has(symbol)) {
    if(userId && subscriptionList.get(symbol)?.has(userId)){
      subscriptionList.get(symbol)?.delete(userId)
    }

    if(subscriptionList.get(symbol)?.size === 0) {
      subscriptionList.delete(symbol)
      sendBuffer.push(JSON.stringify({type: 'unsubscribe', symbol}))
    }
  }
}
