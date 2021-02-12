import React, { useMemo } from 'react'
import { DashboardWatchlists } from '@sw/shared/src/graphql'
import { Box } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { Symbol } from '../Symbol/Symbol'

import styles from './styles.module.scss'

type Props = {
  watchlist: DashboardWatchlists
}

export const Watchlist = ({ watchlist }: Props) => {
  const symbols = useMemo(() => {
    if (watchlist?.symbolsData?.length) {
      // A new copy of array because the original array is freezed
      const symbolsDataSorted = watchlist.symbolsData.slice().sort((a,b)=>{
        if(a && b){
          return a.symbol.localeCompare(b.symbol)
        }

        return 0
      })

      return symbolsDataSorted
        .map((symbolObj) => {
          if (symbolObj) {
            return <Symbol symbol={symbolObj} key={symbolObj?.symbol} />
          }
          return <></>
        })
    }

    return <></>
  }, [watchlist])

  return (
    <Box mb={3} p={4} className={styles.box}>
      <Box color={grey[600]}>{watchlist.name}</Box>
      {symbols}
    </Box>
  )
}
