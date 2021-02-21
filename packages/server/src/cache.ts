import { getQuote } from './finnhub/finnhubClient'

const lastPriceCache: Record<string, { timstamp: number; price: number }> = {}

export const setLastPrice = (symbol: string, price: number, timestamp: number) => {
  lastPriceCache[symbol] = {
    price,
    timstamp: timestamp.toString().length === 13 ? timestamp : timestamp * 1000
  }
}

export const getLastPrice = async (symbol: string, force?: boolean): Promise<number | undefined> => {
  const now = Date.now()
  const priceObj = lastPriceCache[symbol]

  if (!force && priceObj && now - priceObj.timstamp < 3 * 60 * 1000) {
    return priceObj.price
  }

  const symbolData = await getQuote(symbol)
  if (symbolData) {
    return symbolData.currentPrice
  }

  return undefined
}
