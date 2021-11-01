import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { IconButton } from '@material-ui/core'
import { FormattedDate, FormattedNumber, FormattedTime } from "react-intl";
import { useMutation } from "@apollo/client";

import { Modal } from '../../Modal/Modal'
import { CloseIcon } from '../../../utils/icons'
import { CANCEL_BINANCE_ORDER, GET_BINANCE_ORDERS, GET_BINANCE_SYMBOLS, GET_ORDERS } from "../../../gqls";
import { ModalTemplate } from '../../../components'
import { BinanceOrders_getBinanceOrders } from '../../../types/graphql/generated/BinanceOrders'
import { CancelBinanceOrderVariables, CancelBinanceOrder } from '../../../types/graphql/generated/CancelBinanceOrder'
import { getPrecision } from "../../../utils/mix";

type Props = BinanceOrders_getBinanceOrders

export const BinanceRow = ({
  symbol,
  side,
  price,
  origQty,
  executedQty,
  type,
  time,
  status,
  updateTime,
  stopPrice,
  orderId
}: Props) => {
  const [showCancelOrderInfoDialog, setShowCancelOrderInfoDialog] = useState(false)

  const [cancelOrder, cancelOrderResponse] = useMutation<CancelBinanceOrder, CancelBinanceOrderVariables>(
    CANCEL_BINANCE_ORDER,
    {
      refetchQueries: [
        {
          query: GET_ORDERS
        },
        {
          query: GET_BINANCE_ORDERS
        }
      ]
    }
  )

  const closeOrder = useCallback(() => {
    cancelOrder({
      variables: {
        symbol,
        orderId
      }
    })
  }, [symbol, orderId, cancelOrder])

  useEffect(() => {
    if (!cancelOrderResponse.loading && cancelOrderResponse.error) {
        setShowCancelOrderInfoDialog(true)
    }
  }, [cancelOrderResponse])

  return (
    <>
      <tr>
        <td>
          <div>{symbol}</div>
          <div>{status}</div>
        </td>
        <td>
          <div>{side}</div>
          <div>{type}</div>
        </td>
        <td>
          <div>
            {/*{price} / {stopPrice}*/}
            <FormattedNumber value={price} minimumFractionDigits={getPrecision(price)} style="currency" currency="USD"/>
            {stopPrice>0 && <>
              {' / '}
              <FormattedNumber value={stopPrice} minimumFractionDigits={getPrecision(stopPrice)} style="currency" currency="USD"/>
            </>}
          </div>
        </td>
        <td>
          <div>
            {/*{executedQty} / {origQty}*/}
            <FormattedNumber value={executedQty} minimumFractionDigits={getPrecision(executedQty)}/>
            {' / '}
            <FormattedNumber value={origQty} minimumFractionDigits={getPrecision(origQty)}/>
          </div>
          <div>
            <FormattedNumber value={price*origQty} minimumFractionDigits={getPrecision(price*origQty)} style="currency" currency="USD"/>
          </div>
        </td>
        <td>
          <div>
            <FormattedDate value={time} /> <FormattedTime value={time} />
          </div>
          {time !== updateTime && (
            <div>
              <FormattedDate value={updateTime} /> <FormattedTime value={updateTime} />
            </div>
          )}
        </td>
        <td>
          <IconButton onClick={closeOrder}>
            <CloseIcon />
          </IconButton>
          {showCancelOrderInfoDialog && (
            <Modal open={showCancelOrderInfoDialog}>
              <ModalTemplate
                modalId=""
                onClose={() => setShowCancelOrderInfoDialog(false)}
                header={<span>Cancel order Error!</span>}
              >
                <textarea value={JSON.stringify(cancelOrderResponse.error)} />
              </ModalTemplate>
            </Modal>
          )}
        </td>
      </tr>
    </>
  )
}
