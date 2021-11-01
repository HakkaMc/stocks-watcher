import React, { useCallback, useEffect, useState } from 'react'
import { Box, IconButton, Typography } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { useQuery, useSubscription, useMutation } from '@apollo/client'
import { FormattedDate, FormattedTime } from 'react-intl'

import styles from './styles.module.scss'
import { RefreshIcon } from '../../utils/icons'
import { BinanceRow } from './modules/BinanceRow'
import { BINANCE_BALANCE_UPDATE_SUBSCRIPTION, GET_BINANCE_TRADES, REFRESH_BINANCE_TRADES } from '../../gqls'
import { dispatchers } from '../../redux'
import { Label } from '../../components'
import { RefreshBinanceTrades, RefreshBinanceTradesVariables} from '../../types/graphql/generated/RefreshBinanceTrades'
import { BinanceTrades, BinanceTradesVariables } from '../../types/graphql/generated/BinanceTrades'
import { SortFindManyBinanceTradeInput } from "../../types/graphql/generated/globalTypes";

export const Trades = () => {
  const modalLoaderId = 'BINANCE_TRADES'

  const [lastDbUpdate, setLastDbUpdate] = useState(-1)
  const [refreshingDb, setRefreshingDb] = useState(false)

  const getBinanceTradesResponse = useQuery<BinanceTrades, BinanceTradesVariables>(GET_BINANCE_TRADES, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: {
      // sorts: [ { field: 'time', sort: 'DESC' } ],
      sort: SortFindManyBinanceTradeInput.TIME_DESC,
      limit: 50
    }
  })

  const [resfreshBinanceTrades] = useMutation<RefreshBinanceTrades, RefreshBinanceTradesVariables>(REFRESH_BINANCE_TRADES, {
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
    variables: {
      force: true
    }
  })

  const binanceBalanceUpdateResponse = useSubscription(BINANCE_BALANCE_UPDATE_SUBSCRIPTION)

  useEffect(() => {
    if (getBinanceTradesResponse.loading) {
      dispatchers.modalLoader.show(modalLoaderId)
    } else {
      dispatchers.modalLoader.close(modalLoaderId)
    }
  }, [getBinanceTradesResponse.loading])

  const refresh = useCallback(() => {
    getBinanceTradesResponse.refetch()
  }, [getBinanceTradesResponse.refetch])

  const refreshDb = useCallback(() => {
    setRefreshingDb(true)
    resfreshBinanceTrades()
  }, [])

  useEffect(() => {
    console.log('binanceBalanceUpdateResponse: ', binanceBalanceUpdateResponse)

    if (!binanceBalanceUpdateResponse.loading) {
      setLastDbUpdate(Date.now())
      refresh()
      setRefreshingDb(false)
    }
  }, [binanceBalanceUpdateResponse.data])

  return (
    <>
      <Box paddingLeft={4} paddingRight={4} bgcolor={grey[600]} className={styles.header}>
        <span>
          {!refreshingDb && (
            <IconButton onClick={refreshDb}>
              <RefreshIcon />
            </IconButton>
          )}
        </span>
        <span>
          <Label>
            Last server database update:{' '}
            {lastDbUpdate > 0 ? (
              <>
                <FormattedDate value={lastDbUpdate} /> <FormattedTime value={lastDbUpdate} />
              </>
            ) : (
              'Unknown'
            )}
          </Label>
        </span>
      </Box>

      <Box className={styles.tableWrapper} pr={3} pl={3} pt={3} pb={3} mb={3}>
        <Box className={styles.tableTitle}>
          <Box>
            <Typography variant="h5">Binance trades</Typography>
          </Box>
          <Box>
            {(getBinanceTradesResponse.loading || getBinanceTradesResponse.loading) && <span>Pending</span>}
            <IconButton onClick={refresh}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
        <Box className={styles.tableWrapper} mt={2}>
          <table>
            <thead>
              <tr>
                <th>Side</th>
                <th>Asset</th>
                <th>Price per share</th>
                <th>Quantity</th>
                <th>Value</th>
                <th>Comission</th>
                <th>Trade ID</th>
                <th>Order ID</th>
                <th>Order List ID</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {(getBinanceTradesResponse?.data?.getBinanceTrades || []).map((trade) => (
                <BinanceRow {...trade} key={trade.tradeId} />
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </>
  )
}
