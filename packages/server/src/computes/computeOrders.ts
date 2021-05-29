import { BinanceLastPrice } from '@sw/shared/src/graphql'
import { PriceType, QuantityType } from '@sw/shared/src/binanceTypes'

import { sendEmail } from '../emailSender'
import { ReturnPromise } from '../types'
import { OrderTsModel, OrderTsType } from '../database/order/schema'
import { OrderType } from '../types/mix'
import { pubSub } from '../pubSub'
import { placeBuyOrder, placeSellOrder } from '../binance/orders'
import { lastPriceSubscribe } from '../binance/ws'
import { getSymbolLatestPrice } from '../binance/queries'

type MovingBuySpecificData = {
  low: number
}

const inProcess: Record<
  string,
  {
    activated: boolean
    locked: boolean
    order: OrderTsType
    subscribeNumber: number
    destroy: boolean
    specificData: Record<string, any>
  }
> = {}

const processTrailingStopOrder = async (order: OrderTsType) => {
  if (!inProcess[order._id.toString()]) {
    const orderId = order._id.toString()

    const { activatedTimestamp } = order.fixedTrailingStop

    // console.log('activatedTimestamp: ', activatedTimestamp)

    if (activatedTimestamp > 0) {
      const lastPriceResult = await getSymbolLatestPrice(order.symbol)

      // console.log(lastPriceResult.data, order.fixedTrailingStop.sellOnPrice, order.fixedTrailingStop.sellOnPrice * 1.05)

      if (lastPriceResult.error) {
        // TODO - send notif error
        return console.log(
          order.symbol,
          ' Process order - get last price failed: ',
          lastPriceResult.error,
          lastPriceResult.errorData
        )
      }
      if (!(lastPriceResult.data > order.fixedTrailingStop.sellOnPrice * 1.05)) {
        // TODO - send notif error
        await OrderTsModel.findByIdAndUpdate(order._id, { active: false })
        return console.log(order.symbol, ' Process order - Too late to process order. Order deactivated.')
      }
    }

    lastPriceSubscribe(order.symbol)

    inProcess[orderId] = {
      order,
      subscribeNumber: -1,
      activated: activatedTimestamp > 0,
      locked: false,
      destroy: false,
      specificData: {}
    }

    const subscribeNumber = await pubSub.subscribe(
      `BINANCE_LAST_PRICE_${order.symbol}`,
      async (lastPrice: BinanceLastPrice) => {
        // console.log(
        //   `${order.symbol}, a/m/b: ${lastPrice.ask}/${lastPrice.middle}/${lastPrice.bid}, actOnP: ${order.fixedTrailingStop.activateOnPrice}, sellOnP: ${order.fixedTrailingStop.sellOnPrice}, activated: ${inProcess[orderId].activated}, locked: ${inProcess[orderId].locked}`
        // )

        if (inProcess[orderId].destroy) {
          pubSub.unsubscribe(subscribeNumber)
          delete inProcess[orderId]
        } else if (inProcess[orderId].activated) {
          // console.log(order.symbol, inProcess[orderId].locked, lastPrice.bid, order.fixedTrailingStop.sellOnPrice)

          if (!inProcess[orderId].locked && lastPrice.bid <= order.fixedTrailingStop.sellOnPrice) {
            inProcess[orderId].locked = true

            const lastPriceResult = await getSymbolLatestPrice(order.symbol)

            // console.log(lastPriceResult.data, order.fixedTrailingStop.sellOnPrice, order.fixedTrailingStop.sellOnPrice * 1.05)

            if (lastPriceResult.error) {
              inProcess[orderId].locked = false

              // TODO - send notif error
              return console.log(
                order.symbol,
                ' Process order - get last price failed: ',
                lastPriceResult.error,
                lastPriceResult.errorData
              )
            }

            const refreshedOrder = await OrderTsModel.findById(order._id)

            if (refreshedOrder?.active) {
              console.log(order.symbol, 'Placing sell order...')

              const result = await placeSellOrder({
                symbol: order.symbol,
                quoteOrderQty: order.fixedTrailingStop.quoteOrderQty,
                quantityType: order.fixedTrailingStop.quantityType as QuantityType,
                quantity: order.fixedTrailingStop.quantity,
                priceType: order.fixedTrailingStop.priceType as PriceType,
                price: order.fixedTrailingStop.sellOnPrice
              })

              if (result.error) {
                console.log(order.symbol, 'Automatic place order failed: ', result.error)
                console.log(result.errorData)
                // TODO - send high priority notification
                inProcess[orderId].locked = false
              } else {
                pubSub.unsubscribe(subscribeNumber)
                console.log(order.symbol, 'Automatic order placed')

                sendEmail('hakkamc@gmail.com', `${order.symbol} Trailing stop placed`)

                // TODO - send notification order placed
                OrderTsModel.findByIdAndUpdate(order._id, { active: false }, {}, (error) => {
                  if (error) {
                    console.log(error)
                  } else {
                    delete inProcess[orderId]
                  }
                })
              }
            } else {
              pubSub.unsubscribe(subscribeNumber)
              delete inProcess[orderId]
            }
          }
        } else if (lastPrice.bid > order.fixedTrailingStop.activateOnPrice) {
          inProcess[orderId].activated = true
          OrderTsModel.findByIdAndUpdate(order._id, { fixedTrailingStop: { activatedTimestamp: Date.now() } } as any)
        }
      }
    )

    inProcess[orderId].subscribeNumber = subscribeNumber

    console.log('Started trailing stop listening for ', order.symbol)
  }
}

