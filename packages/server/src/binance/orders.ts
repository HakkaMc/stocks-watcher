import {
  FilterType,
  LotSize,
  NewOrderRespType,
  NewOrderResponseFull,
  OrderType,
  PriceFilter,
  PriceType,
  QuantityType,
  Side,
  TimeInForce
} from '@sw/shared/src/binanceTypes'
// import { BinanceNewOrderResponseFull } from '@sw/shared/src/graphql'
import { getAccountInfo, getExchangeInfo, getSymbolAveragePrice, placeOrder } from './queries'
import { ReturnPromise } from '../types'
import { BinanceSymbolTsModel } from '../database/binanceSymbol/schema'

type PlaceSellOrderParams = {
  symbol: string
  priceType: PriceType
  price: number
  quantityType: QuantityType
  quantity: number
  quoteOrderQty: number
}

const enhanceQuantity = (quantity: string | number, lotSize: LotSize): number => {
  const numericQuantity = parseFloat(`${quantity}`)

  if (numericQuantity < lotSize.minQty || numericQuantity > lotSize.maxQty) {
    return -1
  }

  if (lotSize.stepSize > 0) {
    const multiplier = Math.floor(numericQuantity / lotSize.stepSize)
    const countedValue = parseFloat((lotSize.stepSize * multiplier).toFixed(8))

    return countedValue
  }

  return numericQuantity
}

const enhancePrice = (price: string | number, priceFilter: PriceFilter): number => {
  const numericPrice = parseFloat(`${price}`)

  if (numericPrice < priceFilter.minPrice || numericPrice > priceFilter.maxPrice) {
    return -1
  }

  if (priceFilter.tickSize > 0) {
    const multiplier = parseInt((numericPrice / priceFilter.tickSize).toFixed(0))
    const countedValue = parseFloat((priceFilter.tickSize * multiplier).toFixed(8))

    return countedValue
  }

  return numericPrice
}

export const placeSellOrder = async (params: PlaceSellOrderParams): ReturnPromise<NewOrderResponseFull> =>
  new Promise(async (resolve, reject) => {
    const exchangeInfo = await BinanceSymbolTsModel.findOne({ symbol: params.symbol })

    if (!exchangeInfo) {
      return resolve({
        error: 'SYMBOL_NOT_FOUND_ON_EXCHANGE_LIST',
        errorData: undefined,
        data: {} as any
      })
    }

    const lotSize = exchangeInfo.filters[FilterType.LOT_SIZE] as LotSize
    const priceFilter = exchangeInfo.filters[FilterType.PRICE_FILTER] as PriceFilter

    const orderQuery: any = {
      symbol: params.symbol,
      side: Side.SELL,
      newOrderRespType: NewOrderRespType.FULL
    }

    switch (params.priceType) {
      case PriceType.Price: {
        const countedPrice = enhancePrice(params.price, priceFilter)

        if (countedPrice < 0) {
          return resolve({
            error: 'INVALID_PRICE',
            errorData: undefined,
            data: {} as any
          })
        }

        orderQuery.type = OrderType.LIMIT
        orderQuery.price = countedPrice
        orderQuery.timeInForce = TimeInForce.GTC

        break
      }
      case PriceType.Middle: {
        const averagePrice = await getSymbolAveragePrice(params.symbol)
        if (averagePrice.error) {
          return resolve({
            error: 'CHECKING_LAST_PRICE_FAILED',
            errorData: undefined,
            data: {} as any
          })
        }

        const countedPrice = enhancePrice(averagePrice.data, priceFilter)

        if (countedPrice < 0) {
          return resolve({
            error: 'INVALID_PRICE',
            errorData: undefined,
            data: {} as any
          })
        }

        orderQuery.type = OrderType.LIMIT
        orderQuery.price = countedPrice
        orderQuery.timeInForce = TimeInForce.GTC

        // if (params.quantityType === QuantityType.QuoteOrderQty) {
        //   const quantity = params.quoteOrderQty / averagePrice.data
        //
        //   const countedQuantity = enhanceQuantity(quantity, lotSize)
        //
        //   if (countedQuantity < 0) {
        //     return resolve({
        //       error: 'INVALID_QUANTITY',
        //       errorData: undefined,
        //       data: {} as any
        //     })
        //   }
        //
        //   orderQuery.quantity = countedQuantity
        // }

        break
      }
      default:
        orderQuery.type = OrderType.MARKET
    }

    switch (params.quantityType) {
      case QuantityType.Quantity:
        const countedQuantity = enhanceQuantity(params.quantity, lotSize)

        if (countedQuantity < 0) {
          return resolve({
            error: 'INVALID_QUANTITY',
            errorData: undefined,
            data: {} as any
          })
        }

        orderQuery.quantity = countedQuantity

        // TODO - check if user has this quantity on his account
        break

      case QuantityType.QuoteOrderQty:
        const quoteOrderQty = parseFloat(`${params.quoteOrderQty}`)

        if (quoteOrderQty < 0) {
          return resolve({
            error: 'INVALID_QUOTE_ORDER_QUANTITY',
            errorData: undefined,
            data: {} as any
          })
        }

        if (params.priceType === PriceType.Market) {
          orderQuery.quoteOrderQty = quoteOrderQty
        } else {
          if (params.priceType === PriceType.Middle) {
            const averagePriceResult = await getSymbolAveragePrice(params.symbol)
            if (averagePriceResult.error) {
              return resolve({
                error: averagePriceResult.error,
                errorData: averagePriceResult.errorData,
                data: {} as any
              })
            }

            orderQuery.price = enhancePrice(averagePriceResult.data, priceFilter)
          }

          const countedQuantity = enhanceQuantity(params.quoteOrderQty / orderQuery.price, lotSize)

          if (countedQuantity < 0) {
            return resolve({
              error: 'INVALID_QUANTITY',
              errorData: undefined,
              data: {} as any
            })
          }

          orderQuery.quantity = countedQuantity
        }
        break

      // Sell all
      default:
        const balances = await getAccountInfo()

        if (balances.length) {
          const balanceItem = balances.find((balanceItem) => balanceItem.asset === exchangeInfo.baseAsset)

          const countedQuantity = enhanceQuantity(balanceItem?.free || 0, lotSize)

          if (countedQuantity > 0) {
            orderQuery.quantity = countedQuantity
          } else {
            return resolve({
              error: 'NOT_ENOUGH_AMOUNT_TO_SELL',
              errorData: undefined,
              data: {} as any
            })
          }
        } else {
          return resolve({
            error: 'GET_ACCOUNT_INFO_FAILED',
            errorData: undefined,
            data: {} as any
          })
        }
    }

    const testResult = await placeOrder(orderQuery, false)

    if (testResult.error) {
      return resolve(testResult)
    }

    const result = await placeOrder(orderQuery, true)
    return resolve(result)
    // return resolve(testResult)
  })

