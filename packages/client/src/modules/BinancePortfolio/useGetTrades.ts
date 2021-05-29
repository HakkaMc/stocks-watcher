import React, { useState } from 'react'

import { GET_BINANCE_SYMBOLS, GET_BINANCE_TRADES } from '../../gqls'
import { apolloClient } from '../../api/apollo'
import { BinanceSymbols_getBinanceSymbols } from '../../types/graphql/generated/BinanceSymbols'
import { BinanceTrades_getBinanceTrades } from '../../types/graphql/generated/BinanceTrades'

type Props = {
  asset: string
}

type State = {
  loading: boolean
  error: any
  data: Array<BinanceTrades_getBinanceTrades>
}

type Query = {
  data: Array<BinanceTrades_getBinanceTrades>
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

const exchangeInfoQuery = async (): Promise<{ data: Array<BinanceSymbols_getBinanceSymbols>; error: any }> =>
  new Promise((resolve) => {
    apolloClient
      .query({
        query: GET_BINANCE_SYMBOLS
      })
      .then(
        (response) => {
          return resolve({
            error: '',
            data: response.data.getBinanceSymbols
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
        let data: Array<BinanceTrades_getBinanceTrades> = []
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
