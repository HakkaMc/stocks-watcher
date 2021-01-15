import { ResolverResolveParams } from 'graphql-compose'
import { userGraphql, UserTsModel, UserTsType } from './schema'
import { SymbolTsType, SymbolTsModel, symbolGraphql } from '../symbol/schema'

userGraphql.addResolver({
  kind: 'query',
  name: 'getUserProfile',
  type: userGraphql,
  resolve: async () => {
    const user = await UserTsModel.findOne({ name: 'admin' })
    return user
  }
})

userGraphql.addResolver({
  kind: 'mutation',
  name: 'saveSymbolToDashboard',
  args: {
    symbol: 'String'
  },
  type: symbolGraphql,
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const user = await UserTsModel.findOne({ name: 'admin' })
    const symbolObj = await SymbolTsModel.findOne({ symbol: params.args.symbol })
    if (symbolObj && user) {
      // @ts-ignore
      if (!user.dashboard?.watchedSymbols?.includes(symbolObj._id)) {
        // @ts-ignore
        user.dashboard.watchedSymbols.push(symbolObj._id)
        await user.save()
      }
      // UserTsModel.replaceOne({symbol: symbolObj.symbol}, symbolObj, {upsert: true}))
    }

    // return user?.dashboard.watchedSymbols || []
    // const updatedUser = await UserTsModel.findOne({name: 'admin'}).populate('dashboard.watchedSymbols')
    // return updatedUser?.dashboard.watchedSymbols || []
    return symbolObj
  }
})

// userGraphql.addRelation('dashboardwatchedSymbols', {
//     resolver: () => symbolGraphql.mongooseResolvers.dataLoader(),
//     prepareArgs: {
//         _id: (source: UserTsType) => {
//             console.log(source)
//             return source.dashboard.watchedSymbols
//         }
//     },
//     // projection: { dashboard: {watchedSymbols: 1 }}
//     projection: { watchedSymbols: 1 }
// })

userGraphql.getFieldOTC('dashboard').addRelation('watchedSymbols', {
  resolver: () => symbolGraphql.mongooseResolvers.findByIds(),
  prepareArgs: {
    _ids: (source: any) => {
      return source.watchedSymbols || []
    }
  },
  projection: { dashboard: { watchedSymbols: 1 } }
})

export const userResolvers = {
  query: {
    getUserProfile: userGraphql.getResolver('getUserProfile')
  },
  mutation: {
    saveSymbolToDashboard: userGraphql.getResolver('saveSymbolToDashboard')
  }
}
