import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Typography } from '@material-ui/core'
import { useQuery, useSubscription } from '@apollo/client'

import { ErrorModal, ModalTemplate } from '../../components'
import { Info } from './modules/Info/Info'

import { BINANCE_LAST_PRICE_SUBSCRIPTION, GET_BINANCE_ACCOUNT_INFORMATION } from '../../gqls'

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
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()

  const { showLoader, hideLoader } = useModalLoader()

  const accountInformationResponse = useQuery<BinanceAccountInformation>(GET_BINANCE_ACCOUNT_INFORMATION, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  })

  const lastPriceResponse = useSubscription<BinanceLastPriceSubscription, BinanceLastPriceSubscriptionVariables>(
    BINANCE_LAST_PRICE_SUBSCRIPTION,
    {
      variables: {
        symbol
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
          <Box className={styles.left}>
            <Info
              assetAmount={assetAmount}
              busdAmount={busdAmount}
              lastPrice={lastPriceResponse?.data?.binanceLastPrice}
            />
          </Box>
          <Box className={styles.right}>
            <FormElement
              assetAmount={assetAmount}
              balances={balances}
              busdAmount={busdAmount}
              lastPrice={lastPriceResponse?.data?.binanceLastPrice}
              modalId={modalId}
              setError={setError}
              setLoading={setLoading}
              setSymbol={setSymbolWrapper}
              symbol={symbol}
            />
          </Box>
        </Box>
        <ErrorModal error={error} />
      </ModalTemplate>
    </>
  )
}
