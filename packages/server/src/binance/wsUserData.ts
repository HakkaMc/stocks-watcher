import { w3cwebsocket as WebSocket, client as Websocket2 } from 'websocket'
import { getUserDataStreamKey } from './queries'
import { pubSub } from '../pubSub'

const baseUrl = 'wss://stream.binance.com:9443'

const eTypes = {
  outboundAccountPosition: 'outboundAccountPosition',
  balanceUpdate: 'balanceUpdate',
  executionReport: 'executionReport',
  listStatus: 'listStatus'
}

const socket2 = new Websocket2()

socket2.on('connectFailed', (error) => {
  console.error('Binance websocket user-data connect failed', error)
})

socket2.on('connect', (connection) => {
  console.log('Binance websocket user-data connected')

  connection.on('error', (error) => {
    console.error('Binance websocket user-data connection failed')

    setTimeout(() => {
      connectUserDataWebsocket()
    }, 1000)
  })

  connection.on('close', () => {
    console.error('Binance websocket user-data connection closed')
  })

  connection.on('message', (event) => {
    // console.log('websocket message type: ', event.type)
    if (event.type === 'utf8') {
      const rawData = event.utf8Data

      console.log('raw data: ', rawData, typeof rawData)

      if (typeof rawData === 'string') {
        const data = JSON.parse(rawData)

        switch (data.e) {
          case eTypes.balanceUpdate:
            pubSub.publish(`BINANCE_BALANCE_UPDATE`, {
              asset: data.a,
              delta: data.d,
              eventTime: data.E,
              clearTime: data.T
            })
            break
          // Orders update
          case eTypes.executionReport:
            pubSub.publish(`BINANCE_ORDER_UPDATE`, {
              symbol: data.s,
              side: data.S,
              orderId: data.i,
              eventTime: data.E,
              transactionTime: data.T
            })
            break
          case eTypes.listStatus:
            pubSub.publish(`BINANCE_OCO_ORDER_UPDATE`, {
              symbol: data.s,
              eventTime: data.E,
              transactionTime: data.T
            })
            break
          default:
        }
      }
    }
  })
})

export const connectUserDataWebsocket = async () => {
  const listenKey = await getUserDataStreamKey()

  if (listenKey) {
    socket2.connect(`${baseUrl}/ws/${listenKey}`)
  } else {
    console.error('getUserDataStreamKey returns empty listen-key!')
  }
}
