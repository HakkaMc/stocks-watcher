import React, { useCallback, useMemo } from 'react'
import { IconButton } from '@material-ui/core'
import { FormattedDate, FormattedTime } from 'react-intl'
import { useMutation } from '@apollo/client'

import { CloseIcon } from '../../../utils/icons'
import { CANCEL_ORDER, GET_ORDERS } from '../../../gqls'
import { ErrorModal } from '../../../components'
import { QuantityType } from '../../../binanceTypes'
import { Orders_getOrders } from '../../../types/graphql/generated/Orders'

type Props = Orders_getOrders

const fixedTrailingStop = (order: Orders_getOrders) => {
  let quantity = null
  switch (order.quantityType) {
    case QuantityType.QuoteOrderQty:
      quantity = `${order.quoteOrderQty} $`
      break
    case QuantityType.Quantity:
      quantity = order.quantity
      break
    default:
  }

  return [
    <>
      <div>
        {order.activateOnPrice} $ / {order.sellOnPrice} $
      </div>
      <div>{order.priceType}</div>
    </>,
    <>
      <div>{order.quantityType}</div>
      <div>{quantity}</div>
    </>
  ]
}

const movingTrailingStop = (order: Orders_getOrders) => {
  let quantity = null
  switch (order.quantityType) {
    case QuantityType.QuoteOrderQty:
      quantity = `${order.quoteOrderQty} $`
      break
    case QuantityType.Quantity:
      quantity = order.quantity
      break
    default:
  }

  return [
    <>
      <div>
        {order.activateOnPrice} $ / {order.percent}%
      </div>
      <div>{order.priceType}</div>
    </>,
    <>
      <div>{order.quantityType}</div>
      <div>{quantity}</div>
    </>
  ]
}

const movingBuy = (order: Orders_getOrders) => {
  let quantity = null
  switch (order.quantityType) {
    case QuantityType.QuoteOrderQty:
      quantity = `${order.quoteOrderQty} $`
      break
    case QuantityType.Quantity:
      quantity = order.quantity
      break
    default:
  }

  return [
    <>
      <div>
        {order.activateOnPrice} $ / {order.percent} %
      </div>
      <div>{order.priceType}</div>
    </>,
    <>
      <div>{order.quantityType}</div>
      <div>{quantity}</div>
    </>
  ]
}

const consolidation = (order: Orders_getOrders) => {
  let quantity = null
  switch (order.quantityType) {
    case QuantityType.QuoteOrderQty:
      quantity = `${order.quoteOrderQty} $`
      break
    case QuantityType.Quantity:
      quantity = order.quantity
      break
    default:
  }

  return [
    <>
      <div>
        {order.activateOnPrice} $ / {order.sellOnPrice} $
      </div>
      <div>{order.priceType}</div>
    </>,
    <>
      <div>{order.quantityType}</div>
      <div>{quantity}</div>
    </>
  ]
}

const getQuantity = (order: Orders_getOrders) => {
  let quantity = null
  switch (order.quantityType) {
    case QuantityType.QuoteOrderQty:
      quantity = `${order.quoteOrderQty} $`
      break
    case QuantityType.Quantity:
      quantity = order.quantity
      break
    default:
  }

  return (
    <>
      <div>{order.quantityType}</div>
      <div>{quantity}</div>
    </>
  )
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

      case 'MOVING_TRAILING_STOP':
        return movingTrailingStop(order)

      case 'MOVING_BUY':
        return movingBuy(order)

      case 'CONSOLIDATION':
        return consolidation(order)

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
        <td>{order.activateOnPrice}</td>
        <td>{order.percent > 0 ? `${order.percent}%` : order.sellOnPrice}</td>
        <td>{order.priceType}</td>
        <td>{getQuantity(order)}</td>
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
