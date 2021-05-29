import React, { useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useQuery } from '@apollo/client'
import { BinanceBalance, BinanceExchangeInformation } from '@sw/shared/src/graphql'

import { Autocomplete } from '../../../../form'
import { GET_BINANCE_SYMBOLS } from '../../../../gqls'
import {
  BinanceSymbols,
  BinanceSymbols_getBinanceSymbols,
  BinanceSymbolsVariables
} from '../../../../types/graphql/generated/BinanceSymbols'

type Props = {
  balances: Array<BinanceBalance>
  form: UseFormReturn<any>
  onChange?: (symbol: string) => void
}

export const SymbolList = ({ balances, form, onChange = (value: string) => undefined }: Props) => {
  const binanceSymbols = useQuery<BinanceSymbols, BinanceSymbolsVariables>(GET_BINANCE_SYMBOLS, {
    notifyOnNetworkStatusChange: true,
    variables: {
      quoteAsset: 'BUSD'
    }
  })

  const exchangeMap = useMemo(() => {
    const map: Record<string, BinanceSymbols_getBinanceSymbols> = {}
    const symbolArray = binanceSymbols?.data?.getBinanceSymbols

    if (Array.isArray(symbolArray)) {
      symbolArray.forEach((symbolObj) => {
        map[symbolObj.symbol] = symbolObj
      })
    }

    return map
  }, [binanceSymbols?.data?.getBinanceSymbols])

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
