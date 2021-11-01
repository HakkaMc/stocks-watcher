import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import classNames from 'classnames'
import { BinanceBalance, BinanceLastPrice, BinanceTrade } from '@sw/shared/src/graphql'
import { useSubscription, useLazyQuery, useQuery } from '@apollo/client'
import { IconButton, Tooltip, Typography, Box } from '@material-ui/core'
import { FormattedNumber } from 'react-intl'
import { grey } from "@material-ui/core/colors";

import { dispatchers } from '../../../redux'
import { CloseIcon, AddIcon } from '../../../utils/icons'
import { updateBoughtPrice, updateActualPrice } from '../store'
import { ModalRoutes, OrderDialogType } from '../../../constants'
import { BINANCE_LAST_PRICE_SUBSCRIPTION, GET_BINANCE_CACHED_LAST_PRICE, GET_BINANCE_TRADES } from '../../../gqls'
import { GetBinanceProfile_getBinanceProfile_countedBalance } from '../../../types/graphql/generated/GetBinanceProfile'
import { BinanceCachedLastPrice } from '../../../types/graphql/generated/BinanceCachedLastPrice'
import { getPrecision, roundToDigits } from '../../../utils/mix'

import styles from '../styles.module.scss'


type Props = {
  balance: GetBinanceProfile_getBinanceProfile_countedBalance
  showAll: boolean
  index: number
}

// {!Number.isNaN(lastPriceTimestamp) && Date.now() - lastPriceTimestamp > 120 && (
//   <Typography variant="caption" color="textSecondary" display="block">
//     {new Date(lastPriceTimestamp).toLocaleTimeString()}
//   </Typography>
// )}
// {Number.isNaN(lastPriceTimestamp)&& (
//   <Typography variant="caption" color="textSecondary" display="block">
//     (!)
//   </Typography>
// )}

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

  const showBuyModal = useCallback(() => {
    dispatchers.modal.open({
      name: ModalRoutes.Order,
      props: {
        symbol: `${balance.asset}BUSD`,
        amount: balance.quantity,
        orderDialogType: OrderDialogType.BinanceDirectBuy
      }
    })
  }, [dispatchers])

  const { lastPrice, lastPriceTimestamp } = useMemo(() => {
    if (['USDT', 'BUSD'].includes(balance.asset.toUpperCase())) {
      return {
        lastPrice: 1,
        lastPriceTimestamp: Number.NaN
      }
    }

    if (lastPriceResponse.data?.binanceLastPrice) {
      clearTimeout(timeoutRef.current)
      updateActualPrice(balance.asset, balance.quantity * lastPriceResponse.data?.binanceLastPrice.ask)
      return {
        lastPrice: lastPriceResponse.data?.binanceLastPrice.ask,
        lastPriceTimestamp: lastPriceResponse.data?.binanceLastPrice.timestamp
      }
    }

    if (lastCachedPriceResponse.data?.getBinanceCachedLastPrice) {
      updateActualPrice(balance.asset, balance.quantity * lastCachedPriceResponse.data?.getBinanceCachedLastPrice.ask)
      return { lastPrice: lastCachedPriceResponse.data?.getBinanceCachedLastPrice.ask, lastPriceTimestamp: Number.NaN }
    }

    return { lastPrice: Number.NaN, lastPriceTimestamp: Number.NaN }
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
              className={styles.noUnderline}
            >
              <Box color={grey[600]}>{balance.asset}</Box>
            </a>
          </b>
        </td>
        <td>
          <Box color={grey[600]}>
          <FormattedNumber
            value={balance.quantity}
            minimumFractionDigits={4}
          />
          </Box>
        </td>
        <td>
          {!['USDT', 'BUSD', 'USDC'].includes(balance.asset.toUpperCase()) && (
            <Box color={grey[600]}>
            <FormattedNumber
              value={roundToDigits(balance.averagePurchasePrice)}
              minimumFractionDigits={getPrecision(roundToDigits(balance.averagePurchasePrice))}
              style="currency"
              currencyDisplay="narrowSymbol"
              currency="USD"
            />
            </Box>
          )}
        </td>
        <td>
          {!['USDT', 'BUSD', 'USDC'].includes(balance.asset.toUpperCase()) && (
            <Tooltip title={lastPriceTimestamp > 0 ? new Date(lastPriceTimestamp).toLocaleTimeString() : '-'}>
              <span
                className={classNames({
                  // [styles.orange]: !Number.isNaN(lastPriceTimestamp) && (Date.now()-lastPriceTimestamp)>60,
                  [styles.red]: lastPrice < balance.averagePurchasePrice,
                  [styles.green]: lastPrice > balance.averagePurchasePrice
                })}
              >
                <FormattedNumber
                  value={lastPrice}
                  minimumFractionDigits={getPrecision(lastPrice, 2)}
                  style="currency"
                  currency="USD"
                  currencyDisplay="narrowSymbol"
                />
              </span>
            </Tooltip>
          )}
        </td>
        <td>
          <Box color={grey[600]}>
          <FormattedNumber
            value={balance.amount}
            minimumFractionDigits={2}
            style="currency"
            currency="USD"
            currencyDisplay="narrowSymbol"
          />
          </Box>
        </td>
        <td>
          <Box color={grey[600]}>
          <FormattedNumber
            value={actualAmount}
            minimumFractionDigits={2}
            style="currency"
            currency="USD"
            currencyDisplay="narrowSymbol"
          /></Box>
        </td>
        <td className={styles.equalCell}>
          {!['USDT', 'BUSD', 'USDC'].includes(balance.asset.toUpperCase()) && <>=</>}
        </td>
        <td
          className={classNames({
            [styles.green]: unrealizedProfit >= 0,
            [styles.red]: unrealizedProfit < 0
          })}
        >
          {!['USDT', 'BUSD', 'USDC'].includes(balance.asset.toUpperCase()) && (
            <FormattedNumber
              value={unrealizedProfit}
              minimumFractionDigits={2}
              style="currency"
              currency="USD"
              currencyDisplay="narrowSymbol"
            />
          )}
        </td>

        <td
          className={classNames({
            [styles.green]: unrealizedProfit >= 0,
            [styles.red]: unrealizedProfit < 0
          })}
        >
          {!['USDT', 'BUSD', 'USDC'].includes(balance.asset.toUpperCase()) && (
            <FormattedNumber value={unrealizedPercentageProfit / 100} minimumFractionDigits={2} style="percent" />
          )}
        </td>
        <td
          className={classNames({
            [styles.green]: balance.realizedProfit >= 0,
            [styles.red]: balance.realizedProfit < 0
          })}
        >
          {!['USDT', 'BUSD', 'USDC'].includes(balance.asset.toUpperCase()) && (
            <FormattedNumber
              value={balance.realizedProfit}
              minimumFractionDigits={2}
              style="currency"
              currency="USD"
              currencyDisplay="narrowSymbol"
            />
          )}
        </td>
        <td>
          {!['USDT', 'BUSD', 'USDC'].includes(balance.asset.toUpperCase()) && (
            <IconButton onClick={showBuyModal}>
              <AddIcon />
            </IconButton>
          )}
          {!['USDT', 'BUSD', 'USDC'].includes(balance.asset.toUpperCase()) && (
            <IconButton onClick={showSellModal}>
              <CloseIcon />
            </IconButton>
          )}
        </td>
      </tr>
    </>
  )
}
