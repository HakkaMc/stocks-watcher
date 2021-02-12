import { ResolverResolveParams } from 'graphql-compose'
import { chartGroupGraphql, ChartGroupTsModel } from './schema'
import { userGraphql, UserTsModel } from '../user/schema'

chartGroupGraphql.addResolver({
  kind: 'query',
  name: 'getChartGroups',
  type: [chartGroupGraphql],
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session
    const chartGroups = await ChartGroupTsModel.find({ user: userId })
    return chartGroups
  }
})

chartGroupGraphql.addResolver({
  kind: 'query',
  name: 'getChartGroup',
  type: chartGroupGraphql,
  args: {
    chartGroupId: 'String!'
  },
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session
    const chartGroup = await ChartGroupTsModel.findOne({ user: userId, _id: params.args.chartGroupId })
    return chartGroup
  }
})

chartGroupGraphql.addResolver({
  kind: 'mutation',
  name: 'removeChartGroup',
  type: 'String!',
  args: {
    chartGroupId: 'String!'
  },
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session
    await ChartGroupTsModel.findOneAndRemove({ user: userId, _id: params.args.chartGroupId })

    return 'OK'
  }
})

chartGroupGraphql.addResolver({
  kind: 'mutation',
  name: 'createChartGroup',
  type: chartGroupGraphql,
  args: {
    name: 'String!'
  },
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session
    const existingChartGroup = await ChartGroupTsModel.findOne({ user: userId, _id: params.args.chartGroupId })

    if (!existingChartGroup) {
      const chartGroup = new ChartGroupTsModel({
        user: userId,
        name: params.args.name,
        layout: 'vertical',
        range: '1'
      })

      await chartGroup.save()

      return chartGroup

      // chartGroup?.charts?.push({
      //     symbol: params.args.symbol,
      //     order: params.args.order || 0,
      //     range: params.args.range || '1'
      // })
    }

    return existingChartGroup
  }
})

chartGroupGraphql.addResolver({
  kind: 'mutation',
  name: 'addChartToChartGroup',
  type: 'String!',
  args: {
    chartGroupId: 'String!',
    symbol: 'String!',
    order: 'Int!',
    range: 'String!'
  },
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session
    const chartGroup = await ChartGroupTsModel.findOne({ user: userId, _id: params.args.chartGroupId })

    if (chartGroup && !chartGroup?.charts?.some((chart) => chart?.symbol === params.args.symbol)) {
      chartGroup.charts?.push({
        symbol: params.args.symbol,
        order: params.args.order || 0,
        range: params.args.range || '1'
      })

      await chartGroup.save()

      return 'OK'
    }

    return 'EXISTS_ALREADY'
  }
})

chartGroupGraphql.addResolver({
  kind: 'mutation',
  name: 'removeChartFromChartGroup',
  type: 'String!',
  args: {
    chartGroupId: 'String!',
    symbol: 'String!'
  },
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session

    await ChartGroupTsModel.updateOne(
      { user: userId, _id: params.args.chartGroupId },
      { $pull: { charts: { symbol: params.args.symbol } } },
      { multi: false }
    )

    return 'OK'
  }
})

export const chartGroupResolvers = {
  query: {
    getChartGroups: chartGroupGraphql.getResolver('getChartGroups'),
    getChartGroup: chartGroupGraphql.getResolver('getChartGroup')
  },
  mutation: {
    createChartGroup: chartGroupGraphql.getResolver('createChartGroup'),
    addChartToChartGroup: chartGroupGraphql.getResolver('addChartToChartGroup'),
    removeChartFromChartGroup: chartGroupGraphql.getResolver('removeChartFromChartGroup'),
    removeChartGroup: chartGroupGraphql.getResolver('removeChartGroup')
  }
}
