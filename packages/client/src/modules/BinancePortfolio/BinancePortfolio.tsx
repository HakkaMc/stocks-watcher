import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Paper, Box, IconButton, Checkbox } from '@material-ui/core'
import { BinanceAccountInformation, BinanceBalanceUpdate, BinanceLastPrice } from '@sw/shared/src/graphql'
import { useQuery, useSubscription, useMutation } from '@apollo/client'
import { grey } from '@material-ui/core/colors'
import { FormattedDate, FormattedTime } from 'react-intl'

import {
  BINANCE_BALANCE_UPDATE_SUBSCRIPTION,
  GET_BINANCE_ACCOUNT_INFORMATION,
  GET_BINANCE_PROFILE,
  GET_ORDERS,
  REFRESH_BINANCE_TRADES
} from '../../gqls'
import { CloseIcon, RefreshIcon } from '../../utils/icons'
import { dispatchers } from '../../redux'
import { Row } from './modules/Row'
import { Row2 } from './modules/Row2'
import { SummaryRows } from './modules/SummaryRows'

import styles from './styles.module.scss'
import { Label } from '../../components'
import {
  GetBinanceProfile,
  GetBinanceProfile_getBinanceProfile_countedBalance
} from '../../types/graphql/generated/GetBinanceProfile'

export const BinancePortfolio = () => {
  const modalLoaderId = 'BINANCE'

  const [showAll, setShowAll] = useState(false)
  const [lastDbUpdate, setLastDbUpdate] = useState(-1)
  const [refreshingDb, setRefreshingDb] = useState(false)

  // const accountInformationResponse = useQuery<{ getBinanceAccountInformation: BinanceAccountInformation }>(
  //   GET_BINANCE_ACCOUNT_INFORMATION,
  //   {
  //     fetchPolicy: 'network-only',
  //     notifyOnNetworkStatusChange: true
  //   }
  // )

  const binanceProfile = useQuery<GetBinanceProfile>(GET_BINANCE_PROFILE, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  })

  const [resfreshBinanceTrades] = useMutation<{ refreshBinanceTrades: string }>(REFRESH_BINANCE_TRADES, {
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true
  })

  const balanceUpdateResponse = useSubscription(BINANCE_BALANCE_UPDATE_SUBSCRIPTION)

  useEffect(() => {
    if (binanceProfile.loading) {
      dispatchers.modalLoader.show(modalLoaderId)
    } else {
      dispatchers.modalLoader.close(modalLoaderId)
    }
  }, [binanceProfile.loading])

  const refresh = useCallback(() => {
    binanceProfile.refetch()
  }, [binanceProfile])

  useEffect(() => {
    if (!balanceUpdateResponse.loading) {
      setLastDbUpdate(Date.now())
      refresh()
      setRefreshingDb(false)
    }
  }, [balanceUpdateResponse.loading])

  const refreshDb = useCallback(() => {
    setRefreshingDb(true)
    resfreshBinanceTrades()
  }, [])

  // const balances = useMemo(() => {
  //   const originalBalances = accountInformationResponse.data?.getBinanceAccountInformation?.balances
  //   if (Array.isArray(originalBalances)) {
  //     return originalBalances
  //       .filter((balance) => balance.locked + balance.free > 0)
  //       .sort((a, b) => a.asset.localeCompare(b.asset))
  //   }
  //   return []
  // }, [accountInformationResponse.data?.getBinanceAccountInformation?.balances])

  const balances = useMemo(() => {
    const originalBalances = binanceProfile.data?.getBinanceProfile?.countedBalance
    if (Array.isArray(originalBalances)) {
      return [...originalBalances].sort((a: any, b: any) => a.asset.localeCompare(b.asset))
    }
    return []
  }, [binanceProfile])

  return (
    <>
      <Box paddingLeft={4} paddingRight={4} bgcolor={grey[600]} className={styles.header}>
        <Box>
          <Checkbox checked={showAll} color="primary" onChange={() => setShowAll(!showAll)} />
        </Box>
        <Box>
          {binanceProfile.loading && <span>Pending</span>}
          <IconButton onClick={refresh} disabled={binanceProfile.loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
        <Box className={styles.refreshDb}>
          <span>
            <IconButton onClick={refreshDb} disabled={refreshingDb}>
              <RefreshIcon />
            </IconButton>
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
                <Row2 key={`row_${balance?.asset}`} balance={balance as any} showAll={showAll} index={i} />
              ))}
            </>
            <SummaryRows />
          </tbody>
        </table>
      </Box>
    </>
  )
}
