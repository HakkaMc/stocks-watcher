import { schemaComposer, ResolverResolveParams, ObjectTypeComposerFieldConfigAsObjectDefinition } from 'graphql-compose'
import { GraphQLNonNull, GraphQLList } from 'graphql'
import { placeBuyOrder, placeSellOrder } from './orders'
import * as api from './queries'
import { pubSub } from '../pubSub'
import { getCachedLastPrice, lastPriceSubscribe } from './ws'
import { ResolverContext } from '../types'
import { getSymbolAveragePrice } from './queries'

const BinanceLastPrice = schemaComposer
  .createObjectTC({
    name: 'BinanceLastPrice',
    fields: {
      symbol: 'String!',
      ask: 'Float!',
      bid: 'Float!',
      middle: 'Float!',
      diff: 'Float!',
      diffPercentage: 'Float!',
      timestamp: 'Float!'
    }
  })
  .getType()

const BinanceNewOrderResponseFull = schemaComposer.createObjectTC({
  name: 'BinanceNewOrderResponseFull',
  fields: {
    symbol: 'String!',
    orderId: 'Int!',
    orderListId: 'Int!',
    clientOrderId: 'String!',
    transactTime: 'Float!',
    price: 'String!',
    origQty: 'String!',
    executedQty: 'String!',
    cummulativeQuoteQty: 'String!',
    status: 'String!',
    timeInForce: 'String!',
    type: 'String!',
    side: 'String!',
    fills: new GraphQLNonNull(
      new GraphQLList(
        new GraphQLNonNull(
          schemaComposer
            .createObjectTC({
              name: 'BinanceFill',
              fields: {
                price: 'Float!',
                qty: 'Float!',
                commission: 'Float!',
                commissionAsset: 'String!'
              }
            })
            .getType()
        )
      )
    )
  }
})

const setBinanceSellOrder: ObjectTypeComposerFieldConfigAsObjectDefinition<any, ResolverContext, any> = {
  kind: 'mutation',
  name: 'setBinanceSellOrder',
  type: 'String!',
  args: {
    symbol: 'String!',
    priceType: 'String!',
    price: 'Float!',
    quantityType: 'String!',
    quantity: 'Float!',
    quoteOrderQty: 'Float!'
  },
  resolve: async (source, args, context) => {
    // resolve: async (params: any) => {
    // const { userId } = params.context.session

    const result = await placeSellOrder(args)

    if (result.error) {
      return new Error(result.error)
    }

    return 'OK'
  }
}

const setBinanceBuyOrder: ObjectTypeComposerFieldConfigAsObjectDefinition<any, ResolverContext, any> = {
  kind: 'mutation',
  name: 'setBinanceBuyOrder',
  type: 'String!',
  args: {
    symbol: 'String!',
    priceType: 'String!',
    price: 'Float!',
    quantityType: 'String!',
    quantity: 'Float!',
    quoteOrderQty: 'Float!'
  },
  resolve: async (source, args, context) => {
    // resolve: async (params: any) => {
    // const { userId } = params.context.session

    const result = await placeBuyOrder(args)

    if (result.error) {
      return new Error(result.error)
    }

    return 'OK'
  }
}

// ResolverDefinition<TSource, TContext, TArgs>
const getBinanceAccountInformation: ObjectTypeComposerFieldConfigAsObjectDefinition<any, ResolverContext, any> = {
  kind: 'query',
  name: 'getBinanceAccountInformation',
  type: schemaComposer.createObjectTC({
    name: 'BinanceAccountInformation',
    fields: {
      makerCommission: 'Float!',
      takerCommission: 'Float!',
      buyerCommission: 'Float!',
      sellerCommission: 'Float!',
      canTrade: 'Boolean!',
      canWithdraw: 'Boolean!',
      canDeposit: 'Boolean!',
      updateTime: 'Float!',
      accountType: 'String!',
      balances: new GraphQLNonNull(
        new GraphQLList(
          new GraphQLNonNull(
            schemaComposer
              .createObjectTC({
                name: 'BinanceBalance',
                fields: {
                  asset: 'String!',
                  free: 'Float!',
                  locked: 'Float!'
                }
              })
              .getType()
          )
        )
      ),
      permissions: '[String!]!'
    }
  }),
  resolve: async () => {
    const result = await api.getAccountInformation()

    if (result.error) {
      return new Error(result.error)
    }

    return result.data
  }
}

const getBinanceOrders: ObjectTypeComposerFieldConfigAsObjectDefinition<any, ResolverContext, any> = {
  kind: 'query',
  name: 'getBinanceOrders',
  type: new GraphQLNonNull(
    new GraphQLList(
      new GraphQLNonNull(
        schemaComposer
          .createObjectTC({
            name: 'BinanceOrder',
            fields: {
              symbol: 'String!',
              orderId: 'Float!',
              orderListId: 'Float!',
              clientOrderId: 'String!',
              price: 'Float!',
              origQty: 'Float!',
              executedQty: 'Float!',
              cummulativeQuoteQty: 'Float!',
              status: 'String!',
              timeInForce: 'String!',
              type: 'String!',
              side: 'String!',
              stopPrice: 'Float!',
              icebergQty: 'Float!',
              time: 'Float!',
              updateTime: 'Float!',
              isWorking: 'Boolean!',
              origQuoteOrderQty: 'Float!'
            }
          })
          .getType()
      )
    )
  ),
  resolve: async (source, args, context) => {
    const result = await api.getOrders()

    if (result.error) {
      return new Error(result.error)
    }

    return result.data
  }
}

