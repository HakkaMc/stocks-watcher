import { getUserDataStreamKey, updateUserDataStreamKey } from './queries'
import { pubSub } from '../pubSub'
import { binanceWsUrl } from '../constants'
import { Websocket } from '../utils/websocket'
import { countBalance } from './index'

const eTypes = {
  outboundAccountPosition: 'outboundAccountPosition',
  balanceUpdate: 'balanceUpdate',
  executionReport: 'executionReport',
  listStatus: 'listStatus'
}

const userMap: Record<string, Websocket> = {}

export const connectBinanceUserDataWebsocket = async (userId: string) => {
  console.log('connectBinanceUserDataWebsocket', userId)
  if (!userMap[userId]) {
    // TODO - get user websocket key and secret from DB

    const listenKey = await getUserDataStreamKey()

    if (listenKey) {
      let refreshWebsocketRef: ReturnType<typeof setTimeout>
      let refreshListenKeyRef: ReturnType<typeof setTimeout>

      const websocket = new Websocket({
        name: 'Binance User',
        wsUrl: `${binanceWsUrl}/ws/${listenKey}`,
        lazyConnect: false
      })

      websocket.onConnect = () => {
        console.log('User Websocket connected')

        clearInterval(refreshWebsocketRef)
        clearInterval(refreshListenKeyRef)

        updateUserDataStreamKey(listenKey)

        refreshListenKeyRef = setInterval(() => {
          updateUserDataStreamKey(listenKey)
        }, 30 * 60 * 1000)

        refreshWebsocketRef = setInterval(() => {
          if (websocket.lastPingPongTimestamp < Date.now() - 15 * 60 * 1000) {
            websocket.reconnect()
          }
        }, 5 * 60 * 1000)
      }

      websocket.onDisconnect = () => {
        clearInterval(refreshWebsocketRef)
        clearInterval(refreshListenKeyRef)

        websocket.destroy()

        connectBinanceUserDataWebsocket(userId)
      }

      websocket.onMessage = async (data) => {
        console.log('Binance user WS: ', data.e)
        switch (data.e) {
          // Account balance has changed
          case eTypes.outboundAccountPosition:
            await countBalance(userId)
            pubSub.publish(`BINANCE_BALANCE_UPDATE`, { timestamp: Date.now() })
            break

          // Deposits or withdrawals from the account
          case eTypes.balanceUpdate:
            await countBalance(userId)
            pubSub.publish(`BINANCE_BALANCE_UPDATE`, { timestamp: Date.now() })
            // pubSub.publish(`BINANCE_BALANCE_UPDATE`, {
            //   asset: data.a,
            //   delta: data.d,
            //   eventTime: data.E,
            //   clearTime: data.T
            // })
            break

          // Orders update
          case eTypes.executionReport:
            // pubSub.publish(`BINANCE_ORDER_UPDATE`, {
            //   symbol: data.s,
            //   side: data.S,
            //   orderId: data.i,
            //   eventTime: data.E,
            //   transactionTime: data.T
            // })
            pubSub.publish(`BINANCE_ORDER_UPDATE`, { timestamp: Date.now() })
            break

          case eTypes.listStatus:
            pubSub.publish(`BINANCE_ORDER_UPDATE`, { timestamp: Date.now() })
            // pubSub.publish(`BINANCE_OCO_ORDER_UPDATE`, {
            //   symbol: data.s,
            //   eventTime: data.E,
            //   transactionTime: data.T
            // })
            break
          default:
        }
      }

      // websocket.onConnect()

      userMap[userId] = websocket
    } else {
      console.error('getUserDataStreamKey returns empty listen-key!')
    }
  }
}

export const closeBinanceUserDataWebsocket = async (userId: string) => {
  if (userMap[userId]) {
    userMap[userId].destroy()
    delete userMap[userId]
  }
}
