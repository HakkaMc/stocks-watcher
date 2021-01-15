import * as finnhub from 'finnhub'
import { GetQuote, RocIndicator, RocIndicatorDay } from '@sw/shared/src/graphql'

import { token } from '../constants'
import { SymbolTsType } from '../database/symbol/schema'

type CachedSymbols = {
  /**
   * Unix timestamp in milliseconds
   */
  timestamp: number
  symbols: Array<SymbolTsType>
}

const cachedSymbols: CachedSymbols = {
  timestamp: Date.now(),
  // timestamp: 0,
  symbols: []
}

const { api_key } = finnhub.ApiClient.instance.authentications
api_key.apiKey = token

const finnhubClient = new finnhub.DefaultApi()

const getCryptoSymbols = (): Promise<Array<SymbolTsType>> =>
  new Promise((resolve, reject) => {
    finnhubClient.cryptoSymbols('COINBASE', (error, data, response) => {
      if (error) {
        console.error(error)
        resolve([])
      } else {
        const ret = data || []

        ret.forEach((item: SymbolTsType) => {
          if (!item.type) {
            item.type = 'Crypto'
          }
        })

        resolve(ret)
      }
    })
  })

const getStockSymbols = (): Promise<Array<SymbolTsType>> =>
  new Promise((resolve, reject) => {
    finnhubClient.stockSymbols('US', (error, data, response) => {
      if (error) {
        console.error(error)
        resolve([])
      } else {
        resolve(data || [])
      }
    })
  })

export const getSymbols = () =>
  new Promise<Array<SymbolTsType>>(async (resolve, reject) => {
    const now = Date.now()

    if (cachedSymbols.timestamp + 60 * 60 * 1000 < now || !cachedSymbols.symbols.length) {
      // finnhubClient.stockSymbols('US', (error, data, response) => {
      //     if (error) {
      //         reject(error)
      //     } else {
      //         cachedSymbols.timestamp = Date.now()
      //         cachedSymbols.symbols = data
      //         resolve(data)
      //     }
      // })

      const stockSymbols = await getStockSymbols()
      const cryptoSymbols = await getCryptoSymbols()

      resolve([...stockSymbols, ...cryptoSymbols])
    } else {
      resolve(cachedSymbols.symbols)
    }
  })

// TODO - add caching
export const getRocIndicator = (
  symbol: string,
  fromTimestamp: number,
  toTimestamp: number
): Promise<RocIndicator | undefined> =>
  new Promise(async (resolve, reject) => {
    finnhubClient.technicalIndicator(symbol, 'D', fromTimestamp, toTimestamp, 'roc', {}, (error, data, response) => {
      if (error) {
        console.error(error)
        resolve(undefined)
      } else {
        const days: Array<RocIndicatorDay> = []
        let sum = 0

        data?.roc?.forEach((value: number, i: number) => {
          const date = new Date(data.t[i] * 1000)
          days.push({
            date: `${date.getDate()}.${date.getMonth() + 1}`,
            value
          })
          sum += value
        })

        resolve({
          days,
          sum
        })
      }
    })
  })

export const getQuote = (symbol: string): Promise<GetQuote | undefined> =>
  new Promise(async (resolve, reject) => {
    finnhubClient.quote(symbol, (error, data, response) => {
      if (error) {
        console.error(error)
        resolve(undefined)
      } else if (!data) {
        resolve(undefined)
      } else {
        resolve({
          currentPrice: data.c,
          highPrice: data.h,
          lowPrice: data.l,
          previousClose: data.pc,
          openPrice: data.o
        })
      }
    })
  })

export const getStockPrices = (symbol:string, fromTimestamp: number, toTimestamp: number): Promise<Array<{price: number, timestamp: number}>|undefined> => new Promise((resolve, reject)=>{

  // console.log(symbol, fromTimestamp, toTimestamp)

  finnhubClient.stockCandles(symbol, '1', fromTimestamp, toTimestamp,{}, (error, data, response)=>{
    if (error) {
      console.error(error)
      resolve(undefined)
    }else if (!data) {
      resolve(undefined)
    } else {
      const priceObjectArray: Array<{price: number, timestamp: number}> = []
      if(data.t && data.c) {
        const timestamps: Array<number> = data.t
        const prices: Array<number> = data.c

        for (let i = 0; i < timestamps.length; i++) {
          priceObjectArray.push({
            price: parseFloat(prices[i].toString()),
            timestamp: parseFloat(timestamps[i].toString())
          })
        }

        const sortedPrices = priceObjectArray.sort((a, b) => {
          if (a.timestamp < b.timestamp) return -1
          else if (a.timestamp > b.timestamp) return 1
          else return 0
        })

        resolve(sortedPrices)
      }
      else{
        resolve(undefined)
      }
    }
  })
})