const cancelBinanceOrder: ObjectTypeComposerFieldConfigAsObjectDefinition<any, ResolverContext, any> = {
  kind: 'mutation',
  name: 'cancelBinanceOrder',
  type: new GraphQLNonNull(
    new GraphQLList(
      new GraphQLNonNull(
        schemaComposer
          .createObjectTC({
            name: 'CancelBinanceOrder',
            fields: {
              symbol: 'String!',
              origClientOrderId: 'String!',
              orderId: 'Int!',
              orderListId: 'Int!',
              clientOrderId: 'String!',
              price: 'Float!',
              origQty: 'Float!',
              executedQty: 'Float!',
              cummulativeQuoteQty: 'Float!',
              status: 'String!',
              timeInForce: 'String!',
              type: 'String!',
              side: 'String!'
            }
          })
          .getType()
      )
    )
  ),
  args: {
    symbol: 'String!',
    orderId: 'Int',
    origClientOrderId: 'String'
  },
  resolve: async (source, args, context) => {
    const result = await api.cancelOrder({ ...args })

    if (result.error) {
      return new Error(result.error)
    }

    return result.data
  }
}

const getBinanceCachedLastPrice: ObjectTypeComposerFieldConfigAsObjectDefinition<any, ResolverContext, any> = {
  king: 'query',
  name: 'getBinanceCachedLastPrice',
  type: new GraphQLNonNull(BinanceLastPrice),
  args: {
    symbol: 'String!'
  },
  resolve: async (source, args, context) => {
    const price = getCachedLastPrice(args.symbol)

    if (price) {
      return price
    }
    const result = await getSymbolAveragePrice(args.symbol)
    if (result.error) {
      return new Error(result.error)
    }
    return {
      symbol: args.symbol,
      ask: result.data,
      bid: result.data,
      middle: result.data,
      diff: 0,
      diffPercentage: 0,
      timestamp: Date.now()
    }
  }
}

export const binanceResolvers = {
  query: {
    getBinanceAccountInformation: getBinanceAccountInformation as any,
    getBinanceOrders,
    getBinanceCachedLastPrice
  },
  mutation: {
    setBinanceSellOrder,
    setBinanceBuyOrder,
    cancelBinanceOrder
  },
  subscription: {
    binanceLastPrice: {
      kind: 'subscription',
      name: 'binanceLastPrice',
      type: new GraphQLNonNull(BinanceLastPrice),
      args: {
        symbol: 'String'
      },
      resolve: (data: any) => data,
      subscribe: async (parent: any, { symbol }: { symbol: string }, context: any) => {
        // const { userId } = context.session
        // symbols.forEach(symbol=> {
        //   pubSub.asyncIterator([`BINANCE_LAST_PRICE_${symbol.toUpperCase()}`])
        lastPriceSubscribe(symbol)
        // })

        return pubSub.asyncIterator([`BINANCE_LAST_PRICE_${symbol.toUpperCase()}`])
      }
    },
    binanceBalanceUpdate: {
      kind: 'subscription',
      name: 'binanceBalanceUpdate',
      type: schemaComposer.createObjectTC({
        name: 'BinanceBalanceUpdate',
        fields: {
          asset: 'String!',
          delta: 'Float!',
          eventTime: 'Int!',
          clearTime: 'Int!'
        }
      }),
      resolve: (data: any) => data,
      subscribe: async (parent: any, args: any, context: any) => {
        const { userId } = context.session

        // TODO - implement user ID
        return pubSub.asyncIterator([`BINANCE_BALANCE_UPDATE`])
      }
    },
    binanceOrderUpdate: {
      kind: 'subscription',
      name: 'binanceOrderUpdate',
      type: schemaComposer.createObjectTC({
        name: 'BinanceOrderUpdate',
        fields: {
          symbol: 'String!',
          eventTime: 'Int!',
          side: 'String!',
          orderId: 'Int!',
          transactionTime: 'Int!'
        }
      }),
      resolve: (data: any) => data,
      subscribe: async (parent: any, args: any, context: any) => {
        const { userId } = context.session

        // TODO - implement user ID
        return pubSub.asyncIterator([`BINANCE_ORDER_UPDATE`])
      }
    },
    binanceOcoOrderUpdate: {
      kind: 'subscription',
      name: 'binanceOcoOrderUpdate',
      type: schemaComposer.createObjectTC({
        name: 'BinanceOcoOrderUpdate',
        fields: {
          symbol: 'String!',
          eventTime: 'Int!',
          transactionTime: 'Int!'
        }
      }),
      resolve: (data: any) => data,
      subscribe: async (parent: any, args: any, context: any) => {
        const { userId } = context.session

        // TODO - implement user ID
        return pubSub.asyncIterator([`BINANCE_OCO_ORDER_UPDATE`])
      }
    }
  }
}
