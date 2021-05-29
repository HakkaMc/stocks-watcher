import { binanceSymbolGraphql } from './schema'

export const binanceSymbolResolvers = {
  query: {
    getBinanceSymbols: binanceSymbolGraphql.mongooseResolvers.findMany()
  }
}
