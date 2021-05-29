import { BinanceLastPrice } from '@sw/shared/src/graphql'
import { OrderStatus, PriceType, QuantityType } from '@sw/shared/src/binanceTypes'

import { pubSub } from '../pubSub'
import { getOrder, getSymbolAveragePrice } from '../binance/queries'

import { OrderTsModel, OrderTsType } from '../database/order/schema'
import { lastPriceSubscribe } from '../binance/ws'

import { placeBuyOrder, placeSellOrder } from '../binance/orders'
import { sendEmail } from '../utils/emailSender'
import { closeOrder } from './computeOrders'
import { register } from './register'
import { UserTsModel } from '../database/user/schema'
import { ReturnPromise, Return } from '../types'

const waitForBinanceOrderFilled = async (orderId: number, userId: string, symbol: string): Promise<any> =>
  new Promise(async (resolve, reject) => {
    console.log('waitForBinanceOrderFilled ', orderId)

    let locked = false
    const subscribeNumbers: number[] = []
    let timeoutRef: ReturnType<typeof setTimeout>
    let intervalRef: ReturnType<typeof setInterval>

    const unsubscribe = () => {
      subscribeNumbers.forEach((nbr) => pubSub.unsubscribe(nbr))
    }

    const callback = () => {
      clearTimeout(timeoutRef)
      locked = true
      timeoutRef = setTimeout(async () => {
        const order = await getOrder(orderId, userId, symbol)
        if (!order.error) {
          switch (order.data.status) {
            case OrderStatus.FILLED:
              unsubscribe()
              clearInterval(intervalRef)
              return resolve(null)
              break

            case OrderStatus.CANCELED:
            case OrderStatus.PENDING_CANCEL:
            case OrderStatus.REJECTED:
            case OrderStatus.EXPIRED:
              unsubscribe()
              clearInterval(intervalRef)
              reject()
              break

            default:
              locked = false
          }
        } else if (parseInt(order.errorData?.response.data.code) === -2013) {
          // 2013 - order does not exist
          unsubscribe()
          clearInterval(intervalRef)
          reject()
        }
      }, 1000)
    }

    subscribeNumbers.push(await pubSub.subscribe('BINANCE_BALANCE_UPDATE', callback))
    subscribeNumbers.push(await pubSub.subscribe('BINANCE_ORDER_UPDATE', callback))
    subscribeNumbers.push(await pubSub.subscribe('BINANCE_OCO_ORDER_UPDATE', callback))

    intervalRef = setInterval(callback, 1 * 60 * 60 * 1000)

    // Run immediately for case the order was process already but missed websocket notification
    callback()
  })

