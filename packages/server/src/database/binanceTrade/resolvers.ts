import { ObjectTypeComposerFieldConfigAsObjectDefinition, ResolverResolveParams } from 'graphql-compose'
import { binanceTradeGraphql } from './schema'

import { ResolverContext } from '../../types'
import { countBalance } from '../../binance'

const refreshBinanceTrades: ObjectTypeComposerFieldConfigAsObjectDefinition<any, ResolverContext, any> = {
  kind: 'mutation',
  name: 'refreshBinanceTrades',
  type: 'String!',
  resolve: async (source, args, context) => {
    if (context.session.userId) {
      countBalance(context.session.userId)

      return 'OK'
    }

    return new Error('REFRESH_BINANCE_TRADES_FAILED')
  }
}

const getBinanceTrades = binanceTradeGraphql.mongooseResolvers.findMany()
getBinanceTrades.addSortArg({
  name: 'TIME_ASC',
  value: { time: 1 } as any
})
getBinanceTrades.addSortArg({
  name: 'TIME_DESC',
  value: { time: -1 } as any
})
getBinanceTrades.wrapResolve((next) => (params: ResolverResolveParams<any, ResolverContext, any>) => {
  if (!params.args) {
    params.args = {}
  }

  if (!params.args.filter) {
    params.args.filter = {}
  }

  params.args.filter.user = params.context.session.userId

  return next(params)
})

export const binanceTradeResolvers = {
  query: {
    getBinanceTrades
  },
  mutation: {
    refreshBinanceTrades
  }
}
