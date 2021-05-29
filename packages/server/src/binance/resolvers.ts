import { schemaComposer, ResolverResolveParams, ObjectTypeComposerFieldConfigAsObjectDefinition } from 'graphql-compose'
import { GraphQLNonNull, GraphQLList } from 'graphql'
import { placeBuyOrder, placeSellOrder } from './orders'
import * as api from './queries'
import { pubSub } from '../pubSub'
import { lastPriceSubscribe } from './ws'
import { ResolverContext } from '../types'

const Binance = schemaComposer.createObjectTC({
  name: 'Binance',
  fields: {}
})

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

// ResolverDefinition<TSource, TContext, TArgs>
// const setBinanceSellOrder: ResolverDefinition<any, any, any> = {
Binance.addResolver({
  kind: 'query',
  name: 'setBinanceSellOrder',
  type: BinanceNewOrderResponseFull,
  args: {
    symbol: 'String!',
    priceType: 'String!',
    price: 'Float!',
    quantityType: 'String!',
    quantity: 'Float!',
    quoteOrderQty: 'Float!'
  },
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    // resolve: async (params: any) => {
    // const { userId } = params.context.session

    const result = await placeSellOrder(params.args)

    if (result.error) {
      return new Error(result.error)
    }

    return result.data
  }
})

Binance.addResolver({
  kind: 'query',
  name: 'setBinanceBuyOrder',
  type: BinanceNewOrderResponseFull,
  args: {
    symbol: 'String!',
    priceType: 'String!',
    price: 'Float!',
    quantityType: 'String!',
    quantity: 'Float!',
    quoteOrderQty: 'Float!'
  },
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    // resolve: async (params: any) => {
    // const { userId } = params.context.session

    const result = await placeBuyOrder(params.args)

    if (result.error) {
      return new Error(result.error)
    }

    return result.data
  }
})

// ResolverDefinition<TSource, TContext, TArgs>
const getBinanceAccountInformation: ObjectTypeComposerFieldConfigAsObjectDefinition<any, any, any> = {
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

// ObjectTypeComposerFieldConfigAsObjectDefinition<TSource, TContext, TArgs>
const getBinanceTrades: ObjectTypeComposerFieldConfigAsObjectDefinition<
  any,
  ResolverContext,
  {
    symbol: string
  }
> = {
  kind: 'query',
  name: 'getBinanceTrades',
  type: new GraphQLNonNull(
    new GraphQLList(
      new GraphQLNonNull(
        schemaComposer
          .createObjectTC({
            name: 'BinanceTrade',
            fields: {
              id: 'Float!',
              orderId: 'Float!',
              symbol: 'String!',
              isBuyer: 'Boolean!',
              price: 'Float!',
              qty: 'Float!',
              quoteQty: 'Float!',
              time: 'Float!',
              commission: 'Float!',
              commissionAsset: 'String!'
            }
          })
          .getType()
      )
    )
  ),
  args: {
    symbol: 'String!'
  },
  resolve: async (source, args, context) => {
    const result = await api.getTrades(args.symbol)

    if (result.error) {
      return new Error(result.error)
    }

    return result.data
  }
}

Binance.addResolver({
  kind: 'query',
  name: 'getBinanceExchangeInformation',
  type: new GraphQLNonNull(
    new GraphQLList(
      new GraphQLNonNull(
        schemaComposer
          .createObjectTC({
            name: 'BinanceExchangeInformation',
            fields: {
              symbol: 'String!',
              baseAsset: 'String!',
              quoteAsset: 'String!',
              filters: 'JSON!',
              ocoAllowed: 'Boolean!'
            }
          })
          .getType()
      )
    )
  ),
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const result = await api.getExchangeInfo()

    if (result.error) {
      return new Error(result.error)
    }

    return Object.values(result.data) || []
  }
})

Binance.addResolver({
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
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const result = await api.getOrders()

    if (result.error) {
      return new Error(result.error)
    }

    return result.data
  }
})

Binance.addResolver({
  kind: 'query',
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
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const result = await api.cancelOrder({ ...params.args })

    if (result.error) {
      return new Error(result.error)
    }

    return result.data
  }
})

export const binanceResolvers = {
  query: {
    // getBinanceReport: Report.getResolver('getBinanceReport'),
    setBinanceSellOrder: Binance.getResolver('setBinanceSellOrder'),
    setBinanceBuyOrder: Binance.getResolver('setBinanceBuyOrder'),
    // setBinanceSellOrder: setBinanceSellOrder as any,
    getBinanceAccountInformation: getBinanceAccountInformation as any,
    // getBinanceTrades: Binance.getResolver('getBinanceTrades'),
    getBinanceTrades,
    getBinanceExchangeInformation: Binance.getResolver('getBinanceExchangeInformation'),
    getBinanceOrders: Binance.getResolver('getBinanceOrders'),
    cancelBinanceOrder: Binance.getResolver('cancelBinanceOrder')
  },
  subscription: {
    binanceLastPrice: {
      kind: 'subscription',
      name: 'binanceLastPrice',
      type: schemaComposer.createObjectTC({
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
      }),
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
