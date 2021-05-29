import React, { useCallback, useState } from 'react'
import { BinanceTrade, BinanceExchangeInformation } from '@sw/shared/src/graphql'

import { GET_BINANCE_EXCHANGE_INFORMATION, GET_BINANCE_TRADES } from '../../gqls'
import { apolloClient } from '../../api/apollo'

type Props = {
  asset: string
}

type State = {
  loading: boolean
  error: any
  data: Array<BinanceTrade>
}

type Query = {
  data: Array<BinanceTrade>
  error: any
}

const query = async (symbol: string): Promise<Query> =>
  new Promise((resolve) => {
    apolloClient
      .query({
        query: GET_BINANCE_TRADES,
        fetchPolicy: 'network-only',
        variables: {
          symbol
        }
      })
      .then(
        (response) => {
          return resolve({
            error: '',
            data: response.data.getBinanceTrades
          })
        },
        (error) => {
          return resolve({
            error,
            data: []
          })
        }
      )
  })

const exchangeInfoQuery = async (): Promise<{ data: Array<BinanceExchangeInformation>; error: any }> =>
  new Promise((resolve) => {
    apolloClient
      .query({
        query: GET_BINANCE_EXCHANGE_INFORMATION
      })
      .then(
        (response) => {
          return resolve({
            error: '',
            data: response.data.getBinanceExchangeInformation
          })
        },
        (error) => {
          return resolve({
            error,
            data: []
          })
        }
      )
  })

export const useGetTrades = ({ asset }: Props): [() => void, State] => {
  const [state, setState] = useState<State>({
    loading: false,
    error: undefined,
    data: []
  })

  const getTrades = async () => {
    setState({
      data: [],
      error: undefined,
      loading: true
    })

    const exInfo = await exchangeInfoQuery()

    if (exInfo.error) {
      console.log(exInfo)
      setState({
        data: [],
        loading: false,
        error: exInfo.error
      })
    } else {
      const promises: Array<Promise<Query>> = []
      const suffixes = ['BUSD', 'USDT']
      suffixes.forEach((quoteAsset) => {
        const symbol = `${asset}${quoteAsset}`.toUpperCase()

        if (exInfo.data.find((item) => item.symbol === symbol)) {
          promises.push(query(symbol))
        }
      })

      const responses = await Promise.all(promises)

      const failedAll = !!responses.find((response) => !!response.error)

      if (failedAll) {
        console.log(responses)

        setState({
          data: [],
          loading: false,
          error: responses[0].error
        })
      } else {
        let data: Array<BinanceTrade> = []
        responses.forEach((response) => {
          data = data.concat(response.data)
        })

        data.sort((a, b) => a.time - b.time)

        setState({
          data,
          loading: false,
          error: undefined
        })
      }
    }
  }

  return [getTrades, { ...state }]
}