export const processBinanceConsolidation = async (order: OrderTsType) => {
  if (!register.exists(order._id.toString())) {
    const orderId = order._id.toString()
    const userId = order?.user?.toString() || ''

    const user = await UserTsModel.findOne({ _id: order.user }, { _id: true, email: true })
    const userEmail = user?.email || ''

    lastPriceSubscribe(order.symbol)

    const meta = register.add(order._id.toString(), {
      order,
      subscribeNumber: -1,
      activated: true,
      locked: false,
      destroy: false,
      specificData: {}
    })

    const subscribeNumber = await pubSub.subscribe(
      `BINANCE_LAST_PRICE_${order.symbol}`,
      async (lastPrice: BinanceLastPrice) => {
        if (meta.destroy) {
          meta.remove()
        } else if (
          !meta.locked &&
          !meta.order.meta.locked &&
          ((meta.order.meta.step === 'BUY' && lastPrice.bid < meta.order.activateOnPrice) ||
            (meta.order.meta.step === 'SELL' && lastPrice.ask > meta.order.sellOnPrice))
        ) {
          meta.locked = true

          const lastAveragePriceResult = await getSymbolAveragePrice(order.symbol)

          if (lastAveragePriceResult.error) {
            meta.locked = false

            // TODO - send notif error
            return console.log(
              order.symbol,
              ' Process order - get last price failed: ',
              lastAveragePriceResult.error,
              lastAveragePriceResult.errorData
            )
          }

          // Ensure the websocket price is not just a single hype
          const diff = Math.abs(lastAveragePriceResult.data - lastPrice.middle)
          const diffPercent = (100 / lastAveragePriceResult.data) * (lastAveragePriceResult.data + diff) - 100

          if (diffPercent > 1) {
            meta.specificData.high = lastAveragePriceResult.data
            meta.locked = false
            return console.log(
              order.symbol,
              ' processBinanceConsolidation - hype detected: ',
              lastPrice.middle,
              lastAveragePriceResult.data,
              `${diffPercent}%`
            )
          }

          const refreshedOrder = await OrderTsModel.findById(order._id)
          meta.order = refreshedOrder as any

          let result: Return

          if (
            meta.order?.active &&
            !meta.order.meta.locked &&
            meta.order.meta.step === 'BUY' &&
            lastPrice.bid < meta.order.activateOnPrice
          ) {
            result = await placeBuyOrder({
              symbol: meta.order.symbol,
              quoteOrderQty: meta.order.quoteOrderQty,
              quantityType: meta.order.quantityType as QuantityType,
              quantity: meta.order.quantity,
              priceType: meta.order.priceType as PriceType,
              price: meta.order.activateOnPrice
            })
          } else if (
            meta.order?.active &&
            !meta.order.meta.locked &&
            meta.order.meta.step === 'SELL' &&
            lastPrice.ask > meta.order.sellOnPrice
          ) {
            result = await placeSellOrder({
              symbol: meta.order.symbol,
              quoteOrderQty: meta.order.quoteOrderQty,
              quantityType: meta.order.quantityType as QuantityType,
              quantity: meta.order.quantity,
              priceType: meta.order.priceType as PriceType,
              price: meta.order.sellOnPrice
            })
          } else {
            meta.locked = false
            return
          }

          if (result.error) {
            console.log(meta.order.symbol, 'Binance consolidation - automatic place order failed: ', result.error)
            console.log(result.errorData)
            // TODO - send high priority notification
            meta.locked = false
          } else {
            console.log(meta.order.symbol, `Binance consolidation - automatic ${meta.order.meta.step} order placed`)

            result.data.orderId

            meta.order = (await OrderTsModel.findByIdAndUpdate(meta.order._id, {
              meta: { ...meta.order.meta, orderId: result.data.orderId, locked: true }
            })) as any

            waitForBinanceOrderFilled(result.data.orderId, userId, meta.order.symbol).then(
              async () => {
                meta.order = (await OrderTsModel.findByIdAndUpdate(meta.order._id, {
                  meta: {
                    ...meta.order.meta,
                    orderId: -1,
                    locked: false,
                    step: meta.order.meta.step === 'BUY' ? 'SELL' : 'BUY'
                  }
                })) as any
                meta.locked = false
              },
              () => {
                closeOrder(orderId, userId)
                sendEmail(userEmail, `Order ID ${orderId} (binance order ID ${result.data.orderId}) were canceled`)
              }
            )
          }
        }
        // This part is for case the server is restarted
        else if (!meta.locked && meta.order.meta.locked) {
          meta.locked = true

          waitForBinanceOrderFilled(meta.order.meta.orderId, userId, meta.order.symbol).then(
            async () => {
              meta.order = (await OrderTsModel.findByIdAndUpdate(meta.order._id, {
                meta: {
                  ...meta.order.meta,
                  orderId: -1,
                  locked: false,
                  step: meta.order.meta.step === 'BUY' ? 'SELL' : 'BUY'
                }
              })) as any
              meta.locked = false
            },
            () => {
              closeOrder(orderId, userId)
              sendEmail(userEmail, `Order ID ${orderId} (binance order ID ${meta.order.meta.orderId}) were canceled`)
            }
          )
        }
      }
    )

    meta.subscribeNumber = subscribeNumber

    console.log('Started consolidation listening for ', order.symbol)
  }
}
