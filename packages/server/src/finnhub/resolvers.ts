import { schemaComposer } from 'graphql-compose'
import { pubSub } from '../pubSub'
import { lastPriceSubscribe } from './finnhubSocket'
import { getRocIndicator, getQuote } from './finnhubClient'

const LastPriceType = schemaComposer.createObjectTC({
  name: 'LastPrice',
  fields: {
    symbol: 'String!',
    price: 'Float!',
    timestamp: 'Float!',
    volume: 'Float!'
  }
})

const RocIndicator = schemaComposer.createObjectTC({
  name: 'RocIndicator',
  fields: {
    sum: 'Float!',
    days: [
      `type RocIndicatorDay {        
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

export const finnhubResolvers = {
  query: {
    getRocIndicator: {
      kind: 'query',
      name: 'getRocIndicator',
      type: RocIndicator,
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

        const data = await getRocIndicator(symbol, from.getTime() / 1000, to.getTime() / 1000)
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
      subscribe: async (parent: any, { symbol }: { symbol: string }) => {
        lastPriceSubscribe(symbol)
        return pubSub.asyncIterator([`LAST_PRICE_${symbol}`])
      }
    }
  }
}
