import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import classNames from 'classnames'
import { BinanceBalance, BinanceLastPrice, BinanceTrade } from '@sw/shared/src/graphql'
import { useSubscription, useLazyQuery, useQuery } from '@apollo/client'
import { IconButton } from '@material-ui/core'
import { FormattedNumber } from 'react-intl'

import { dispatchers } from '../../../redux'
import { CloseIcon } from '../../../utils/icons'
import { updateBoughtPrice, updateActualPrice } from '../store'
import { ModalRoutes, OrderDialogType } from '../../../constants'
import { BINANCE_LAST_PRICE_SUBSCRIPTION, GET_BINANCE_CACHED_LAST_PRICE, GET_BINANCE_TRADES } from '../../../gqls'

import styles from '../styles.module.scss'
import { GetBinanceProfile_getBinanceProfile_countedBalance } from '../../../types/graphql/generated/GetBinanceProfile'
import { BinanceCachedLastPrice } from '../../../types/graphql/generated/BinanceCachedLastPrice'

type Props = {
  balance: GetBinanceProfile_getBinanceProfile_countedBalance
  showAll: boolean
  index: number
}

export const Row2 = ({ balance, showAll, index }: Props) => {
  const timeoutRef = useRef<number>(-1)

  const lastPriceResponse = useSubscription<{ binanceLastPrice: BinanceLastPrice }>(BINANCE_LAST_PRICE_SUBSCRIPTION, {
    variables: {
      symbol: `${balance.asset}BUSD`
    }
  })

  const [getCachedPrice, lastCachedPriceResponse] = useLazyQuery<BinanceCachedLastPrice>(
    GET_BINANCE_CACHED_LAST_PRICE,
    {
      variables: {
        symbol: `${balance.asset}BUSD`
      },
      fetchPolicy: 'no-cache'
    }
  )

  useEffect(() => {
    // updateBoughtPrice(balance.asset, ['USDT', 'BUSD'].includes(balance.asset.toUpperCase()) ? balance.quantity : 0)
    // updateActualPrice(balance.asset, ['USDT', 'BUSD'].includes(balance.asset.toUpperCase()) ? balance.quantity : 0)
    updateBoughtPrice(balance.asset, balance.amount)
    updateActualPrice(balance.asset, ['USDT', 'BUSD'].includes(balance.asset.toUpperCase()) ? balance.amount : 0)

    if (!['USDT', 'BUSD'].includes(balance.asset.toUpperCase())) {
      timeoutRef.current = setTimeout(getCachedPrice, 3000)
    }
  }, [])

  const showSellModal = useCallback(() => {
    dispatchers.modal.open({
      name: ModalRoutes.Order,
      props: {
        symbol: `${balance.asset}BUSD`,
        amount: balance.quantity,
        orderDialogType: OrderDialogType.BinanceDirectSell
      }
    })
  }, [dispatchers])

  const lastPrice = useMemo(() => {
    if (['USDT', 'BUSD'].includes(balance.asset.toUpperCase())) {
      return 1
    }

    if (lastPriceResponse.data?.binanceLastPrice) {
      clearTimeout(timeoutRef.current)
      updateActualPrice(balance.asset, balance.quantity * lastPriceResponse.data?.binanceLastPrice.ask)
      return lastPriceResponse.data?.binanceLastPrice.ask
    }

    if (lastCachedPriceResponse.data?.getBinanceCachedLastPrice) {
      updateActualPrice(balance.asset, balance.quantity * lastCachedPriceResponse.data?.getBinanceCachedLastPrice.ask)
      return lastCachedPriceResponse.data?.getBinanceCachedLastPrice.ask
    }

    return Number.NaN
  }, [lastPriceResponse, lastCachedPriceResponse, updateActualPrice, balance])

  const actualAmount = useMemo(() => {
    if (['USDT', 'BUSD'].includes(balance.asset.toUpperCase())) {
      return balance.quantity
    }

    if (lastPrice > 0) {
      return lastPrice * balance.quantity
    }

    return Number.NaN
  }, [lastPrice, balance.quantity])

  const [unrealizedProfit, unrealizedPercentageProfit] = useMemo(() => {
    if (!['USDT', 'BUSD'].includes(balance.asset.toUpperCase()) && balance.amount > 0) {
      return [actualAmount - balance.amount, (100 / balance.amount) * actualAmount - 100]
    }

    return [0, 0]
  }, [balance, actualAmount])

  if (balance.quantity < 0.0001 && !showAll) return <></>

  if (balance.amount < 1 && !showAll) return <></>

  return (
    <>
      <tr key={balance.asset}>
        <td>
          <b>
            <a
              href={`https://www.tradingview.com/chart/?symbol=BINANCE:${balance.asset}BUSD`}
              target="_blank"
              rel="noreferrer"
            >
              {balance.asset}
            </a>
          </b>
        </td>
        <td>
          <FormattedNumber value={balance.quantity} minimumFractionDigits={4} />
        </td>
        <td>
          <FormattedNumber
            value={balance.averagePurchasePrice}
            minimumFractionDigits={4}
            style="currency"
            currency="USD"
          />
        </td>
        <td>
          <FormattedNumber value={lastPrice} minimumFractionDigits={4} style="currency" currency="USD" />
        </td>
        <td>
          <FormattedNumber value={balance.amount} minimumFractionDigits={2} style="currency" currency="USD" />
        </td>
        <td>
          <FormattedNumber value={actualAmount} minimumFractionDigits={2} style="currency" currency="USD" />
        </td>
        <td className={styles.equalCell}>=</td>
        <td
          className={classNames({
            [styles.green]: unrealizedProfit >= 0,
            [styles.red]: unrealizedProfit < 0
          })}
        >
          <FormattedNumber value={unrealizedProfit} minimumFractionDigits={2} style="currency" currency="USD" />
        </td>

        <td
          className={classNames({
            [styles.green]: unrealizedProfit >= 0,
            [styles.red]: unrealizedProfit < 0
          })}
        >
          <FormattedNumber value={unrealizedPercentageProfit / 100} minimumFractionDigits={2} style="percent" />
        </td>
        <td
          className={classNames({
            [styles.green]: balance.realizedProfit >= 0,
            [styles.red]: balance.realizedProfit < 0
          })}
        >
          <FormattedNumber value={balance.realizedProfit} minimumFractionDigits={2} style="currency" currency="USD" />
        </td>
        <td>
          {!['USDT', 'BUSD'].includes(balance.asset.toUpperCase()) && (
            <IconButton onClick={showSellModal}>
              <CloseIcon />
            </IconButton>
          )}
        </td>
      </tr>
    </>
  )
}
