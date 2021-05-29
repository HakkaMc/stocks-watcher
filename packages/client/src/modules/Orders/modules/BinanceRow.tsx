import React, { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import { Box, IconButton, Paper } from '@material-ui/core'
import { BinanceOrder, CancelBinanceOrder } from '@sw/shared/src/graphql'
import { FormattedDate, FormattedTime } from 'react-intl'
import { useQuery, useLazyQuery } from '@apollo/client'

import { Modal } from '../../Modal/Modal'
import { CloseIcon } from '../../../utils/icons'
import { CANCEL_BINANCE_ORDER } from '../../../gqls'
import { ModalTemplate } from '../../../components'

type Props = BinanceOrder

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

  const [cancelOrder, cancelOrderResponse] = useLazyQuery<{ cancelBinanceOrder: CancelBinanceOrder }>(
    CANCEL_BINANCE_ORDER
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
    if (!cancelOrderResponse.loading) {
      if (cancelOrderResponse.error) {
        console.log(cancelOrderResponse.error)
        setShowCancelOrderInfoDialog(true)
      } else {
        console.log(cancelOrderResponse.data)
      }
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
            {price} / {stopPrice}
          </div>
        </td>
        <td>
          <div>
            {origQty} / {executedQty}
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
