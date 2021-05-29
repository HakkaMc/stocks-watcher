import { ResolverResolveParams } from 'graphql-compose'
import mongoose from 'mongoose'
import { GraphQLResolveInfo } from 'graphql/type/definition'
import { dashboardGraphql, DashboardTsModel } from './schema'
import { userGraphql, UserTsModel } from '../user/schema'
import { ChartGroupTsModel } from '../chartGroup/schema'

dashboardGraphql.addResolver({
  kind: 'query',
  name: 'getDashboard',
  type: dashboardGraphql,
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session

    const dashboard = await DashboardTsModel.findOne({ user: userId })

    return dashboard
  }
})

dashboardGraphql.addResolver({
  kind: 'mutation',
  name: 'createFlag',
  args: {
    flag: 'String!'
  },
  type: 'String',
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session

    const dashboard = await DashboardTsModel.findOne({ user: userId })

    if (dashboard?.flags?.some((flagObj) => flagObj.name === params.args.flag)) {
      dashboard.flags.push({
        name: params.args.flag
      })

      await dashboard.save()
    }

    return 'OK'
  }
})

dashboardGraphql.addResolver({
  kind: 'mutation',
  name: 'saveSymbolToDashboard',
  args: {
    symbol: 'String!',
    flag: 'String!'
  },
  type: 'String',
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session
    const dashboard = await DashboardTsModel.findOne({ user: userId })

    let flagId = mongoose.Types.ObjectId()

    const flag = dashboard?.flags?.find(
      (flag) => flag.name === params.args.flag || flag._id.toString() === params.args.flag
    )

    if (flag) {
      flagId = flag._id
    } else if (dashboard) {
      // @ts-ignore
      dashboard.flags.push({
        name: params.args.flag,
        _id: flagId
      })
    }

    if (dashboard && !dashboard?.watchedSymbols?.some((symbolObj) => symbolObj.symbol === params.args.symbol)) {
      // @ts-ignore
      dashboard.watchedSymbols?.push({
        symbol: params.args.symbol,
        flags: [flagId]
      })

      await dashboard.save()
    } else if (dashboard) {
      const watchedSymbol = dashboard.watchedSymbols?.find((ws) => ws.symbol === params.args.symbol)
      if (watchedSymbol) {
        watchedSymbol.flags?.push(flagId)
        await dashboard.save()
      }
    }

    return 'OK'
  }
})

dashboardGraphql.addResolver({
  kind: 'mutation',
  name: 'removeSymbolFromDashboard',
  args: {
    symbol: 'String!'
  },
  type: 'String',
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session

    await DashboardTsModel.updateOne(
      { user: userId },
      { $pull: { watchedSymbols: { symbol: params.args.symbol } } },
      { multi: false }
    )

    return 'OK'
  }
})

dashboardGraphql.addResolver({
  kind: 'mutation',
  name: 'changeSymbolFlag',
  args: {
    symbol: 'String!',
    flag: 'String',
    add: 'Boolean!'
  },
  type: 'String',
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session

    const dashboard = await DashboardTsModel.findOne({ user: userId })

    if (dashboard) {
      const watchedSymbol = dashboard.watchedSymbols?.find((ws) => ws.symbol === params.args.symbol)

      const flag = await dashboard.flags?.find(
        (flagObj) => flagObj.name === params.args.flag || flagObj._id === params.args.flag
      )

      if (watchedSymbol && params.args.add) {
        let flagId = mongoose.Types.ObjectId()
        if (flag) {
          flagId = flag._id
        } else {
          dashboard.flags?.push({
            _id: flagId,
            name: params.args.flag
          })
        }

        watchedSymbol.flags?.push(flagId)
      } else if (watchedSymbol && flag && (watchedSymbol.flags?.length || 0) > 1) {
        const index = watchedSymbol.flags?.indexOf(flag._id)
        if (index !== undefined && index >= 0) {
          watchedSymbol.flags?.splice(index, 1)
        } else {
          return 'ERROR'
        }
      } else {
        return 'ERROR'
      }

      await dashboard.save()

      return 'DONE'
    }

    return 'ERROR'
  }
})

dashboardGraphql.getFieldOTC('watchedSymbols').addRelation('flags', {
  type: dashboardGraphql.getFieldType('flags'),
  resolve: async (source: any, args: any, context: any, info: GraphQLResolveInfo) => {
    const { userId } = context.session
    const dashboard = await DashboardTsModel.findOne({ user: userId })

    if (dashboard) {
      const flagMap: Record<string, any> = {}

      dashboard.flags?.forEach((flagObj) => {
        flagMap[flagObj._id] = flagObj
      })

      const ret = (source.flags || []).map((flagId: string) => {
        if (flagMap[flagId]) return flagMap[flagId]
        return {
          name: '',
          _id: ''
        }
      })

      return ret
    }

    return {}
  }
})

// dashboardGraphql
//   .getFieldOTC('dashboard')
//   .getFieldOTC('watchedSymbols')
//   .addRelation('symbol', {
//     resolver: () => symbolGraphql.mongooseResolvers.findById(),
//     prepareArgs: {
//       _id: (source: any) => {
//         return source.symbol
//       }
//     },
//     projection: { dashboard: { watchedSymbols: 1 } }
//   })

export const dashboardResolvers = {
  query: {
    getDashboard: dashboardGraphql.getResolver('getDashboard')
  },
  mutation: {
    saveSymbolToDashboard: dashboardGraphql.getResolver('saveSymbolToDashboard'),
    changeSymbolFlag: dashboardGraphql.getResolver('changeSymbolFlag'),
    createFlag: dashboardGraphql.getResolver('createFlag'),
    removeSymbolFromDashboard: dashboardGraphql.getResolver('removeSymbolFromDashboard')
  }
}
