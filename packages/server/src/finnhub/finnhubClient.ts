import * as finnhub from 'finnhub'
import { GetQuote, DailyChangeIndicator, DailyChangeIndicatorDay } from '@sw/shared/src/graphql'

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
export const getDailyChangeIndicator = (
  symbol: string,
  fromTimestamp: number,
  toTimestamp: number
): Promise<DailyChangeIndicator | undefined> =>
  new Promise(async (resolve, reject) => {
    finnhubClient.stockCandles(symbol, 'D', fromTimestamp, toTimestamp, {}, (error, data, response) => {
      if (error) {
        console.error(error)
        resolve(undefined)
      } else if (!data) {
        resolve(undefined)
      } else {
        const days: Array<DailyChangeIndicatorDay> = []
        let wholePercentage = 0
        let firstPreviousClose = 0
        let lastClose = 0

        if (data.t && data.c) {
          firstPreviousClose = data.c[0]

          for (let i = 1; i < data.t.length; i++) {
            const date = new Date(data.t[i] * 1000)
            const previousClose = data.c[i - 1]
            const actualClose = data.c[i]
            // console.log(previousClose, actualClose, data.o[i], data.h[i], data.l[i])
            const percentage = (100 / previousClose) * actualClose - 100

            days.push({
              date: `${date.getDate()}.${date.getMonth() + 1}`,
              value: percentage
            })

            lastClose = actualClose
          }

          wholePercentage = (100 / firstPreviousClose) * lastClose - 100
        }

        resolve({
          days,
          sum: wholePercentage
        })
      }

      // finnhubClient.technicalIndicator(symbol, 'D', fromTimestamp, toTimestamp, 'roc', {}, (error, data, response) => {
      //   if (error) {
      //     console.error(error)
      //     resolve(undefined)
      //   } else {
      //     const days: Array<RocIndicatorDay> = []
      //     let sum = 0
      //
      //     data?.roc?.forEach((value: number, i: number) => {
      //       const date = new Date(data.t[i] * 1000)
      //       days.push({
      //         date: `${date.getDate()}.${date.getMonth() + 1}`,
      //         value
      //       })
      //       sum += value
      //     })
      //
      //     resolve({
      //       days,
      //       sum
      //     })
      //   }
      // })
    })
  })

export const getQuote = (symbol: string): Promise<GetQuote | undefined> =>
  new Promise(async (resolve, reject) => {
    let tryCounter = 0

    const fnc = () => {
      finnhubClient.quote(symbol, (error, data, response) => {
        tryCounter += 1

        if (error) {
          if(error.status === 429 && tryCounter < 20){
            setTimeout(fnc, 5000)
          }
          else {
            console.error(error)
            resolve(undefined)
          }
        } else if (!data) {
          resolve(undefined)
        } else {
          console.log('getQuote: ', symbol, data)

          resolve({
            currentPrice: data.c,
            highPrice: data.h,
            lowPrice: data.l,
            previousClose: data.pc,
            openPrice: data.o
          })
        }
      })
    }

    fnc()
  })

export const getStockPrices = (
  symbol: string,
  timestampFrom: number, // seconds
  timestampTo: number, // seconds
  range: FinnhubRange
): Promise<Array<{ price: number; timestamp: number }> | undefined> =>
  new Promise((resolve, reject) => {
    let tryCounter = 0

    let tForm = parseInt(timestampFrom.toString())
    let tTo = parseInt(timestampTo.toString())

    if (tForm.toString().length === 13) {
      tForm = parseInt((tForm / 1000).toFixed(0))
      tTo = parseInt((tTo / 1000).toFixed(0))
    }

    // console.log('getStockPrices: ', symbol, new Date(tForm*1000), new Date(tTo*1000))
    const fnc = () => {
      finnhubClient.stockCandles(symbol, range || 5, tForm, tTo, {}, (error, data, response) => {
        tryCounter += 1

        if (error) {
          if(error.status === 429 && tryCounter < 20){
            setTimeout(fnc, 5000)
          }
          else {
            console.error(error)
            resolve(undefined)
          }
        } else if (!data) {
          resolve(undefined)
        } else {
          const priceObjectArray: Array<{ price: number; timestamp: number }> = []
          if (data.t && data.c) {
            const timestamps: Array<number> = data.t
            const prices: Array<number> = data.c

            for (let i = 0; i < timestamps.length; i++) {
              // console.log(new Date(parseFloat(timestamps[i].toString())*1000))
              priceObjectArray.push({
                price: parseFloat(prices[i].toString()),
                timestamp: parseFloat(timestamps[i].toString()) * 1000
              })
            }

            const sortedPrices = priceObjectArray.sort((a, b) => {
              if (a.timestamp < b.timestamp) return -1
              if (a.timestamp > b.timestamp) return 1
              return 0
            })

            resolve(sortedPrices)
          } else {
            resolve(undefined)
          }
        }
      })
    }

    fnc()
  })
