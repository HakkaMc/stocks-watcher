import React, { useCallback, useEffect, useMemo } from 'react'
import classNames from 'classnames'
import { BinanceBalance, BinanceLastPrice, BinanceTrade } from '@sw/shared/src/graphql'
import { useSubscription } from '@apollo/client'
import { IconButton } from '@material-ui/core'
import { round } from '../../../utils/mix'

import { dispatchers } from '../../../redux'
import { CloseIcon } from '../../../utils/icons'
import { updateBoughtPrice, updateActualPrice } from '../store'
import { ModalRoutes } from '../../../constants'
import { useGetTrades } from '../useGetTrades'
import { BINANCE_LAST_PRICE_SUBSCRIPTION } from '../../../gqls'

import styles from '../styles.module.scss'

type Props = {
  balance: BinanceBalance
  showAll: boolean
  index: number
}

const f = (value: any): number => {
  if (value === undefined || value === null) {
    return Number.NaN
  }

  return parseFloat(value)
}

export const Row = ({ balance, showAll, index }: Props) => {
  const amount = f(balance.free + balance.locked)

  const lastPriceResponse = useSubscription<{ binanceLastPrice: BinanceLastPrice }>(BINANCE_LAST_PRICE_SUBSCRIPTION, {
    variables: {
      symbol: `${balance.asset}BUSD`
    }
  })

  const [getTrades, tradesResponse] = useGetTrades({ asset: balance.asset })

  useEffect(() => {
    updateBoughtPrice(balance.asset, ['USDT', 'BUSD'].includes(balance.asset.toUpperCase()) ? amount : 0)
    updateActualPrice(balance.asset, ['USDT', 'BUSD'].includes(balance.asset.toUpperCase()) ? amount : 0)

    if (!['USDT', 'BUSD'].includes(balance.asset.toUpperCase())) {
      setTimeout(getTrades, index * 100)
    }
  }, [])

  const showSellModal = useCallback(() => {
    dispatchers.modal.open({
      name: ModalRoutes.BinanceSellOrder,
      props: { symbol: `${balance.asset}BUSD`, amount: balance.free }
    })
  }, [dispatchers])

  const lastPrice = useMemo(() => {
    if (['USDT', 'BUSD'].includes(balance.asset.toUpperCase())) {
      return 1
    }

    if (lastPriceResponse.data?.binanceLastPrice) {
      updateActualPrice(balance.asset, amount * lastPriceResponse.data?.binanceLastPrice.ask)
      return lastPriceResponse.data?.binanceLastPrice.ask
    }

    return Number.NaN
  }, [lastPriceResponse, updateActualPrice, amount])

  const actualPrice = useMemo(() => {
    if (['USDT', 'BUSD'].includes(balance.asset.toUpperCase())) {
      return amount
    }

    if (lastPrice > 0) {
      return lastPrice * amount
    }

    return Number.NaN
  }, [lastPrice, amount])

  const report = useMemo(() => {
    const trades = tradesResponse.data

    const rep = {
      amount: 0,
      pricePerShare: 0, // Average bougth price per share
      realizedProfit: 0,
      price: 0 // Amount bought in BUSD
    }

    if (['USDT', 'BUSD'].includes(balance.asset.toUpperCase())) {
      rep.amount = amount
      rep.pricePerShare = 1
      rep.price = amount
    }

    if (Array.isArray(trades)) {
      const tradeList = [...trades]

      tradeList.sort((a, b) => a.time - b.time)

      tradeList.forEach(({ price, qty, isBuyer, commission, commissionAsset, time }: BinanceTrade) => {
        // if (isBuyer) {
        //   rep.price += price * qty
        //   rep.amount += (commissionAsset.toUpperCase() === balance.asset.toUpperCase() ? qty - commission : qty)
        //   rep.pricePerShare = rep.price / rep.amount
        // } else {
        //   rep.realizedProfit += price * qty - rep.pricePerShare * qty
        //   rep.amount -= (commissionAsset.toUpperCase() === balance.asset.toUpperCase() ? qty + commission : qty)
        //   rep.price = rep.pricePerShare * rep.amount
        // }

        // if (isBuyer) {
        //   rep.price += price * (commissionAsset.toUpperCase() === balance.asset.toUpperCase() ? qty + commission : qty+commission/price)
        //   rep.amount += (commissionAsset.toUpperCase() === balance.asset.toUpperCase() ? qty - commission : qty-commission/price)
        //   rep.pricePerShare = rep.price / rep.amount
        // } else {
        //   rep.realizedProfit += price * (commissionAsset.toUpperCase() === balance.asset.toUpperCase() ? qty - commission : qty-commission/price) - rep.pricePerShare * (commissionAsset.toUpperCase() === balance.asset.toUpperCase() ? qty - commission : qty-commission/price)
        //   rep.amount -= (commissionAsset.toUpperCase() === balance.asset.toUpperCase() ? qty + commission : qty+commission/price)
        //   rep.price = rep.pricePerShare * rep.amount
        // }

        if (isBuyer) {
          if (['BUSD', 'USDT'].includes(commissionAsset.toUpperCase())) {
            rep.realizedProfit -= commission
            rep.amount += qty
            rep.price += price * qty
          } else if (commissionAsset.toUpperCase() === balance.asset.toUpperCase()) {
            rep.amount += qty - commission
            rep.price += price * (qty - commission)
          }
          // Commission is BNB
          else {
            // TODO -
            rep.amount += qty
            rep.price += price * qty
          }

          rep.pricePerShare = rep.price / rep.amount
        } else {
          if (['BUSD', 'USDT'].includes(commissionAsset.toUpperCase())) {
            rep.realizedProfit -= commission
            rep.amount -= qty
            rep.realizedProfit += price * qty - rep.pricePerShare * qty
          } else if (commissionAsset.toUpperCase() === balance.asset.toUpperCase()) {
            rep.amount -= qty + commission
            rep.realizedProfit += price * (qty - commission) - rep.pricePerShare * (qty - commission)
          }
          // Commission is BNB
          else {
            // TODO -
            rep.amount -= qty
            rep.realizedProfit += price * qty - rep.pricePerShare * qty
          }

          rep.price = rep.pricePerShare * rep.amount
        }
      })

      // Counted and returned share-amount is different, so it's necessary to count the bought price using the
      // share-amount return from binance.
      rep.price = rep.pricePerShare * amount

      // if(balance.asset === 'BNB'){
      //   console.log('Amount: ', rep.amount)
      // }

      updateBoughtPrice(balance.asset, rep.price)
    }

    return rep
  }, [tradesResponse.data])

  const [unrealizedProfit, unrealizedPercentageProfit] = useMemo(() => {
    if (!['USDT', 'BUSD'].includes(balance.asset.toUpperCase()) && report.price > 0) {
      return [actualPrice - report.price, (100 / report.price) * actualPrice - 100]
    }

    return [0, 0]
  }, [amount, actualPrice, report.price])

  if (amount < 0.0001) return <></>

  if (report.price < 1 && !showAll) return <></>

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
        <td>{round(amount, 4)}</td>
        <td>{round(report.pricePerShare, 4)} $</td>
        <td>{round(lastPrice, 4)} $</td>
        <td>{round(report.price)} $</td>
        <td>{round(actualPrice)} $</td>
        <td className={styles.equalCell}>=</td>
        <td
          className={classNames({
            [styles.green]: unrealizedProfit >= 0,
            [styles.red]: unrealizedProfit < 0
          })}
        >
          {round(unrealizedProfit)} $
        </td>

        <td
          className={classNames({
            [styles.green]: unrealizedProfit >= 0,
            [styles.red]: unrealizedProfit < 0
          })}
        >
          {round(unrealizedPercentageProfit)}%
        </td>
        <td
          className={classNames({
            [styles.green]: report.realizedProfit >= 0,
            [styles.red]: report.realizedProfit < 0
          })}
        >
          {round(report.realizedProfit)} $
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
