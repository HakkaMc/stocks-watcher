import React, { useCallback, useMemo } from 'react'
import { IconButton } from '@material-ui/core'
import { Order } from '@sw/shared/src/graphql'
import { FormattedDate, FormattedTime } from 'react-intl'
import { useMutation } from '@apollo/client'

import { CloseIcon } from '../../../utils/icons'
import { CANCEL_ORDER, GET_ORDERS } from '../../../gqls'
import { ErrorModal } from '../../../components'
import { QuantityType } from '../../../binanceTypes'

type Props = Order

const fixedTrailingStop = (order: Order) => {
  let quantity = null
  switch (order.fixedTrailingStop?.quantityType) {
    case QuantityType.QuoteOrderQty:
      quantity = `${order.fixedTrailingStop.quoteOrderQty} $`
      break
    case QuantityType.Quantity:
      quantity = order.fixedTrailingStop?.quantity
      break
    default:
  }

  return [
    <>
      <div>
        {order.fixedTrailingStop?.activateOnPrice} $ / {order.fixedTrailingStop?.sellOnPrice} $
      </div>
      <div>{order.fixedTrailingStop?.priceType}</div>
    </>,
    <>
      <div>{order.fixedTrailingStop?.quantityType}</div>
      <div>{quantity}</div>
    </>
  ]
}

const movingBuy = (order: Order) => {
  let quantity = null
  switch (order.movingBuy?.quantityType) {
    case QuantityType.QuoteOrderQty:
      quantity = `${order.movingBuy.quoteOrderQty} $`
      break
    case QuantityType.Quantity:
      quantity = order.movingBuy?.quantity
      break
    default:
  }

  return [
    <>
      <div>
        {order.movingBuy?.activateOnPrice} $ / {order.movingBuy?.percent} %
      </div>
      <div>{order.movingBuy?.priceType}</div>
    </>,
    <>
      <div>{order.movingBuy?.quantityType}</div>
      <div>{quantity}</div>
    </>
  ]
}

export const Row = (order: Props) => {
  const [cancelOrder, cancelOrderResponse] = useMutation<{ cancelOrder: string }>(CANCEL_ORDER, {
    fetchPolicy: 'no-cache',
    refetchQueries: [
      {
        query: GET_ORDERS
      }
    ]
  })

  const closeOrder = useCallback(() => {
    cancelOrder({
      refetchQueries: [
        {
          query: GET_ORDERS
        }
      ],
      variables: {
        orderId: order._id
      }
    })
  }, [order])

  const detail = useMemo(() => {
    switch (order.type) {
      case 'FIXED_TRAILING_STOP':
        return fixedTrailingStop(order)

      case 'MOVING_BUY':
        return movingBuy(order)
      default:
    }
    return [null, null]
  }, [order])

  return (
    <>
      <tr>
        <td>{order.symbol}</td>
        <td>
          <div>{order.type}</div>
        </td>
        <td>{detail[0]}</td>
        <td>{detail[1]}</td>
        <td>
          <FormattedDate value={order.createdAt} /> <FormattedTime value={order.createdAt} />
        </td>
        <td>
          <IconButton onClick={closeOrder}>
            <CloseIcon />
          </IconButton>
          <ErrorModal error={cancelOrderResponse.loading ? undefined : cancelOrderResponse.error} />
        </td>
      </tr>
    </>
  )
}
