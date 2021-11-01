import React, { useEffect, useMemo } from "react";
import { UseFormReturn } from 'react-hook-form'
import { useQuery } from '@apollo/client'
import { BinanceBalance } from '@sw/shared/src/graphql'
import {Box} from '@material-ui/core'

import { Autocomplete, Select } from '../../../../form'
import { GET_BINANCE_SYMBOLS } from '../../../../gqls'
import {
  BinanceSymbols,
  BinanceSymbols_getBinanceSymbols,
  BinanceSymbolsVariables
} from '../../../../types/graphql/generated/BinanceSymbols'

import styles from './styles.module.scss'

type Props = {
  balances: Array<BinanceBalance>
  form: UseFormReturn<any>
  setSymbol: (symbol: string) => void
}

export const SymbolList = ({ balances, form, setSymbol }: Props) => {
  const baseAsset = form.watch('baseAsset')
  const quoteAsset = form.watch('quoteAsset')

  const binanceSymbols = useQuery<BinanceSymbols, BinanceSymbolsVariables>(GET_BINANCE_SYMBOLS, {
    notifyOnNetworkStatusChange: true,
    // variables: {
    //   quoteAsset
    // }
  })

  useEffect(() => {
    if (baseAsset && quoteAsset) {
      setSymbol(`${baseAsset}${quoteAsset}`)
    }
  }, [setSymbol, baseAsset, quoteAsset])

  const symbolsMap = useMemo(() => {
    const map: {
      symbols: Record<string, BinanceSymbols_getBinanceSymbols>,
      quoteAssets: Record<string, Record<string, BinanceSymbols_getBinanceSymbols>>,
      baseAssets: Record<string, Record<string, BinanceSymbols_getBinanceSymbols>>,
    } = {
      symbols: {},
      quoteAssets: {},
      baseAssets: {}
    }
    const symbolArray = binanceSymbols?.data?.getBinanceSymbols

    if (Array.isArray(symbolArray)) {
      symbolArray.forEach((symbolObj) => {
        map.symbols[symbolObj.symbol] = symbolObj

        if(!map.baseAssets[symbolObj.baseAsset]){
          map.baseAssets[symbolObj.baseAsset] = {}
        }
        map.baseAssets[symbolObj.baseAsset][symbolObj.quoteAsset] = symbolObj

        if(!map.quoteAssets[symbolObj.quoteAsset]){
          map.quoteAssets[symbolObj.quoteAsset] = {}
        }
        map.quoteAssets[symbolObj.quoteAsset][symbolObj.baseAsset] = symbolObj
      })
    }

    return map
  }, [binanceSymbols?.data?.getBinanceSymbols])

  const baseAssetList = useMemo(() => {
    if (Array.isArray(balances) && Object.keys(symbolsMap.symbols).length) {
      return balances
        .filter((balance) => !!symbolsMap.baseAssets[balance.asset])
        .sort((a, b) => a.asset.localeCompare(b.asset))
        .map((balance) => ({
          text: balance.asset,
          value: balance.asset
        }))
    }

    return []
  }, [balances, symbolsMap])

  const quoteAssetList = useMemo(()=>{
    if(baseAsset) {
      return Object.keys(symbolsMap.baseAssets).filter(ba=>['BUSD', 'USDT', 'USDC'].includes(ba)).map(item => ({ text: item, value: item }))
    }

    return []
  }, [baseAsset, symbolsMap])

  return <Box className={styles.flex}>
    <Autocomplete name="baseAsset" form={form} list={baseAssetList}/>
    <Select name="quoteAsset" form={form} list={quoteAssetList}/>
  </Box>
}
