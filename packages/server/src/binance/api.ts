import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import crypto from 'crypto'
import querystring from 'querystring'

const baseUrl = 'https://api2.binance.com'
const apiKey = process.env.binanceApiKey as string
const apiSecret = process.env.binanceApiSecret as string

const queryStack: Array<{
  promiseCallbacks: {
    resolve: (response: AxiosResponse) => void
    reject: (response: AxiosError) => void
  }
  axiosConfig: AxiosRequestConfig
}> = []

const getSignature = (params: Record<string, any>, noTimestamp?: boolean) => {
  const enhancedParams: any = {
    ...params
  }

  if (!noTimestamp) {
    enhancedParams.timestamp = Date.now()
  }

  const signature = crypto.createHmac('sha256', apiSecret).update(querystring.stringify(enhancedParams)).digest('hex')

  return {
    params: enhancedParams,
    signature
  }
}

export const binanceQuery = (config: AxiosRequestConfig, secured?: boolean): Promise<AxiosResponse> => {
  const enhancedConfig = { ...config }

  enhancedConfig.url = `${baseUrl}${enhancedConfig.url}`

  if (!enhancedConfig.params) {
    enhancedConfig.params = {}
  }

  if (secured) {
    const { params, signature } = getSignature(enhancedConfig.params)
    enhancedConfig.params = {
      ...params,
      signature
    }
  }

  if (!enhancedConfig.headers) {
    enhancedConfig.headers = {}
  }

  enhancedConfig.headers['X-MBX-APIKEY'] = apiKey

  return new Promise((resolve, reject) => {
    queryStack.push({
      promiseCallbacks: {
        resolve,
        reject
      },
      axiosConfig: enhancedConfig
    })
  })
}

setInterval(() => {
  const query = queryStack.shift()
  if (query) {
    axios(query.axiosConfig).then(query.promiseCallbacks.resolve, query.promiseCallbacks.reject)
  }
}, 100)
