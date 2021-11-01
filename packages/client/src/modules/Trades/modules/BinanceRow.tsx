import React  from "react";
import { FormattedDate, FormattedTime, FormattedNumber } from 'react-intl'
import { BinanceTrades_getBinanceTrades } from "../../../types/graphql/generated/BinanceTrades";
import { getPrecision } from "../../../utils/mix";

type Props = BinanceTrades_getBinanceTrades

export const BinanceRow = ({
  tradeId,
  orderId,
  price,
  qty,
  quoteQty,
  commission,
  commissionAsset,
  time,
  isBuyer,
  quoteAsset,
  baseAsset
}: Props) => {
  return (
    <>
      <tr>
        <td>{isBuyer ? 'BUY' : 'SELL'}</td>
        <td>{baseAsset}</td>
        <td>
          <FormattedNumber value={price} minimumFractionDigits={getPrecision(price)}/> {quoteAsset}
        </td>
        <td>
          <FormattedNumber value={qty} minimumFractionDigits={getPrecision(qty)}/>
        </td>
        <td>
          <FormattedNumber value={quoteQty} minimumFractionDigits={getPrecision(quoteQty)}/> {quoteAsset}
        </td>
        <td>
          {commission > 0 && <><FormattedNumber value={commission} minimumFractionDigits={getPrecision(quoteQty)} /> {commissionAsset}</>}
        </td>
        <td>
          <FormattedNumber value={tradeId}/>
        </td>
        <td>
          <FormattedNumber value={orderId}/>
        </td>
        <td/>
        <td>
          <FormattedDate value={time} /> <FormattedTime value={time} />
        </td>
      </tr>
    </>
  )
}
