import React, { useCallback, useEffect } from 'react'
import { Box, IconButton, Typography } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { useQuery, useSubscription } from '@apollo/client'
import { BinanceOcoOrderUpdate, BinanceOrder, BinanceOrderUpdate, Order } from '@sw/shared/src/graphql'

import { RefreshIcon } from '../../utils/icons'
import {
  BINANCE_OCO_ORDER_UPDATE_SUBSCRIPTION,
  BINANCE_ORDER_UPDATE_SUBSCRIPTION,
  GET_BINANCE_ORDERS,
  GET_ORDERS
} from '../../gqls'
import { BinanceRow } from './modules/BinanceRow'
import { Row } from './modules/Row'
import { dispatchers } from '../../redux'
import styles from './styles.module.scss'

export const Orders = () => {
  const modalLoaderId = 'BINANCE_ORDERS'

  const getBinanceOrdersResponse = useQuery<{ getBinanceOrders: Array<BinanceOrder> }>(GET_BINANCE_ORDERS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  })

  const getOrdersResponse = useQuery<{ getOrders: Array<Order> }>(GET_ORDERS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  })

  const binanceOrderUpdateResponse = useSubscription<{ binanceOrderUpdate: BinanceOrderUpdate }>(
    BINANCE_ORDER_UPDATE_SUBSCRIPTION
  )

  const binanceOcoOrderUpdateResponse = useSubscription<{ binanceOcoOrderUpdate: BinanceOcoOrderUpdate }>(
    BINANCE_OCO_ORDER_UPDATE_SUBSCRIPTION
  )

  useEffect(() => {
    if (getOrdersResponse.loading || getBinanceOrdersResponse.loading) {
      dispatchers.modalLoader.show(modalLoaderId)
    } else {
      dispatchers.modalLoader.close(modalLoaderId)
    }
  }, [getOrdersResponse.loading, getBinanceOrdersResponse.loading])

  const refresh = useCallback(() => {
    getOrdersResponse.refetch()
    getBinanceOrdersResponse.refetch()
  }, [getOrdersResponse.refetch, getBinanceOrdersResponse.refetch])

  useEffect(() => {
    refresh()
  }, [binanceOrderUpdateResponse.data])

  useEffect(() => {
    refresh()
  }, [binanceOcoOrderUpdateResponse.data])

  console.log(getBinanceOrdersResponse.error, getBinanceOrdersResponse.data)
  console.log(getOrdersResponse.error, getOrdersResponse.data)
  console.log('binanceOrderUpdateResponse: ', binanceOrderUpdateResponse)

  return (
    <>
      <Box paddingLeft={4} paddingRight={4} bgcolor={grey[600]} className={styles.header}>
        <Box className={styles.content}>
          {(getOrdersResponse.loading || getBinanceOrdersResponse.loading) && <span>Pending</span>}
          <IconButton onClick={refresh}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Box className={styles.tableWrapper} pr={3} pl={3} pt={3} pb={3} mb={3}>
        <Typography variant="h5">Binance orders</Typography>
        <Box className={styles.tableWrapper}>
          <table>
            <tbody>
              {(getBinanceOrdersResponse?.data?.getBinanceOrders || []).map((order) => (
                <BinanceRow {...order} key={order.orderId} />
              ))}
            </tbody>
          </table>
        </Box>
      </Box>

      <Box className={styles.tableWrapper} pr={3} pl={3} pt={3} pb={3} mb={3}>
        <Typography variant="h5">Orders</Typography>
        <Box className={styles.tableWrapper}>
          <table>
            <tbody>
              {(getOrdersResponse?.data?.getOrders || []).map((order) => (
                <Row {...order} key={order._id} />
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </>
  )
}
