import { BinanceLastPrice } from '@sw/shared/src/graphql'
import { PriceType, QuantityType } from '@sw/shared/src/binanceTypes'

import { sendEmail } from '../utils/emailSender'
import { ReturnPromise } from '../types'
import { OrderTsModel, OrderTsType } from '../database/order/schema'
import { OrderType } from '../types/mix'
import { pubSub } from '../pubSub'
import { placeBuyOrder, placeSellOrder } from '../binance/orders'
import { lastPriceSubscribe } from '../binance/ws'
import { getSymbolAveragePrice } from '../binance/queries'
import { processBinanceConsolidation } from './binanceConsolidation'
import { register } from './register'
import { UserTsModel } from '../database/user/schema'

const processFixedTrailingStopOrder = async (order: OrderTsType) => {
  if (!register.exists(order._id.toString())) {
    const orderId = order._id.toString()

    const user = await UserTsModel.findOne({ _id: order.user }, { _id: true, email: true })
    const userEmail = user?.email || ''

    const { activatedTimestamp } = order

    // console.log('activatedTimestamp: ', activatedTimestamp)

    if (activatedTimestamp > 0) {
      const lastAveragePriceResult = await getSymbolAveragePrice(order.symbol)

      // console.log(lastAveragePriceResult.data, order.fixedTrailingStop.sellOnPrice, order.fixedTrailingStop.sellOnPrice * 1.05)

      if (lastAveragePriceResult.error) {
        // TODO - send notif error
        return console.log(
          order.symbol,
          ' Process order - get last price failed: ',
          lastAveragePriceResult.error,
          lastAveragePriceResult.errorData
        )
      }
      if (!(lastAveragePriceResult.data > order.sellOnPrice * 1.05)) {
        // TODO - send notif error
        await OrderTsModel.findByIdAndUpdate(order._id, { active: false })
        return console.log(order.symbol, ' Process order - Too late to process order. Order deactivated.')
      }
    }

    lastPriceSubscribe(order.symbol)

    const meta = register.add(orderId, {
      order,
      subscribeNumber: -1,
      activated: activatedTimestamp > 0,
      locked: false,
      destroy: false,
      specificData: {
        high: Number.MIN_SAFE_INTEGER
      }
    })

    const subscribeNumber = await pubSub.subscribe(
      `BINANCE_LAST_PRICE_${order.symbol}`,
      async (lastPrice: BinanceLastPrice) => {
        // console.log(
        //   `${order.symbol}, a/m/b: ${lastPrice.ask}/${lastPrice.middle}/${lastPrice.bid}, actOnP: ${order.fixedTrailingStop.activateOnPrice}, sellOnP: ${order.fixedTrailingStop.sellOnPrice}, activated: ${meta.activated}, locked: ${meta.locked}`
        // )

        if (meta.destroy) {
          meta.remove()
        } else if (meta.activated) {
          // console.log(order.symbol, meta.locked, lastPrice.bid, order.fixedTrailingStop.sellOnPrice)

          meta.specificData.high = Math.max(meta.specificData.high, lastPrice.bid)

          if (!meta.locked && lastPrice.bid <= order.sellOnPrice && meta.specificData.high >= order.sellOnPrice) {
            meta.locked = true

            const lastAveragePriceResult = await getSymbolAveragePrice(order.symbol)

            // console.log(lastAveragePriceResult.data, order.fixedTrailingStop.sellOnPrice, order.fixedTrailingStop.sellOnPrice * 1.05)

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
            const diff = Math.abs(lastAveragePriceResult.data - lastPrice.bid)
            const diffPercent = (100 / lastAveragePriceResult.data) * (lastAveragePriceResult.data + diff) - 100

            if (diffPercent > 1) {
              meta.specificData.high = lastAveragePriceResult.data
              meta.locked = false
              return console.log(
                order.symbol,
                ' processFixedTrailingStopOrder - hype detected: ',
                lastPrice.bid,
                lastAveragePriceResult.data,
                `${diffPercent}%`
              )
            }

            const refreshedOrder = await OrderTsModel.findById(order._id)

            if (refreshedOrder?.active) {
              if (lastAveragePriceResult.data <= order.sellOnPrice) {
                console.log(order.symbol, 'FIXED TRAILING STOP: Placing sell order...')

                const result = await placeSellOrder({
                  symbol: order.symbol,
                  quoteOrderQty: order.quoteOrderQty,
                  quantityType: order.quantityType as QuantityType,
                  quantity: order.quantity,
                  priceType: order.priceType as PriceType,
                  price: order.sellOnPrice
                })

                if (result.error) {
                  console.log(order.symbol, 'Automatic place order failed: ', result.error)
                  console.log(result.errorData)
                  // TODO - send high priority notification
                  meta.locked = false
                } else {
                  pubSub.unsubscribe(subscribeNumber)
                  console.log(order.symbol, 'Automatic order placed')

                  sendEmail(userEmail, `${order.symbol} Trailing stop placed`)

                  // TODO - send notification order placed
                  OrderTsModel.findByIdAndUpdate(order._id, { active: false }, {}, (error) => {
                    if (error) {
                      console.log(error)
                    } else {
                      meta.remove()
                    }
                  })
                }
              } else {
                meta.locked = false
              }
            } else {
              meta.remove()
            }
          }
        } else if (lastPrice.bid > order.activateOnPrice) {
          meta.activated = true
          OrderTsModel.findByIdAndUpdate(order._id, { fixedTrailingStop: { activatedTimestamp: Date.now() } } as any)
        }
      }
    )

    meta.subscribeNumber = subscribeNumber

    console.log('Started fixed trailing stop listening for ', order.symbol)
  }
}

