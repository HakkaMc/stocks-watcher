import { schemaComposer, ResolverResolveParams, ObjectTypeComposerFieldConfigAsObjectDefinition } from 'graphql-compose'
import { GraphQLNonNull, GraphQLList } from 'graphql'
import { PriceType, QuantityType } from '@sw/shared/src/binanceTypes'
import mongoose from 'mongoose'
import { pubSub } from '../../pubSub'
import { orderGraphql, OrderTsModel, OrderTsType } from './schema'
import { ResolverContext } from '../../types'
import { computeOrder } from '../../computes/computeOrders'
import { UserSchema } from '../user/schema'
import { OrderType } from '../../types/mix'

const getOrderTemplate = (user: any) => ({
  active: true,
  user: mongoose.Types.ObjectId(user),
  type: 'NA',
  symbol: 'NA',
  exchange: 'BINANCE',
  fixedTrailingStop: {
    activateOnPrice: -1,
    sellOnPrice: -1,
    priceType: 'NA',
    quantityType: 'NA',
    quantity: -1,
    quoteOrderQty: -1,
    activatedTimestamp: -1
  },
  movingBuy: {
    activateOnPrice: -1,
    percent: -1,
    priceType: 'NA',
    quantityType: 'NA',
    quantity: -1,
    quoteOrderQty: -1
  },
  percentageTrailingStop: {
    activateOnPrice: -1,
    percentageDecrease: -1
  }
})

const getOrders: ObjectTypeComposerFieldConfigAsObjectDefinition<any, ResolverContext, any> = {
  kind: 'query',
  name: 'getOrders',
  type: new GraphQLNonNull(new GraphQLList(orderGraphql.getType())),
  resolve: async (source, args, context) => {
    const orders = await OrderTsModel.find({ user: context.session.userId, active: true })

    return orders || []
  }
}

const setTrailingStopOrder: ObjectTypeComposerFieldConfigAsObjectDefinition<
  any,
  ResolverContext,
  {
    activateOnPrice: number
    sellOnPrice: number
    symbol: string
    priceType: PriceType
    quantityType: QuantityType
    quantity: number
    quoteOrderQty: number
  }
> = {
  kind: 'mutation',
  name: 'setTrailingStopOrder',
  type: 'String!',
  args: {
    symbol: 'String!',
    activateOnPrice: 'Float!',
    sellOnPrice: 'Float!',
    priceType: 'String!',
    quantityType: 'String!',
    quantity: 'Float!',
    quoteOrderQty: 'Float!'
  },
  resolve: async (source, args, context) => {
    const orderConfig = getOrderTemplate(context.session.userId)
    orderConfig.symbol = args.symbol
    ;(orderConfig.type = OrderType.FIXED_TRAILING_STOP), (orderConfig.exchange = 'BINANCE')
    orderConfig.fixedTrailingStop = {
      activateOnPrice: args.activateOnPrice,
      sellOnPrice: args.sellOnPrice,
      priceType: args.priceType,
      quantityType: args.quantityType,
      quantity: args.quantity,
      quoteOrderQty: args.quoteOrderQty,
      activatedTimestamp: -1
    }

    const newOrder = await new OrderTsModel(orderConfig).save()

    computeOrder(newOrder._id)

    return 'OK'
  }
}

const setMovingBuyOrder: ObjectTypeComposerFieldConfigAsObjectDefinition<
  any,
  ResolverContext,
  {
    activateOnPrice: number
    percent: number
    symbol: string
    priceType: PriceType
    quantityType: QuantityType
    quantity: number
    quoteOrderQty: number
  }
> = {
  kind: 'mutation',
  name: 'setMovingBuyOrder',
  type: 'String!',
  args: {
    symbol: 'String!',
    activateOnPrice: 'Float!',
    percent: 'Float!',
    priceType: 'String!',
    quantityType: 'String!',
    quantity: 'Float!',
    quoteOrderQty: 'Float!'
  },
  resolve: async (source, args, context) => {
    const orderConfig = getOrderTemplate(context.session.userId)
    orderConfig.symbol = args.symbol
    ;(orderConfig.type = OrderType.MOVING_BUY), (orderConfig.exchange = 'BINANCE')
    orderConfig.movingBuy = {
      activateOnPrice: args.activateOnPrice,
      percent: args.percent,
      priceType: args.priceType,
      quantityType: args.quantityType,
      quantity: args.quantity,
      quoteOrderQty: args.quoteOrderQty
    }

    const newOrder = await new OrderTsModel(orderConfig).save()

    computeOrder(newOrder._id)

    return 'OK'
  }
}

const cancelOrder: ObjectTypeComposerFieldConfigAsObjectDefinition<
  any,
  ResolverContext,
  {
    orderId: string
  }
> = {
  kind: 'mutation',
  name: 'cancelOrder',
  type: 'String!',
  args: {
    orderId: 'String!'
  },
  resolve: async (source, args, context) => {
    await OrderTsModel.findOneAndUpdate({ _id: args.orderId, user: context.session.userId }, { active: false })

    return 'OK'
  }
}

export const orderResolvers = {
  query: {
    getOrders
  },
  mutation: {
    cancelOrder,
    setTrailingStopOrder,
    setMovingBuyOrder
  }
}
