import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Icon, IconButton } from '@material-ui/core'
import { grey, green } from '@material-ui/core/colors'
import { FormattedNumber } from 'react-intl'
import { useSubscription, useMutation, useQuery } from '@apollo/client'
import {Symbol as SymbolType, GetQuote, LastPrice} from '@sw/shared/src/graphql'
import classNames from 'classnames'
import { RocketLaunchOutline as RocketIcon } from 'mdi-material-ui'
import { Close as CloseIcon, NotificationsNone as NotificationsIcon } from '@material-ui/icons'
import styles from './styles.module.scss'
import { LAST_PRICE_SUBSCRIPTION, GET_QUOTE } from '../../../../gqls'
import { SymbolDetail } from '../SymbolDetail/SymbolDetail'
import { QuickChart } from '../QuickChart/QuickChart'
import { WatchlistChanger } from '../WatchlistChanger/WatchlistChanger'

type Props = {
  symbol: SymbolType
}

export const Symbol = ({ symbol }: Props) => {
  const [isDetailShown, setIsDetailShow] = useState(false)
  const { data: lastPriceData, loading: lastPriceLoading, error: lastPriceError } = useSubscription<{
    lastPrice: LastPrice
  }>(LAST_PRICE_SUBSCRIPTION, { variables: { symbol: symbol.symbol } })
  const { data: quoteData, loading: quoteLoading, error: quoteError } = useQuery<{ getQuote: GetQuote }>(GET_QUOTE, {
    variables: { symbol: symbol.symbol }
  })

  const toggle = useCallback(() => {
    setIsDetailShow(!isDetailShown)
  }, [isDetailShown])

  const percentageGain = useMemo((): number => {
    let currentPrice = Number.NaN
    let previousClose = Number.NaN
    let gain = Number.NaN

    if (!quoteError && !quoteLoading && quoteData && quoteData.getQuote) {
      currentPrice = quoteData.getQuote.currentPrice
      previousClose = quoteData.getQuote.previousClose

      // console.log(symbol.symbol, previousClose, currentPrice)
    }

    if (!lastPriceError && !lastPriceLoading && lastPriceData) {
      currentPrice = lastPriceData.lastPrice.price
    }

    if (currentPrice !== Number.NaN && previousClose !== Number.NaN) {
      gain = (100 / previousClose) * currentPrice - 100
    }

    return gain
  }, [quoteData, quoteError, quoteLoading, lastPriceData, lastPriceLoading, lastPriceError])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Box className={styles.symbolCell} onClick={toggle}>
          <div className={styles.symbol}>{symbol.displaySymbol}</div>
          <div className={styles.description}>{symbol.description}</div>
        </Box>

        <Box className={styles.rocketIcon}>
          <Icon>{percentageGain > 7 && <RocketIcon style={{ color: green[500] }} />}</Icon>
        </Box>

        <Box
          mr={3}
          className={classNames(styles.percentageGain, {
            [styles.up]: percentageGain > 0,
            [styles.down]: percentageGain < 0
          })}
        >
          <FormattedNumber value={percentageGain / 100} style="percent" minimumFractionDigits={2} />
        </Box>

        <Box className={styles.chart} mr={3}>
          <QuickChart
            symbol={symbol.symbol}
            previousClose={quoteData?.getQuote?.previousClose}
            openPrice={quoteData?.getQuote?.openPrice}
            lastPrice={lastPriceData?.lastPrice?.price}
            lastPriceTimestamp={lastPriceData?.lastPrice?.timestamp}
          />
        </Box>
        <Box className={styles.openPrice} mr={3} bgcolor={grey[100]} p={1}>
          <FormattedNumber value={quoteData?.getQuote?.previousClose || Number.NaN} />
        </Box>
        <Box className={styles.openPrice} mr={3} bgcolor={grey[100]} p={1}>
          <FormattedNumber value={quoteData?.getQuote?.openPrice || Number.NaN} />
        </Box>
        <Box className={styles.currentPrice} mr={3} bgcolor={grey[100]} p={1}>
          <FormattedNumber value={lastPriceData?.lastPrice?.price || quoteData?.getQuote?.currentPrice || Number.NaN} />
        </Box>
        <Box>
          <WatchlistChanger symbolObj={symbol} />
        </Box>
        <Box>
          <IconButton>
            <NotificationsIcon />
          </IconButton>
        </Box>
      </div>
      <SymbolDetail symbolObj={symbol} shown={isDetailShown} />
    </div>
  )
}