const processMovingTrailingStopOrder = async (order: OrderTsType) => {
  if (!register.exists(order._id.toString())) {
    const orderId = order._id.toString()

    const user = await UserTsModel.findOne({ _id: order.user }, { _id: true, email: true })
    const userEmail = user?.email || ''

    lastPriceSubscribe(order.symbol)

    const meta = register.add(orderId, {
      order,
      subscribeNumber: -1,
      activated: true,
      locked: false,
      destroy: false,
      specificData: {
        high: Number.MIN_SAFE_INTEGER
      }
    })

    const subscribeNumber = await pubSub.subscribe(
      `BINANCE_LAST_PRICE_${order.symbol}`,
      async (lastPrice: BinanceLastPrice) => {
        // console.log(
        //   `${order.symbol}, a/m/b: ${lastPrice.ask}/${lastPrice.middle}/${lastPrice.bid}, actOnP: ${order.fixedTrailingStop.activateOnPrice}, sellOnP: ${order.fixedTrailingStop.sellOnPrice}, activated: ${meta.activated}, locked: ${meta.locked}`
        // )

        if (meta.destroy) {
          meta.remove()
        } else if (meta.activated) {
          // console.log(order.symbol, meta.locked, lastPrice.bid, order.fixedTrailingStop.sellOnPrice)

          meta.specificData.high = Math.max(meta.specificData.high, lastPrice.bid)

          const sellLevel = meta.specificData.high * ((100 - order.percent) / 100)

          const lowestLevel = order.activateOnPrice * ((100 - order.percent) / 100)

          // console.log(
          //   order.symbol,
          //   ' high: ',
          //   meta.specificData.high,
          //   ', sell level: ',
          //   sellLevel,
          //   ', last P: ',
          //   lastPrice.ask
          // )

          if (!meta.locked && lastPrice.bid <= sellLevel && meta.specificData.high >= lowestLevel) {
            meta.locked = true

            // Ensure the websocket price is not just a single hype
            const lastAveragePriceResult = await getSymbolAveragePrice(order.symbol)

            // console.log(lastAveragePriceResult.data, order.fixedTrailingStop.sellOnPrice, order.fixedTrailingStop.sellOnPrice * 1.05)

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
            const diff = Math.abs(lastAveragePriceResult.data - lastPrice.bid)
            const diffPercent = (100 / lastAveragePriceResult.data) * (lastAveragePriceResult.data + diff) - 100

            if (diffPercent > 1) {
              meta.specificData.high = lastAveragePriceResult.data
              meta.locked = false
              return console.log(
                order.symbol,
                ' processMovingTrailingStopOrder - hype detected: ',
                lastPrice.bid,
                lastAveragePriceResult.data,
                `${diffPercent}%`
              )
            }

            const refreshedOrder = await OrderTsModel.findById(order._id)

            if (refreshedOrder?.active) {
              if (lastAveragePriceResult.data <= sellLevel && lastAveragePriceResult.data >= lowestLevel) {
                console.log(order.symbol, 'MOVING TRAILING STOP: Placing sell order...')

                const result = await placeSellOrder({
                  symbol: order.symbol,
                  quoteOrderQty: order.quoteOrderQty,
                  quantityType: order.quantityType as QuantityType,
                  quantity: order.quantity,
                  priceType: order.priceType as PriceType,
                  price: order.activateOnPrice
                })

                if (result.error) {
                  console.log(order.symbol, 'Automatic place order failed: ', result.error)
                  console.log(result.errorData)
                  // TODO - send high priority notification
                  meta.locked = false
                } else {
                  pubSub.unsubscribe(subscribeNumber)
                  console.log(order.symbol, 'Automatic order placed')

                  sendEmail(userEmail, `${order.symbol} Moving trailing stop placed`)

                  // TODO - send notification order placed
                  OrderTsModel.findByIdAndUpdate(order._id, { active: false }, {}, (error) => {
                    if (error) {
                      console.log(error)
                    } else {
                      meta.remove()
                    }
                  })
                }
              } else {
                meta.locked = false
              }
            } else {
              meta.remove()
            }
          }
        }
      }
    )

    meta.subscribeNumber = subscribeNumber

    console.log('Started moving trailing stop listening for ', order.symbol)
  }
}

