import React, { useCallback, useMemo, useState } from 'react'
import { DashboardWatchlists } from '@sw/shared/src/graphql'
import { grey } from '@material-ui/core/colors'
import { Box, Icon, IconButton, Tooltip } from '@material-ui/core'
import classNames from 'classnames'
import { useSubscription, useMutation, useQuery, useLazyQuery } from '@apollo/client'
import { Symbol } from '../Symbol/Symbol'
import { VisibilityIcon, VisibilityOffIcon } from '../../../../utils/icons'
import {WatchlistName} from "../WatchlistName/WatchlistName";

import styles from './styles.module.scss'
import { CHANGE_WATCHLIST_SETTINGS, GET_DASHBOARD } from '../../../../gqls'

type Props = {
  watchlist: DashboardWatchlists
}

export const Watchlist = ({ watchlist }: Props) => {
  const [hiddenContent, hideContent] = useState(!!watchlist.hidden)
  const [renderedAlready, setRenderedAlready] = useState(true)

  const [changeWatchlistSettings] = useMutation(CHANGE_WATCHLIST_SETTINGS, {
    refetchQueries: [
      {
        query: GET_DASHBOARD
      }
    ]
  })

  const symbols = useMemo(() => {
    if (watchlist?.symbolsData?.length) {
      // A new copy of array because the original array is freezed
      const symbolsDataSorted = watchlist.symbolsData.slice().sort((a, b) => {
        if (a && b) {
          return a.symbol.localeCompare(b.symbol)
        }

        return 0
      })

      return symbolsDataSorted.map((symbolObj) => {
        if (symbolObj) {
          return <Symbol symbol={symbolObj} key={symbolObj?.symbol} />
        }
        return <></>
      })
    }

    return <></>
  }, [watchlist])

  const toggleVisibility = useCallback(() => {
    const value = !hiddenContent

    hideContent(value)
    changeWatchlistSettings({
      variables: {
        id: watchlist._id,
        hidden: value
      }
    })
  }, [hiddenContent, hideContent, changeWatchlistSettings, watchlist._id])

  return (
    <Box mb={3} p={4} className={styles.box}>
      <Box className={styles.header}>
        <Box color={grey[600]}>
          <IconButton onClick={toggleVisibility}>
            {hiddenContent ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </Box>
        <WatchlistName watchlist={watchlist}/>
      </Box>
      <div className={classNames(styles.symbols, { [styles.hidden]: hiddenContent })}>{renderedAlready && symbols}</div>
    </Box>
  )
}
