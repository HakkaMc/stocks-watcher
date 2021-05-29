import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Paper, Box, IconButton, Checkbox } from '@material-ui/core'
import { BinanceAccountInformation, BinanceBalanceUpdate, BinanceLastPrice } from '@sw/shared/src/graphql'
import { useQuery, useSubscription } from '@apollo/client'
import { grey } from '@material-ui/core/colors'

import {
  BINANCE_BALANCE_UPDATE_SUBSCRIPTION,
  BINANCE_LAST_PRICE_SUBSCRIPTION,
  GET_BINANCE_ACCOUNT_INFORMATION,
  GET_ORDERS
} from '../../gqls'
import { CloseIcon, RefreshIcon } from '../../utils/icons'
import { ModalRoutes } from '../../constants'
import { dispatchers } from '../../redux'
import { Row } from './modules/Row'
import { SummaryRows } from './modules/SummaryRows'

import styles from './styles.module.scss'

export const BinancePortfolio = () => {
  const modalLoaderId = 'BINANCE'
  const [showAll, setShowAll] = useState(false)

  const accountInformationResponse = useQuery<{ getBinanceAccountInformation: BinanceAccountInformation }>(
    GET_BINANCE_ACCOUNT_INFORMATION,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true
    }
  )

  const balanceUpdateResponse = useSubscription<{ binanceBalanceUpdate: BinanceBalanceUpdate }>(
    BINANCE_BALANCE_UPDATE_SUBSCRIPTION
  )

  useEffect(() => {
    if (accountInformationResponse.loading) {
      dispatchers.modalLoader.show(modalLoaderId)
    } else {
      dispatchers.modalLoader.close(modalLoaderId)
    }
  }, [accountInformationResponse.loading])

  const refresh = useCallback(() => {
    accountInformationResponse.refetch()
  }, [accountInformationResponse])

  useEffect(() => {
    refresh()
    console.log(balanceUpdateResponse.data)
  }, [balanceUpdateResponse.data])

  const balances = useMemo(() => {
    const originalBalances = accountInformationResponse.data?.getBinanceAccountInformation?.balances
    if (Array.isArray(originalBalances)) {
      return originalBalances
        .filter((balance) => balance.locked + balance.free > 0)
        .sort((a, b) => a.asset.localeCompare(b.asset))
    }
    return []
  }, [accountInformationResponse.data?.getBinanceAccountInformation?.balances])

  return (
    <>
      <Box paddingLeft={4} paddingRight={4} bgcolor={grey[600]} className={styles.header}>
        <Box className={styles.content}>
          <Checkbox checked={showAll} color="primary" onChange={() => setShowAll(!showAll)} />
          {accountInformationResponse.loading && <span>Pending</span>}
          <IconButton onClick={refresh}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Box className={styles.tableWrapper} pr={3} pl={3} pt={3} pb={3}>
        <table>
          <tbody>
            <tr>
              <th>Symbol</th>
              <th>Množství</th>
              <th colSpan={2}>Cena za akcii</th>
              <th colSpan={2}>Hodnota</th>
              <th className={styles.equalCell}>&nbsp;</th>
              <th colSpan={2}>Nerealizovaný zisk/ztráta</th>
              <th>Realizovaný zisk/ztráta</th>
              <th>&nbsp;</th>
            </tr>
            <>
              {balances.map((balance, i) => (
                <Row key={`row_${balance.asset}`} balance={balance} showAll={showAll} index={i} />
              ))}
            </>
            <SummaryRows />
          </tbody>
        </table>
      </Box>
    </>
  )
}
