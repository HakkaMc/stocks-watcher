import { ResolverResolveParams } from 'graphql-compose'

import {priceAlertGraphql, PriceAlertTsModel} from "./schema";
import {getLastPrice} from "../../cache";

priceAlertGraphql.addResolver({
    kind: 'query',
    name: 'getPriceAlerts',
    type: [priceAlertGraphql],
    args: {
        symbol: 'String!',
    },
    resolve: async (params: ResolverResolveParams<any, any, any>) => {
        const { userId } = params.context.session

        const priceAlerts = await PriceAlertTsModel.find({ user: userId, symbol: params.args.symbol })

        return priceAlerts || []
    }
})

priceAlertGraphql.addResolver({
    kind: 'mutation',
    name: 'setPriceAlert',
    args: {
        symbol: 'String!',
        targetPrice: 'Float!',
    },
    type: 'String',
    resolve: async (params: ResolverResolveParams<any, any, any>) => {
        const { userId } = params.context.session

        const actualPrice = await getLastPrice(params.args.symbol, true)

        await new PriceAlertTsModel({
            user: userId,
            symbol: params.args.symbol,
            targetPrice: params.args.targetPrice,
            actualPrice
        }).save()

        return 'OK'
    }
})

priceAlertGraphql.addResolver({
    kind: 'mutation',
    name: 'removePriceAlert',
    args: {
        id: 'String!'
    },
    type: 'String',
    resolve: async (params: ResolverResolveParams<any, any, any>) => {
        const { userId } = params.context.session

        await PriceAlertTsModel.deleteOne({user: userId, _id: params.args.id})

        return 'OK'
    }
})

export const priceAlertResolvers = {
    query: {
        getPriceAlerts: priceAlertGraphql.getResolver('getPriceAlerts')
    },
    mutation: {
        setPriceAlert: priceAlertGraphql.getResolver('setPriceAlert'),
        removePriceAlert: priceAlertGraphql.getResolver('removePriceAlert')
    }
}
