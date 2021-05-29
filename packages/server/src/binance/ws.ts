import { w3cwebsocket as WebSocket, client as Websocket2 } from 'websocket'
import { pubSub } from '../pubSub'

type LastPrice = {
  symbol: string
  ask: number
  bid: number
  middle: number
  diff: number
  diffPercentage: number
  timestamp: number
}

const baseUrl = 'wss://stream.binance.com:9443'

const eTypes = {
  aggTrade: 'aggTrade',
  trade: 'trade',
  bookTicker: 'bookTicker',
  kline_1m: 'kline_1m',
  RESULT: 'RESULT'
}

const sendBuffer: Array<any> = []
const subscriptions = new Set()
const results: Record<string, Function> = {}
let requestCounter = 0
const lastPrices: Record<string, LastPrice> = {}

const socket2 = new Websocket2()

socket2.on('connectFailed', (error) => {
  console.error('Binance websocket connect failed', error)
})

socket2.on('connect', (connection) => {
  console.log('Binance websocket connected')

  connection.on('error', (error) => {
    console.error('Binance websocket connection failed')

    setTimeout(() => {
      connectWebsocket()
    }, 1000)
  })

  connection.on('close', () => {
    console.error('Binance websocket connection closed')
  })

  connection.on('message', (event) => {
    // console.log('websocket message type: ', event.type)
    if (event.type === 'utf8') {
      const rawData = event.utf8Data

      // console.log('raw data: ', rawData, typeof rawData)

      //
      if (typeof rawData === 'string') {
        const data = JSON.parse(rawData)

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

            const lastPrice = lastPrices[formattedData.symbol]
            if (!lastPrice || lastPrice.timestamp < formattedData.timestamp - 5000) {
              lastPrices[formattedData.symbol] = formattedData
              pubSub.publish(`BINANCE_LAST_PRICE_${data.s.toUpperCase()}`, formattedData)
            }
            break
          default:
        }

        //         const trade: Trade = JSON.parse(rawData)
        //
        //         switch (trade.type) {
        //             case 'trade': {
        //                 const tradeDataArray: Array<LastPriceData> = trade.data
        //                 processLastPrice(tradeDataArray)
        //                 break
        //             }
        //             default:
        //                 break
        //         }
      }
    }
  })

  setInterval(() => {
    if (connection.connected) {
      // while (sendBuffer.length) {
      if (sendBuffer.length) {
        connection.sendUTF(sendBuffer.pop())
      }
    } else {
      // console.log('socket is closed')
    }
  }, 300)
})

// sendBuffer.push(JSON.stringify({
//   method: 'SUBSCRIBE',
//   params: ['juvbusd@aggTrade', 'juvbusd@trade', 'juvbusd@bookTicker', 'juvbusd@kline_1m'],
//   id: 1
// }))

export const connectWebsocket = () => {
  socket2.connect(`${baseUrl}/ws/myStream`)
}

// connectWebsocket()

export const lastPriceSubscribe = (symbol: string) => {
  const subscription = `${symbol.toLowerCase()}@${eTypes.bookTicker}`

  if (!subscriptions.has(subscription)) {
    subscriptions.add(subscription)

    requestCounter += 1
    console.log('subscribe ', symbol, requestCounter)
    const id = requestCounter

    sendBuffer.push(
      JSON.stringify({
        method: 'SUBSCRIBE',
        params: [subscription],
        id
      })
    )

    results[id] = (result: string | null) => {
      if (result === null || result === 'null') {
        console.log(id, ' finished with code ', result)
      } else {
        subscriptions.delete(subscription)
        console.error('Binance subscribe ', symbol, 'failed!')
      }
    }
  }
}
