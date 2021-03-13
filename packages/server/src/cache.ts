import { getQuote } from './finnhub/finnhubClient'

const lastPriceCache: Record<string, { timestamp: number; price: number }> = {}

export const setLastPrice = (symbol: string, price: number, timestamp: number) => {
  lastPriceCache[symbol] = {
    price,
    timestamp: timestamp.toString().length === 13 ? timestamp : timestamp * 1000
  }
}

export const getLastPrice = async (symbol: string, force?: boolean): Promise<number | undefined> => {
  const now = Date.now()
  const priceObj = lastPriceCache[symbol]

  if (!force && priceObj && now - priceObj.timestamp < 3 * 60 * 1000) {
    console.log('Return cached value: ', priceObj.timestamp)
    return priceObj.price
  }

  const symbolData = await getQuote(symbol)
  if (symbolData) {
    setLastPrice(symbol, symbolData.currentPrice, Date.now())
    console.log('Return new value', symbolData.currentPrice)
    return symbolData.currentPrice
  }

  return undefined
}