const processMobingBuyOrder = async (order: OrderTsType) => {
  if (!inProcess[order._id.toString()]) {
    const orderId = order._id.toString()

    lastPriceSubscribe(order.symbol)

    inProcess[orderId] = {
      order,
      subscribeNumber: -1,
      activated: true,
      locked: false,
      destroy: false,
      specificData: {
        low: Number.MAX_SAFE_INTEGER
      }
    }

    const subscribeNumber = await pubSub.subscribe(
      `BINANCE_LAST_PRICE_${order.symbol}`,
      async (lastPrice: BinanceLastPrice) => {
        // console.log(
        //   `${order.symbol}, a/m/b: ${lastPrice.ask}/${lastPrice.middle}/${lastPrice.bid}, actOnP: ${order.fixedTrailingStop.activateOnPrice}, sellOnP: ${order.fixedTrailingStop.sellOnPrice}, activated: ${inProcess[orderId].activated}, locked: ${inProcess[orderId].locked}`
        // )

        if (inProcess[orderId].destroy) {
          pubSub.unsubscribe(subscribeNumber)
          delete inProcess[orderId]
        } else if (inProcess[orderId].activated) {
          // console.log(order.symbol, inProcess[orderId].locked, lastPrice.bid, order.fixedTrailingStop.sellOnPrice)

          inProcess[orderId].specificData.low = Math.min(inProcess[orderId].specificData.low, lastPrice.ask)

          const buyLevel = inProcess[orderId].specificData.low * ((order.movingBuy.percent + 100) / 100)

          console.log(
            order.symbol,
            ' low: ',
            inProcess[orderId].specificData.low,
            ', buy level: ',
            buyLevel,
            ', last P: ',
            lastPrice.ask
          )

          if (!inProcess[orderId].locked && buyLevel < order.movingBuy.activateOnPrice && lastPrice.ask >= buyLevel) {
            inProcess[orderId].locked = true

            // Ensure the websocket price is not just a single hype
            const lastPriceResult = await getSymbolLatestPrice(order.symbol)

            // console.log(lastPriceResult.data, order.fixedTrailingStop.sellOnPrice, order.fixedTrailingStop.sellOnPrice * 1.05)

            if (lastPriceResult.error) {
              inProcess[orderId].locked = false

              // TODO - send notif error
              return console.log(
                order.symbol,
                ' Process order - get last price failed: ',
                lastPriceResult.error,
                lastPriceResult.errorData
              )
            }

            const refreshedOrder = await OrderTsModel.findById(order._id)

            if (refreshedOrder?.active) {
              if (lastPriceResult.data < order.movingBuy.activateOnPrice) {
                console.log(order.symbol, 'MOVING BUY: Placing buy order...')

                const result = await placeBuyOrder({
                  symbol: order.symbol,
                  quoteOrderQty: order.movingBuy.quoteOrderQty,
                  quantityType: order.movingBuy.quantityType as QuantityType,
                  quantity: order.movingBuy.quantity,
                  priceType: order.movingBuy.priceType as PriceType,
                  price: order.movingBuy.activateOnPrice
                })

                if (result.error) {
                  console.log(order.symbol, 'Automatic place order failed: ', result.error)
                  console.log(result.errorData)
                  // TODO - send high priority notification
                  inProcess[orderId].locked = false
                } else {
                  pubSub.unsubscribe(subscribeNumber)
                  console.log(order.symbol, 'Automatic order placed')

                  sendEmail('hakkamc@gmail.com', `${order.symbol} Moving buy placed`)

                  // TODO - send notification order placed
                  OrderTsModel.findByIdAndUpdate(order._id, { active: false }, {}, (error) => {
                    if (error) {
                      console.log(error)
                    } else {
                      delete inProcess[orderId]
                    }
                  })
                }
              } else {
                inProcess[orderId].locked = false
              }
            } else {
              pubSub.unsubscribe(subscribeNumber)
              delete inProcess[orderId]
            }
          }
        }
      }
    )

    inProcess[orderId].subscribeNumber = subscribeNumber

    console.log('Started moving buy listening for ', order.symbol)
  }
}

const processOrder = async (order: OrderTsType) => {
  switch (order.type) {
    case OrderType.FIXED_TRAILING_STOP:
      processTrailingStopOrder(order)

      break

    case OrderType.MOVING_BUY:
      processMobingBuyOrder(order)
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
    OrderTsModel.findOneAndUpdate({ _id: orderId, user: userId }, { active: false }, {}, (error) => {
      if (error) {
        console.log(`Deactivate order ${orderId} failed:`, error)
        return resolve({
          error: 'CLOSE_ORDER_FAILED',
          errorData: error,
          data: undefined
        })
      }
      if (inProcess[orderId]) {
        inProcess[orderId].locked = true
        inProcess[orderId].destroy = true
      }

      return resolve({
        error: '',
        errorData: undefined,
        data: 'OK'
      })
    })
  })
