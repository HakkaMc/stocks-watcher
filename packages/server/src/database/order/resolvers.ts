import { ResolverResolveParams, ObjectTypeComposerFieldConfigAsObjectDefinition } from 'graphql-compose'
import { orderGraphql, OrderTsModel, OrderTsType } from './schema'
import { ResolverContext } from '../../types'
import { closeOrder, computeOrder } from '../../computes/computeOrders'

const getOrderTemplate = () => ({
  active: true,
  type: 'NA',
  symbol: 'NA',
  exchange: 'BINANCE',
  activateOnPrice: -1,
  sellOnPrice: -1,
  priceType: 'NA',
  quantityType: 'NA',
  quantity: -1,
  quoteOrderQty: -1,
  activatedTimestamp: -1,
  percent: -1
})

let getOrders = orderGraphql.mongooseResolvers.findMany()
getOrders = getOrders.addSortArg({
  name: 'CREATED_ASC',
  value: { createdAt: 1 } as any
})
getOrders = getOrders.addSortArg({
  name: 'CREATED_DESC',
  value: { createdAt: -1 } as any
})
getOrders = getOrders.withMiddlewares([
  async (resolve, source, args, context: ResolverContext, info) => {
    const enhancedArgs: any = {
      ...(args || {})
    }

    if (!enhancedArgs.filter) {
      enhancedArgs.filter = {}
    }

    enhancedArgs.filter.user = context.session.userId

    const res = await resolve(source, enhancedArgs, context, info)

    return res
  }
])

let setOrder = orderGraphql.mongooseResolvers.createOne({
  record: {
    removeFields: ['user', 'active', 'activatedTimestamp', '_id', 'updatedAt', 'createdAt']
  }
})
setOrder = setOrder.withMiddlewares([
  async (resolve, source, args, context: ResolverContext, info) => {
    const enhancedArgs: any = {
      ...(args || {})
    }

    if (!enhancedArgs.record) {
      enhancedArgs.record = {}
    }

    enhancedArgs.record = {
      ...getOrderTemplate(),
      ...enhancedArgs.record,
      exchange: enhancedArgs.record.exchange || 'BINANCE',
      user: context.session.userId
    }

    const res = await resolve(source, enhancedArgs, context, info)

    if (res?.record?._id) {
      computeOrder(res.record._id)
    }
    return res
  }
])

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
    const response = await closeOrder(args.orderId, context.session.userId)

    if (response.error) {
      return new Error(response.error)
    }

    return 'OK'
  }
}

export const orderResolvers = {
  query: {
    getOrders
  },
  mutation: {
    cancelOrder,
    setOrder
  }
}