export const placeBuyOrder = async (params: PlaceSellOrderParams): ReturnPromise<NewOrderResponseFull> =>
  new Promise(async (resolve, reject) => {
    const exchangeInfo = await BinanceSymbolTsModel.findOne({ symbol: params.symbol })

    if (!exchangeInfo) {
      return resolve({
        error: 'SYMBOL_NOT_FOUND_ON_EXCHANGE_LIST',
        errorData: undefined,
        data: {} as any
      })
    }

    const lotSize = exchangeInfo.filters[FilterType.LOT_SIZE] as LotSize
    const priceFilter = exchangeInfo.filters[FilterType.PRICE_FILTER] as PriceFilter

    const orderQuery: any = {
      symbol: params.symbol,
      side: Side.BUY,
      newOrderRespType: NewOrderRespType.FULL
    }

    switch (params.priceType) {
      case PriceType.Price: {
        const countedPrice = enhancePrice(params.price, priceFilter)

        if (countedPrice < 0) {
          return resolve({
            error: 'INVALID_PRICE',
            errorData: undefined,
            data: {} as any
          })
        }

        orderQuery.type = OrderType.LIMIT
        orderQuery.price = countedPrice
        orderQuery.timeInForce = TimeInForce.GTC

        break
      }
      case PriceType.Middle: {
        const averagePrice = await getSymbolAveragePrice(params.symbol)
        if (averagePrice.error) {
          return resolve({
            error: 'CHECKING_LAST_PRICE_FAILED',
            errorData: undefined,
            data: {} as any
          })
        }

        const countedPrice = enhancePrice(averagePrice.data, priceFilter)

        if (countedPrice < 0) {
          return resolve({
            error: 'INVALID_PRICE',
            errorData: undefined,
            data: {} as any
          })
        }

        orderQuery.type = OrderType.LIMIT
        orderQuery.price = countedPrice
        orderQuery.timeInForce = TimeInForce.GTC

        // if (params.quantityType === QuantityType.QuoteOrderQty) {
        //   const quantity = params.quoteOrderQty / averagePrice.data
        //
        //   const countedQuantity = enhanceQuantity(quantity, lotSize)
        //
        //   if (countedQuantity < 0) {
        //     return resolve({
        //       error: 'INVALID_QUANTITY',
        //       errorData: undefined,
        //       data: {} as any
        //     })
        //   }
        //
        //   orderQuery.quantity = countedQuantity
        // }

        break
      }
      default:
        orderQuery.type = OrderType.MARKET
    }

    switch (params.quantityType) {
      case QuantityType.Quantity:
        const countedQuantity = enhanceQuantity(params.quantity, lotSize)

        if (countedQuantity < 0) {
          return resolve({
            error: 'INVALID_QUANTITY',
            errorData: undefined,
            data: {} as any
          })
        }

        orderQuery.quantity = countedQuantity

        // TODO - check if user has this quantity on his account
        break

      case QuantityType.QuoteOrderQty:
        const quoteOrderQty = parseFloat(`${params.quoteOrderQty}`)

        if (quoteOrderQty < 0) {
          return resolve({
            error: 'INVALID_QUOTE_ORDER_QUANTITY',
            errorData: undefined,
            data: {} as any
          })
        }

        if (params.priceType === PriceType.Market) {
          orderQuery.quoteOrderQty = quoteOrderQty
        } else {
          if (params.priceType === PriceType.Middle) {
            const averagePriceResult = await getSymbolAveragePrice(params.symbol)
            if (averagePriceResult.error) {
              return resolve({
                error: averagePriceResult.error,
                errorData: averagePriceResult.errorData,
                data: {} as any
              })
            }

            orderQuery.price = enhancePrice(averagePriceResult.data, priceFilter)
          }

          const countedQuantity = enhanceQuantity(params.quoteOrderQty / orderQuery.price, lotSize)

          if (countedQuantity < 0) {
            return resolve({
              error: 'INVALID_QUANTITY',
              errorData: undefined,
              data: {} as any
            })
          }

          orderQuery.quantity = countedQuantity
        }
        break

      default:
        return resolve({
          error: 'INVALID_QUANTITY_TYPE',
          errorData: undefined,
          data: {} as any
        })
    }

    const testResult = await placeOrder(orderQuery, false)

    if (testResult.error) {
      return resolve(testResult)
    }

    const result = await placeOrder(orderQuery, true)
    return resolve(result)
    // return resolve(testResult)
  })
