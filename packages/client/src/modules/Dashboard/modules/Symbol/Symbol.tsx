import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Icon, IconButton, Tooltip } from '@material-ui/core'
import { grey, green } from '@material-ui/core/colors'
import { FormattedNumber } from 'react-intl'
import { useSubscription, useMutation, useQuery, useLazyQuery } from '@apollo/client'
import { Symbol as SymbolType, GetQuote, LastPrice, Scalars } from '@sw/shared/src/graphql'
import classNames from 'classnames'
import { RocketLaunchOutline as RocketIcon } from 'mdi-material-ui'
import styles from './styles.module.scss'
import { LAST_PRICE_SUBSCRIPTION, GET_QUOTE } from '../../../../gqls'
import { SymbolDetail } from '../SymbolDetail/SymbolDetail'
import { QuickChart } from '../QuickChart/QuickChart'
import { WatchlistChanger } from '../WatchlistChanger/WatchlistChanger'
import { PriceAlert } from '../PriceAlert/PriceAlert'
import { RefreshIcon } from '../../../../utils/icons'

type Props = {
  symbol: SymbolType
}

export const Symbol = ({ symbol }: Props) => {
  const [isDetailShown, setIsDetailShow] = useState(false)
  const [forceRefreshTrigger, setForceRefreshTrigger] = useState(Date.now())
  const [refreshTime, setRefreshTime] = useState('')

  const {
    data: lastPriceData,
    loading: lastPriceLoading,
    error: lastPriceError
  } = useSubscription<{
    lastPrice: LastPrice
  }>(LAST_PRICE_SUBSCRIPTION, { variables: { symbol: symbol.symbol } })

  const quoteResponse = useQuery<{ getQuote: GetQuote }>(GET_QUOTE, {
    variables: { symbol: symbol.symbol }
  })

  useEffect(() => {
    // console.log('useEffect getQuote')
    quoteResponse.refetch()
  }, [forceRefreshTrigger, quoteResponse.refetch])

  const toggle = useCallback(() => {
    setIsDetailShow(!isDetailShown)
  }, [isDetailShown])

  const percentageGain = useMemo((): number => {
    let currentPrice = Number.NaN
    let previousClose = Number.NaN
    let gain = Number.NaN

    if (!quoteResponse.error && !quoteResponse.loading && quoteResponse.data && quoteResponse.data.getQuote) {
      currentPrice = quoteResponse.data.getQuote.currentPrice
      previousClose = quoteResponse.data.getQuote.previousClose
    }

    if (!lastPriceError && !lastPriceLoading && lastPriceData) {
      setRefreshTime(new Date().toLocaleTimeString())
      currentPrice = lastPriceData.lastPrice.price
    }

    if (!Number.isNaN(currentPrice) && !Number.isNaN(previousClose)) {
      gain = (100 / previousClose) * currentPrice - 100
    }

    return gain
  }, [quoteResponse, lastPriceData, lastPriceLoading, lastPriceError])

  const refreshData = useCallback(() => {
    setForceRefreshTrigger(Date.now())
  }, [setForceRefreshTrigger])

  const quoteData = useMemo((): GetQuote => {
    setRefreshTime(new Date().toLocaleTimeString())
    return {
      openPrice: quoteResponse.data?.getQuote?.openPrice || Number.NaN,
      highPrice: quoteResponse.data?.getQuote?.highPrice || Number.NaN,
      lowPrice: quoteResponse.data?.getQuote?.lowPrice || Number.NaN,
      currentPrice: quoteResponse.data?.getQuote?.currentPrice || Number.NaN,
      previousClose: quoteResponse.data?.getQuote?.previousClose || Number.NaN
    }
  }, [quoteResponse])

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
            previousClose={quoteData.previousClose}
            openPrice={quoteData.openPrice}
            lastPrice={lastPriceData?.lastPrice?.price}
            lastPriceTimestamp={lastPriceData?.lastPrice?.timestamp}
            forceRefreshTrigger={forceRefreshTrigger}
          />
        </Box>
        <Box className={styles.openPrice} mr={3} bgcolor={grey[100]} p={1}>
          <FormattedNumber value={quoteData.previousClose} />
        </Box>
        <Box className={styles.openPrice} mr={3} bgcolor={grey[100]} p={1}>
          <FormattedNumber value={quoteData.openPrice} />
        </Box>
        <Box className={styles.currentPrice} mr={3} bgcolor={grey[100]} p={1}>
          <FormattedNumber value={lastPriceData?.lastPrice?.price || quoteData.currentPrice} />
        </Box>
        <Box>
          <WatchlistChanger symbolObj={symbol} />
        </Box>
        <Box>
          <PriceAlert symbol={symbol.symbol} />
        </Box>
        <Box>
          <Tooltip title={refreshTime}>
            <IconButton onClick={refreshData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </div>
      <SymbolDetail symbolObj={symbol} shown={isDetailShown} />
    </div>
  )
}
