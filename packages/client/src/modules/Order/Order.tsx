import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Typography } from '@material-ui/core'
import { useQuery, useSubscription } from '@apollo/client'
import set from 'lodash/set'

import { ErrorModal, ModalTemplate } from '../../components'
import { Info } from './modules/Info/Info'

import { BINANCE_LAST_PRICE_SUBSCRIPTION, GET_BINANCE_ACCOUNT_INFORMATION, GET_BINANCE_SYMBOLS } from '../../gqls'

import {
  BinanceLastPriceSubscription,
  BinanceLastPriceSubscriptionVariables
} from '../../types/graphql/generated/BinanceLastPriceSubscription'
import { BinanceAccountInformation } from '../../types/graphql/generated/BinanceAccountInformation'
import { BinanceFixedTrailingStop } from './modules/BinanceFixedTrailingStop/BinanceFixedTrailingStop'
import { BinanceMovingBuy } from './modules/BinanceMovingBuy/BinanceMovingBuy'
import { BinanceDirectBuy } from './modules/BinanceDirectBuy/BinanceDirectBuy'
import { BinanceDirectSell } from './modules/BinanceDirectSell/BinanceDirectSell'
import { OrderDialogType } from '../../constants'
import { BinanceMovingTrailingStop } from './modules/BinanceMovingTrailingStop/BinanceMovingTrailingStop'
import { dispatchers } from '../../redux'
import { useModalLoader } from '../../hooks'
import { BinanceConsolidation } from './modules/BinanceConsolidation/BinanceConsolidation'

import styles from './styles.module.scss'
import { BinanceSymbols, BinanceSymbolsVariables } from '../../types/graphql/generated/BinanceSymbols'
import { AssetAmount, Dollars } from './types'
import { TradingViewWidget } from "./modules/TradingViewWidget/TradingViewWidget";

type Props = {
  id: string
  symbol?: string
  orderDialogType?: OrderDialogType
}

