import React, { useCallback, useMemo, useState } from 'react'
import { Box, Typography } from '@material-ui/core'
import { useQuery, useSubscription } from '@apollo/client'
import { BinanceAccountInformation, BinanceLastPrice } from '@sw/shared/src/graphql'

import { ModalTemplate } from '../../components'
import { Info } from './modules/Info/Info'

import { BINANCE_LAST_PRICE_SUBSCRIPTION, GET_BINANCE_ACCOUNT_INFORMATION } from '../../gqls'

import styles from './styles.module.scss'

import { BinanceFixedTrailingStop } from './modules/BinanceFixedTrailingStop/BinanceFixedTrailingStop'
import { BinanceMovingBuy } from './modules/BinanceMovingBuy/BinanceMovingBuy'
import { BinanceDirectBuy } from './modules/BinanceDirectBuy/BinanceDirectBuy'
import { BinanceDirectSell } from './modules/BinanceDirectSell/BinanceDirectSell'
import { OrderDialogType } from '../../constants'

type Props = {
  id: string
  symbol?: string
  orderDialogType?: OrderDialogType
}

export const Order = ({
  id: modalId,
  symbol: predefinedSymbol = '',
  orderDialogType = OrderDialogType.BinanceDirectBuy
}: Props) => {
  const [asset, setAsset] = useState(predefinedSymbol.replace('BUSD', ''))
  const [symbol, setSymbol] = useState(predefinedSymbol)

  const accountInformationResponse = useQuery<{ getBinanceAccountInformation: BinanceAccountInformation }>(
    GET_BINANCE_ACCOUNT_INFORMATION,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true
    }
  )

  const lastPriceResponse = useSubscription<{ binanceLastPrice: BinanceLastPrice }>(BINANCE_LAST_PRICE_SUBSCRIPTION, {
    variables: {
      symbol
    }
  })

  const setSymbolWrapper = useCallback((smb: string) => {
    setSymbol(smb)
    setAsset(smb.replace('BUSD', ''))
  }, [])

  const balances = useMemo(() => {
    const blcs = accountInformationResponse?.data?.getBinanceAccountInformation?.balances

    if (Array.isArray(blcs)) {
      return blcs
    }

    return []
  }, [accountInformationResponse?.data?.getBinanceAccountInformation?.balances])

  const busdAmount = useMemo(() => {
    const result = balances.find((balance) => balance.asset === 'BUSD')

    if (result) {
      return result
    }

    return {
      free: 0,
      locked: 0
    }
  }, [balances])

  const assetAmount = useMemo(() => {
    if (asset) {
      const result = balances.find((balance) => balance.asset === asset)

      if (result) {
        return result.free + result.locked
      }
    }

    return 0
  }, [balances, asset])

  const title = useMemo(() => {
    switch (orderDialogType) {
      case OrderDialogType.BinanceDirectBuy:
        return 'Binance Direct Buy Order'

      case OrderDialogType.BinanceDirectSell:
        return 'Binance Direct Sell Order'

      case OrderDialogType.BinanceMovingBuy:
        return 'Binance Moving Buy Order'

      case OrderDialogType.BinanceFixedTrailingStop:
        return 'Binance Fixed trailing Stop Order'

      default:
        return 'Order'
    }
  }, [orderDialogType])

  return (
    <>
      <ModalTemplate header={<Typography variant="h5">{title}</Typography>} modalId={modalId}>
        <Box className={styles.body}>
          <Box className={styles.left}>
            <Info
              assetAmount={assetAmount}
              busdAmount={busdAmount}
              lastPrice={lastPriceResponse?.data?.binanceLastPrice}
            />
          </Box>
          <Box className={styles.right}>
            {() => {
              switch (orderDialogType) {
                case OrderDialogType.BinanceDirectSell:
                  return (
                    <BinanceDirectSell
                      assetAmount={assetAmount}
                      balances={balances}
                      symbol={symbol}
                      setSymbol={setSymbol}
                      lastPrice={lastPriceResponse?.data?.binanceLastPrice}
                    />
                  )

                case OrderDialogType.BinanceFixedTrailingStop:
                  return (
                    <BinanceFixedTrailingStop
                      assetAmount={assetAmount}
                      balances={balances}
                      symbol={symbol}
                      setSymbol={setSymbolWrapper}
                      lastPrice={lastPriceResponse?.data?.binanceLastPrice}
                    />
                  )

                case OrderDialogType.BinanceDirectBuy:
                  return (
                    <BinanceDirectBuy
                      balances={balances}
                      symbol={symbol}
                      setSymbol={setSymbol}
                      lastPrice={lastPriceResponse?.data?.binanceLastPrice}
                    />
                  )

                case OrderDialogType.BinanceMovingBuy:
                  return (
                    <BinanceMovingBuy
                      busdAmount={busdAmount}
                      balances={balances}
                      symbol={symbol}
                      setSymbol={setSymbolWrapper}
                      lastPrice={lastPriceResponse?.data?.binanceLastPrice}
                    />
                  )
                default:
                  return null
              }
            }}
          </Box>
        </Box>
      </ModalTemplate>
    </>
  )
}
