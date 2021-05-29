import React, { useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useQuery } from '@apollo/client'
import { BinanceBalance, BinanceExchangeInformation } from '@sw/shared/src/graphql'

import { Autocomplete } from '../../../../form'
import { GET_BINANCE_EXCHANGE_INFORMATION } from '../../../../gqls'

type Props = {
  balances: Array<BinanceBalance>
  form: UseFormReturn<any>
  onChange?: (symbol: string) => void
}

export const SymbolList = ({ balances, form, onChange = (value: string) => undefined }: Props) => {
  const exchangeInformationResponse = useQuery<{ getBinanceExchangeInformation: BinanceExchangeInformation }>(
    GET_BINANCE_EXCHANGE_INFORMATION,
    {
      notifyOnNetworkStatusChange: true
    }
  )

  const exchangeMap = useMemo(() => {
    const map: Record<string, BinanceExchangeInformation> = {}
    const exchangeArray = exchangeInformationResponse?.data?.getBinanceExchangeInformation

    if (Array.isArray(exchangeArray)) {
      exchangeArray.forEach((item) => {
        map[item.symbol] = item
      })
    }

    return map
  }, [exchangeInformationResponse?.data?.getBinanceExchangeInformation])

  const symbolList = useMemo(() => {
    if (Array.isArray(balances) && Object.keys(exchangeMap).length) {
      return balances
        .filter((balance) => !!exchangeMap[`${balance.asset}BUSD`])
        .sort((a, b) => a.asset.localeCompare(b.asset))
        .map((balance) => ({
          text: `${balance.asset}BUSD`,
          value: `${balance.asset}BUSD`
        }))
    }

    return []
  }, [balances, exchangeMap])

  return <Autocomplete name="symbol" form={form} list={symbolList} onChange={onChange} />
}