export const Order = ({ id: modalId, symbol = '', orderDialogType = OrderDialogType.BinanceDirectBuy }: Props) => {
  const [symbolObj, setSymbolObj] = useState<{ baseAsset: string; quoteAsset: string; symbol: string, baseAssetPrecision: number }>({
    baseAsset: '',
    quoteAsset: '',
    symbol: '',
    baseAssetPrecision: 8
  })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()

  const { showLoader, hideLoader } = useModalLoader()

  const binanceSymbols = useQuery<BinanceSymbols, BinanceSymbolsVariables>(GET_BINANCE_SYMBOLS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
    // variables: {
    //   quoteAsset
    // }
  })

  const accountInformationResponse = useQuery<BinanceAccountInformation>(GET_BINANCE_ACCOUNT_INFORMATION, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  })

  const lastPriceResponse = useSubscription<BinanceLastPriceSubscription, BinanceLastPriceSubscriptionVariables>(
    BINANCE_LAST_PRICE_SUBSCRIPTION,
    {
      variables: {
        symbol: symbolObj.symbol
      }
    }
  )

  useEffect(() => {
    return hideLoader
  })

  useEffect(() => {
    if (loading) {
      setFormSubmitted(true)
      showLoader()
    } else if (formSubmitted) {
      hideLoader()

      if (!error) {
        dispatchers.modal.close(modalId)
      }
    }
  }, [loading, formSubmitted])

  useEffect(() => {
    window.console.log('Order mount: ', symbol)

    if (binanceSymbols?.data?.getBinanceSymbols && symbol) {
      const symbolInfo = binanceSymbols?.data?.getBinanceSymbols.find(
        (symbObj) => symbObj.symbol === symbol.toUpperCase()
      )

      if (symbolInfo) {
        setSymbolObj({
          baseAsset: symbolInfo.baseAsset,
          baseAssetPrecision: symbolInfo.baseAssetPrecision,
          quoteAsset: symbolInfo.quoteAsset,
          symbol: symbolInfo.symbol
        })
      }
    }
  }, [binanceSymbols, symbol])

  const setSymbolWrapper = useCallback(
    (symb: string) => {
      window.console.log('setSymbolWrapper: ', symb)

      const symbolInfo = binanceSymbols?.data?.getBinanceSymbols.find((symbObj) => symbObj.symbol === symb.toUpperCase())

      if (symbolInfo) {
        setSymbolObj({
          baseAsset: symbolInfo.baseAsset,
          baseAssetPrecision: symbolInfo.baseAssetPrecision,
          quoteAsset: symbolInfo.quoteAsset,
          symbol: symbolInfo.symbol
        })
      }
    },
    [binanceSymbols, setSymbolObj]
  )



  const balances = useMemo(() => {
    const blcs = accountInformationResponse?.data?.getBinanceAccountInformation?.balances

    if (Array.isArray(blcs)) {
      return blcs
    }

    return []
  }, [accountInformationResponse?.data?.getBinanceAccountInformation?.balances])

  const showForm = useMemo(()=>{
    if (binanceSymbols?.data?.getBinanceSymbols && (symbolObj.symbol || balances.length)){
      return true
    }

    return false
  }, [binanceSymbols, accountInformationResponse, balances, symbolObj])

  const dollars = useMemo((): Dollars => {
    const ret: Dollars = {
      BUSD: {
        free: 0,
        locked: 0
      },
      USDT: {
        free: 0,
        locked: 0
      },
      USDC: {
        free: 0,
        locked: 0
      }
    }

    balances.forEach((balance) => {
      if (['BUSD', 'USDT', 'USDC'].includes(balance.asset)) {
        set(ret, balance.asset, {
          free: balance.free,
          locked: balance.locked
        })
      }
    })

    return ret
  }, [balances])

  const assetAmount = useMemo((): AssetAmount => {
    const ret = {
      free: 0,
      locked: 0
    }

    if (symbolObj.baseAsset) {
      const result = balances.find((balance) => balance.asset === symbolObj.baseAsset)

      if (result) {
        ret.free = result.free
        ret.locked = result.locked
      }
    }

    return ret
  }, [balances, symbolObj])

  const { title, FormElement } = useMemo(() => {
    let tmpTitle = ''
    let tmpFormElement: any = () => null

    switch (orderDialogType) {
      case OrderDialogType.BinanceDirectBuy:
        tmpTitle = 'Binance Direct Buy Order'
        tmpFormElement = BinanceDirectBuy
        break

      case OrderDialogType.BinanceDirectSell:
        tmpTitle = 'Binance Direct Sell Order'
        tmpFormElement = BinanceDirectSell
        break

      case OrderDialogType.BinanceMovingBuy:
        tmpTitle = 'Binance Moving Buy Order'
        tmpFormElement = BinanceMovingBuy
        break

      case OrderDialogType.BinanceFixedTrailingStop:
        tmpTitle = 'Binance Fixed Trailing Stop Order'
        tmpFormElement = BinanceFixedTrailingStop
        break

      case OrderDialogType.BinanceMovingTrailingStop:
        tmpTitle = 'Binance Moving Trailing Stop Order'
        tmpFormElement = BinanceMovingTrailingStop
        break

      case OrderDialogType.BinanceConsolidation:
        tmpTitle = 'Binance Consolidation'
        tmpFormElement = BinanceConsolidation
        break

      default:
        tmpTitle = 'Order'
    }

    return {
      title: tmpTitle,
      FormElement: tmpFormElement
    }
  }, [orderDialogType])

  return (
    <>
      <ModalTemplate header={<Typography variant="h5">{title}</Typography>} modalId={modalId}>
        <Box className={styles.body}>
          <Box className={styles.one}>
            <Info assetAmount={assetAmount} dollars={dollars} lastPrice={lastPriceResponse?.data?.binanceLastPrice}/>
          </Box>
          <Box className={styles.two}>
            {showForm && <FormElement
              assetAmount={assetAmount}
              balances={balances}
              dollars={dollars}
              lastPrice={lastPriceResponse?.data?.binanceLastPrice}
              modalId={modalId}
              setError={setError}
              setLoading={setLoading}
              setSymbol={setSymbolWrapper}
              baseAsset={symbolObj.baseAsset}
              quoteAsset={symbolObj.quoteAsset}
            />}
          </Box>
          <Box className={styles.three}>
            <TradingViewWidget symbol={`${symbolObj.baseAsset}${symbolObj.quoteAsset}`}/>
          </Box>
        </Box>
        <ErrorModal error={error} />
      </ModalTemplate>
    </>
  )
}