const processMovingBuyOrder = async (order: OrderTsType) => {
  if (!register.exists(order._id.toString())) {
    const orderId = order._id.toString()

    const user = await UserTsModel.findOne({ _id: order.user }, { _id: true, email: true })
    const userEmail = user?.email || ''

    lastPriceSubscribe(order.symbol)

    const meta = register.add(orderId, {
      order,
      subscribeNumber: -1,
      activated: true,
      locked: false,
      destroy: false,
      specificData: {
        low: Number.MAX_SAFE_INTEGER
      }
    })

    const subscribeNumber = await pubSub.subscribe(
      `BINANCE_LAST_PRICE_${order.symbol}`,
      async (lastPrice: BinanceLastPrice) => {
        // console.log(
        //   `${order.symbol}, a/m/b: ${lastPrice.ask}/${lastPrice.middle}/${lastPrice.bid}, actOnP: ${order.fixedTrailingStop.activateOnPrice}, sellOnP: ${order.fixedTrailingStop.sellOnPrice}, activated: ${meta.activated}, locked: ${meta.locked}`
        // )

        if (meta.destroy) {
          meta.remove()
        } else if (meta.activated) {
          // console.log(order.symbol, meta.locked, lastPrice.bid, order.fixedTrailingStop.sellOnPrice)

          meta.specificData.low = Math.min(meta.specificData.low, lastPrice.ask)

          const buyLevel = meta.specificData.low * ((order.percent + 100) / 100)

          console.log(
            order.symbol,
            ' low: ',
            meta.specificData.low,
            ', buy level: ',
            buyLevel,
            ', last P: ',
            lastPrice.ask
          )

          if (!meta.locked && lastPrice.ask >= buyLevel && buyLevel < order.activateOnPrice) {
            meta.locked = true

            const lastAveragePriceResult = await getSymbolAveragePrice(order.symbol)
            // console.log(lastAveragePriceResult.data, order.fixedTrailingStop.sellOnPrice, order.fixedTrailingStop.sellOnPrice * 1.05)

            if (lastAveragePriceResult.error) {
              meta.locked = false

              // TODO - send notif error
              return console.log(
                order.symbol,
                ' Process order - get last average price failed: ',
                lastAveragePriceResult.error,
                lastAveragePriceResult.errorData
              )
            }

            // Ensure the websocket price is not just a single hype
            const diff = Math.abs(lastAveragePriceResult.data - lastPrice.ask)
            const diffPercent = (100 / lastAveragePriceResult.data) * (lastAveragePriceResult.data + diff) - 100

            if (diffPercent > 1) {
              meta.specificData.low = lastAveragePriceResult.data
              meta.locked = false
              return console.log(
                order.symbol,
                ' processMovingBuyOrder - hype detected: ',
                lastPrice.ask,
                lastAveragePriceResult.data,
                `${diffPercent}%`
              )
            }

            const refreshedOrder = await OrderTsModel.findById(order._id)

            if (refreshedOrder?.active) {
              if (lastAveragePriceResult.data <= order.activateOnPrice) {
                console.log(order.symbol, 'MOVING BUY: Placing buy order...')

                const result = await placeBuyOrder({
                  symbol: order.symbol,
                  quoteOrderQty: order.quoteOrderQty,
                  quantityType: order.quantityType as QuantityType,
                  quantity: order.quantity,
                  priceType: order.priceType as PriceType,
                  price: order.activateOnPrice
                })

                if (result.error) {
                  console.log(order.symbol, 'Automatic place order failed: ', result.error)
                  console.log(result.errorData)
                  // TODO - send high priority notification
                  meta.locked = false
                } else {
                  pubSub.unsubscribe(subscribeNumber)
                  console.log(order.symbol, 'Automatic order placed')

                  sendEmail(userEmail, `${order.symbol} Moving buy placed`)

                  // TODO - send notification order placed
                  OrderTsModel.findByIdAndUpdate(order._id, { active: false }, {}, (error) => {
                    if (error) {
                      console.log(error)
                    } else {
                      meta.remove()
                    }
                  })
                }
              } else {
                meta.locked = false
              }
            } else {
              meta.remove()
            }
          }
        }
      }
    )

    meta.subscribeNumber = subscribeNumber

    console.log('Started moving buy listening for ', order.symbol)
  }
}

