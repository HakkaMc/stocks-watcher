import React, { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import { Box, IconButton, Paper } from '@material-ui/core'
import { BinanceOrder, BinanceTrade, CancelBinanceOrder } from '@sw/shared/src/graphql'
import { FormattedDate, FormattedTime, FormattedNumber } from 'react-intl'

type Props = BinanceTrade

export const BinanceRow = ({
  symbol,
  tradeId,
  orderId,
  orderListId,
  price,
  qty,
  quoteQty,
  commission,
  commissionAsset,
  time,
  isBuyer,
  isMaker,
  isBestMatch,
  quoteAsset,
  baseAsset
}: Props) => {
  return (
    <>
      <tr>
        <td>{isBuyer ? 'BUY' : 'SELL'}</td>
        <td>{baseAsset}</td>

        <td>
          <FormattedNumber value={price} minimumFractionDigits={4} /> {quoteAsset}
        </td>
        <td>
          <FormattedNumber value={qty} minimumFractionDigits={4} />
        </td>
        <td>
          <FormattedNumber value={quoteQty} minimumFractionDigits={6} /> {quoteAsset}
        </td>
        <td>
          <FormattedNumber value={commission} minimumFractionDigits={8} /> {commissionAsset}
        </td>
        <td>{tradeId}</td>
        <td>{orderId}</td>
        <td>{orderListId}</td>
        <td>
          <FormattedDate value={time} /> <FormattedTime value={time} />
        </td>
      </tr>
    </>
  )
}
