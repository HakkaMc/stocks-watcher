import { schemaComposer } from 'graphql-compose'
import { pubSub } from '../pubSub'
import { lastPriceSubscribe } from './finnhubSocket'
import { getDailyChangeIndicator, getQuote, getStockPrices } from './finnhubClient'
import { SymbolTsModel } from '../database/symbol/schema'

const LastPriceType = schemaComposer.createObjectTC({
  name: 'LastPrice',
  fields: {
    symbol: 'String!',
    price: 'Float!',
    timestamp: 'Float!',
    volume: 'Float!'
  }
})

const DailyChangeIndicator = schemaComposer.createObjectTC({
  name: 'DailyChangeIndicator',
  fields: {
    sum: 'Float!',
    days: [
      `type DailyChangeIndicatorDay {        
            date: String!,
            value: Float!,
        }`
    ]
  }
})

const GetQuote = schemaComposer.createObjectTC({
  name: 'GetQuote',
  fields: {
    openPrice: 'Float!',
    highPrice: 'Float!',
    lowPrice: 'Float!',
    currentPrice: 'Float!',
    previousClose: 'Float!'
  }
})

const GetPricesType = schemaComposer.createObjectTC({
  name: 'GetPrices',
  fields: {
    priceArray: [
      `type PriceTimestampArray {
      price: Float!,
      timestamp: Float!
    }`
    ]
  }
})

export const finnhubResolvers = {
  query: {
    getDailyChangeIndicator: {
      kind: 'query',
      name: 'getDailyChangeIndicator',
      type: DailyChangeIndicator,
      args: {
        symbol: 'String'
      },
      resolve: async (parent: any, { symbol }: { symbol: string }) => {
        const to = new Date()
        to.setHours(0)
        to.setMinutes(0)
        to.setSeconds(0)
        to.setMilliseconds(0)
        const from = new Date(to)
        from.setDate(from.getDate() - 32)

        const data = await getDailyChangeIndicator(symbol, from.getTime() / 1000, to.getTime() / 1000)
        return data
      }
    },
    getQuote: {
      kind: 'query',
      name: 'getQuote',
      type: GetQuote,
      args: {
        symbol: 'String'
      },
      resolve: async (parent: any, { symbol }: { symbol: string }) => {
        const data = await getQuote(symbol)
        return data
      }
    },
    getPrices: {
      kind: 'query',
      name: 'getPrices',
      type: GetPricesType,
      args: {
        symbol: 'String!',
        timestampFrom: 'Float',
        timestampTo: 'Float',
        range: 'String'
      },
      resolve: async (
        parent: any,
        {
          symbol,
          timestampFrom,
          timestampTo,
          range
        }: { symbol: string; timestampFrom?: number; timestampTo?: number; range: FinnhubRange }
      ) => {
        const symbolObj = await SymbolTsModel.findOne({ symbol })
        if (symbolObj) {
          let tFrom = timestampFrom || Number.NaN
          let tTo = timestampTo || Number.NaN

          if (!tFrom || !tTo) {
            const tmpTto = new Date()
            tmpTto.setDate(tmpTto.getDate() + 1)
            tmpTto.setHours(0)
            tmpTto.setMinutes(0)
            tmpTto.setSeconds(0)

            const tmpTFrom = new Date(tmpTto)
            tmpTFrom.setDate(tmpTto.getDate() - 1)

            tFrom = tmpTFrom.getTime()
            tTo = tmpTto.getTime()
          }

          const priceArray = await getStockPrices(symbol, tFrom, tTo, range || '5')

          return {
            priceArray
          }
        }
      }
    }
  },
  subscription: {
    lastPrice: {
      kind: 'subscription',
      name: 'lastPrice',
      type: LastPriceType,
      args: {
        symbol: 'String'
      },
      resolve: (data: any) => data,
      subscribe: async (parent: any, { symbol }: { symbol: string }, context: any) => {
        const { userId } = context.session
        lastPriceSubscribe(symbol, userId)
        return pubSub.asyncIterator([`LAST_PRICE_${symbol}`])
      }
    }
  }
}
