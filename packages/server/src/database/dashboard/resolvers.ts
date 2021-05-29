import { ResolverResolveParams } from 'graphql-compose'
import mongoose from 'mongoose'
import { dashboardGraphql, DashboardTsModel } from './schema'
import { UserTsModel } from '../user/schema'

const getDashboard = async (userId: string) => {
  const dashboard = await DashboardTsModel.findOne({ user: userId })
  if (!dashboard) {
    const newDashboard = new DashboardTsModel({
      user: mongoose.Types.ObjectId(userId),
      watchlists: [
        {
          name: 'Default'
        }
      ]
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
  }
  // TODO - remove
  const user = await UserTsModel.findOne({ name: 'admin' })
  await getDashboard(user?._id)
  return user?._id
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

    const watchlistExists = await DashboardTsModel.exists({
      user: userId,
      'watchlists.name': params.args.watchlist
    })

    if (!watchlistExists) {
      await DashboardTsModel.findOneAndUpdate(
        { user: userId },
        { $push: { watchlists: { name: params.args.watchlist, hidden: false } } }
      )

      return 'OK'
    }

    return new Error('Watchlist exists already.')
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
  resolve: async (params: ResolverResolveParams<any, any, { symbol: string; watchlist: string }>) => {
    const userId = await getUserId(params.context.session)

    const watchlistExists = await DashboardTsModel.exists({
      user: userId,
      'watchlists.name': params.args.watchlist
    })

    if (!watchlistExists) {
      await DashboardTsModel.findOneAndUpdate(
        { user: userId },
        { $push: { watchlists: { name: params.args.watchlist, hidden: false } } }
      )
    }

    const query: any = {
      user: userId,
      watchlists: {
        name: params.args.watchlist,
        symbols: params.args.symbol
      }
    }

    const symbolExists = await DashboardTsModel.exists(query)

    if (!symbolExists) {
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
      { user: userId, 'watchlists.name': { $regex: /.*/ } },
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

    if (params.args.add) {
      const watchlistExists = await DashboardTsModel.exists({ user: userId, 'watchlists.name': params.args.watchlist })

      if (!watchlistExists) {
        await DashboardTsModel.updateOne({ user: userId }, { $push: { watchlists: { name: params.args.watchlist } } })
      }

      const exists = await DashboardTsModel.exists({
        user: userId,
        'watchlists.name': params.args.watchlist,
        'watchlists.$.symbols': params.args.symbol
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

        return 'ADDED'
      }

      return 'NOTHING'
    }
    await DashboardTsModel.findOneAndUpdate(
      { user: userId, 'watchlists.name': params.args.watchlist },
      {
        $pull: {
          'watchlists.$.symbols': params.args.symbol
        }
      }
    )

    return 'REMOVED'

    return 'ERROR'
  }
})

dashboardGraphql.addResolver({
  kind: 'mutation',
  name: 'changeWatchlistSettings',
  args: {
    id: 'String!',
    hidden: 'Boolean',
    name: 'String'
  },
  type: 'String',
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const userId = await getUserId(params.context.session)

    const exists = await DashboardTsModel.exists({
      user: userId,
      'watchlists._id': mongoose.Types.ObjectId(params.args.id)
    })

    const attributesToChange: any = {
      hidden: params.args.hidden,
      name: params.args.name
    }

    if (typeof attributesToChange.hidden !== 'boolean') {
      delete attributesToChange.hidden
    }

    if (!attributesToChange.name || typeof attributesToChange.name !== 'string') {
      delete attributesToChange.name
    }

    if (exists && Object.keys(attributesToChange).length) {
      const fields: any = {}
      Object.entries(attributesToChange).forEach(([attribute, value]) => {
        fields[`watchlists.$.${attribute}`] = value
      })

      await DashboardTsModel.updateOne(
        { user: userId, 'watchlists._id': mongoose.Types.ObjectId(params.args.id) },
        { $set: fields }
      )

      return 'OK'
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
    changeWatchlistSettings: dashboardGraphql.getResolver('changeWatchlistSettings'),
    createWatchlist: dashboardGraphql.getResolver('createWatchlist'),
    removeSymbolFromDashboard: dashboardGraphql.getResolver('removeSymbolFromDashboard')
  }
}
