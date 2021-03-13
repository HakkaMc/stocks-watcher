import { w3cwebsocket as WebSocket, client as Websocket2 } from 'websocket'
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

const priceTimestamp: Record<string, number> = {}

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

      // map[tradeData.s] = formatedData
      pubSub.publish(`LAST_PRICE_${formatedData.symbol}`, formatedData)
      setLastPrice(formatedData.symbol, formatedData.price, formatedData.timestamp)
    }
  })
}

let socketIsOpened = false

const sendBuffer: Array<any> = []
// export const socket = new WebSocket(`${finnhubWsUrl}?token=${token}`)
//
// socket.onopen = () => {
//   console.log('Finnhub socket opened')
//   socketIsOpened = true
//
//   setInterval(() => {
//     if (socketIsOpened) {
//       while (sendBuffer.length) {
//         // console.log('send buffer')
//         socket.send(sendBuffer.pop())
//       }
//     } else {
//       // console.log('socket is closed')
//     }
//   }, 1000)
// }
//
// socket.onmessage = (event) => {
//   if (typeof event.data === 'string') {
//     const trade: Trade = JSON.parse(event.data)
//
//     switch (trade.type) {
//       case 'trade': {
//         const tradeDataArray: Array<LastPriceData> = trade.data
//         processLastPrice(tradeDataArray)
//         break
//       }
//       default:
//         break
//     }
//   }
// }

// socket.onclose = () => {
//   console.log('Finnhub socked closed')
//   socketIsOpened = false
// }
//
// socket.onerror = (error) => {
//   console.error('Websocket error: ', error)
// }

const socket2 = new Websocket2()

socket2.on('connectFailed', (error)=>{
  console.error('Websocket connect failed', error)
})

socket2.on('connect', (connection)=>{
  console.log('Websocket connected')

  connection.on('error', (error)=>{
    console.error('Websocket connection failed')

    setTimeout(()=>{
      connectWebsocket()
    }, 1000)
  })

  connection.on('close', ()=>{
    console.error('Websocket connection closed')
  })

  connection.on('message', event=>{
    // console.log('websocket message type: ', event.type)
    if (event.type === 'utf8') {
      const rawData = event.utf8Data

      // console.log('raw data: ', rawData)

      if (typeof rawData === 'string') {
        const trade: Trade = JSON.parse(rawData)

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
    }
  })

  setInterval(() => {
    if (connection.connected) {
      while (sendBuffer.length) {
        // console.log('send buffer')
        connection.sendUTF(sendBuffer.pop())
      }
    } else {
      // console.log('socket is closed')
    }
  }, 1000)
})

const connectWebsocket = () => {
  socket2.connect(`${finnhubWsUrl}?token=${token}`)
}

connectWebsocket()

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
