import { ResolverResolveParams } from 'graphql-compose'
import mongoose from 'mongoose'
import { dashboardGraphql, DashboardTsModel } from './schema'
import { UserTsModel } from '../user/schema'

const getDashboard = async (userId: string) => {
  const dashboard = await DashboardTsModel.findOne({ user: userId })
  if (!dashboard) {
    const newDashboard = new DashboardTsModel({
      user: mongoose.Types.ObjectId(userId),
      watchlists: [{
        name: 'Default'
      }]
    })

    await newDashboard.save()

    return newDashboard
  }

  return dashboard
}

const getUserId = async (session: any) => {
  const { userId } = session

  if (userId) {
    await getDashboard(userId)
    return userId
  } else {
    // TODO - remove
    const user = await UserTsModel.findOne({ name: 'admin' })
    await getDashboard(user?._id)
    return user?._id
  }
}

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
  name: 'createWatchlist',
  args: {
    watchlist: 'String!'
  },
  type: 'String',
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const userId = await getUserId(params.context.session)

    const dashboard = await getDashboard(userId)

    if (!dashboard?.watchlists?.some((wl) => wl.name === params.args.watchlist)) {
      await DashboardTsModel.findOneAndUpdate(
        { user: userId },
        { $push: { watchlists: { name: params.args.watchlist } } }
      )

      return 'OK'
    }

    return 'ERROR'
  }
})

dashboardGraphql.addResolver({
  kind: 'mutation',
  name: 'saveSymbolToDashboard',
  args: {
    symbol: 'String!',
    watchlist: 'String!'
  },
  type: 'String',
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const userId = await getUserId(params.context.session)

    const exists = await DashboardTsModel.exists({
      user: userId,
      watchlists: {
        name: params.args.watchlist,
        symbols: params.args.symbol
      }
    })

    if (!exists) {
      await DashboardTsModel.findOneAndUpdate(
        { user: userId, 'watchlists.name': params.args.watchlist },
        {
          $push: {
            'watchlists.$.symbols': params.args.symbol
          }
        }
      )

      return 'OK'
    }

    return 'ERROR'
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
    const userId = await getUserId(params.context.session)

    await DashboardTsModel.updateOne(
      { user: userId, 'watchlists.name': {$regex: /.*/} },
      { $pull: { 'watchlists.$.symbols': params.args.symbol } }
    )

    return 'OK'
  }
})

dashboardGraphql.addResolver({
  kind: 'mutation',
  name: 'changeSymbolWatchlist',
  args: {
    symbol: 'String!',
    watchlist: 'String',
    add: 'Boolean!'
  },
  type: 'String',
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const userId = await getUserId(params.context.session)

    if(params.args.add){
      const watchlistExists = await DashboardTsModel.exists({user: userId, 'watchlists.name': params.args.watchlist})

      if(!watchlistExists){
        await DashboardTsModel.updateOne({user: userId}, {$push: {watchlists: {name: params.args.watchlist}}})
      }

      const exists = await DashboardTsModel.exists({
        user: userId,
        'watchlists.name': params.args.watchlist,
        'watchlists.$.symbols': params.args.symbol
      })

      if(!exists){
        await DashboardTsModel.findOneAndUpdate({ user: userId, 'watchlists.name': params.args.watchlist}, {
          $push: {
            'watchlists.$.symbols': params.args.symbol
          }
        })

        return 'ADDED'
      }

      return 'NOTHING'
    }
    else{
      await DashboardTsModel.findOneAndUpdate({ user: userId, 'watchlists.name': params.args.watchlist}, {
        $pull: {
          'watchlists.$.symbols': params.args.symbol
        }
      })

      return 'REMOVED'
    }

    return 'ERROR'
  }
})

export const dashboardResolvers = {
  query: {
    getDashboard: dashboardGraphql.getResolver('getDashboard')
  },
  mutation: {
    saveSymbolToDashboard: dashboardGraphql.getResolver('saveSymbolToDashboard'),
    changeSymbolWatchlist: dashboardGraphql.getResolver('changeSymbolWatchlist'),
    createWatchlist: dashboardGraphql.getResolver('createWatchlist'),
    removeSymbolFromDashboard: dashboardGraphql.getResolver('removeSymbolFromDashboard')
  }
}
