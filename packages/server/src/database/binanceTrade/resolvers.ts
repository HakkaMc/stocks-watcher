import { ObjectTypeComposerFieldConfigAsObjectDefinition, ResolverResolveParams } from 'graphql-compose'
import { binanceTradeGraphql } from './schema'

import { ResolverContext } from '../../types'
import { countBalance } from '../../binance'
import {
  getDepositHistory,
  getFiatOrderHistory, getFiatPaymentHistory,
  getFundingHistory, getUniversalTransferHistory,
  getWithdrawHistory
} from "../../binance/queries";

const refreshBinanceTrades: ObjectTypeComposerFieldConfigAsObjectDefinition<any, ResolverContext, any> = {
  kind: 'mutation',
  name: 'refreshBinanceTrades',
  args: {
    force: 'Boolean'
  },
  type: 'String!',
  resolve: async (source, args, context) => {
    if (context.session.userId) {
      // getDepositHistory()
      // getUniversalTransferHistory()
      // getWithdrawHistory()
      // getFundingHistory()
      // getFiatOrderHistory()
      getFiatPaymentHistory()

      countBalance(context.session.userId, args.force)


      return 'OK'
    }

    return new Error('REFRESH_BINANCE_TRADES_FAILED')
  }
}

const getBinanceInvestedAmount:ObjectTypeComposerFieldConfigAsObjectDefinition<any, ResolverContext, any> = {
  kind: 'query',
  name: 'getBinanceInvestedAmount',
  type: 'Float!',
  resolve: async (source, args, context) => {
    if (context.session.userId) {
      const result = await getFiatPaymentHistory()

      if(result.error){
        return new Error('GET_BINANCE_INVESTED_FAILED')
      }
      else{
        return result.data||0
      }
    }

    return new Error('GET_BINANCE_INVESTED_FAILED')
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
    getBinanceTrades,
    getBinanceInvestedAmount,
  },
  mutation: {
    refreshBinanceTrades
  }
}
