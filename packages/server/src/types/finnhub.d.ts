declare module 'finnhub' {
  type ApiClientType = {
    instance: {
      authentications: {
        [x: string]: any
      }
    }
  }

  type Range = '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M'

  type Callback = (error: any, data: any, response: any) => void

  export const ApiClient: ApiClientType

  export class DefaultApi {
    priceTarget: (symbol: string, callback: Callback) => void

    quote: (symbol: string, callback: Callback) => void

    stockSymbols: (exchange: string, callback: Callback) => void

    cryptoSymbols: (exchange: string, callback: Callback) => void

    technicalIndicator: (
      symbol: string,
      range: Range,
      from: number,
      to: number,
      indicator: string,
      options: Record<string, any>,
      callback: Callback
    ) => void

    stockCandles: (symbol: string, range: Range, from: number,
                   to: number,options: Record<string, any>,
                   callback: Callback) => void
  }
}