const processOrder = async (order: OrderTsType) => {
  switch (order.type) {
    case OrderType.FIXED_TRAILING_STOP:
      processFixedTrailingStopOrder(order)
      break

    case OrderType.MOVING_TRAILING_STOP:
      processMovingTrailingStopOrder(order)
      break

    case OrderType.MOVING_BUY:
      processMovingBuyOrder(order)
      break

    case OrderType.CONSOLIDATION:
      processBinanceConsolidation(order)
      break

    default:
  }
}

export const computeOrders = async () => {
  const orders = await OrderTsModel.find({ active: true })

  if (Array.isArray(orders)) {
    orders.forEach((order) => {
      processOrder(order)
    })
  }
}

export const computeOrder = async (orderId: string) => {
  const order = await OrderTsModel.findById(orderId)

  if (order) {
    processOrder(order)
  } else {
    console.log('Compute order - order not found!')
  }
}

export const closeOrder = async (orderId: string, userId: string): ReturnPromise =>
  new Promise((resolve) => {
    OrderTsModel.updateOne({ _id: orderId, user: userId }, { active: false }, {}, (error) => {
      if (error) {
        console.log(`Deactivate order ${orderId} failed:`, error)
        return resolve({
          error: 'CLOSE_ORDER_FAILED',
          errorData: error,
          data: undefined
        })
      }

      register.destroy(orderId)

      return resolve({
        error: '',
        errorData: undefined,
        data: 'OK'
      })
    })
  })
