import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { Box } from '@material-ui/core'
import { FormattedNumber } from 'react-intl'
import { useSubscription, useMutation, useQuery } from '@apollo/client'
import { GetQuote, LastPrice } from '@sw/shared/src/graphql'
import styles from './styles.module.scss'
import { LAST_PRICE_SUBSCRIPTION, GET_QUOTE } from '../../../../gqls'
import { Detail } from '../Detail/Detail'
import { SelectedSymbol } from '../../../../types/redux/user'

type Props = {
  symbol: SelectedSymbol
}

export const Item = ({ symbol }: Props) => {
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

    if (!quoteError && !quoteLoading && quoteData) {
      currentPrice = quoteData.getQuote.currentPrice
      previousClose = quoteData.getQuote.previousClose
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
    <div>
      <div onClick={toggle} className={styles.header}>
        <div className={styles.percentageGain}>
          <Box bgcolor={percentageGain >= 0 ? 'success.main' : 'error.main'}>
            <FormattedNumber value={percentageGain / 100} style="percent" minimumFractionDigits={2} />
          </Box>
        </div>
        <div className={styles.symbol}>[{symbol.displaySymbol}]</div>
        <div className={styles.description}>{symbol.description}</div>
        <div className={styles.openPrice}>
          <FormattedNumber value={quoteData?.getQuote.openPrice || Number.NaN} />
        </div>
        <div className={styles.currentPrice}>
          <FormattedNumber value={quoteData?.getQuote.currentPrice || lastPriceData?.lastPrice.price || Number.NaN} />
        </div>
      </div>
      <Detail symbol={symbol.symbol} shown={isDetailShown} />
    </div>
  )
}
