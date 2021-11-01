import React, { useCallback, useMemo, useState } from 'react'
import { grey } from '@material-ui/core/colors'
import { Box, IconButton } from '@material-ui/core'
import classNames from 'classnames'
import { useMutation } from '@apollo/client'
import { Symbol } from '../Symbol/Symbol'
import { VisibilityIcon, VisibilityOffIcon } from '../../../../utils/icons'
import { WatchlistName } from '../WatchlistName/WatchlistName'

import styles from './styles.module.scss'
import { CHANGE_WATCHLIST_SETTINGS, GET_DASHBOARD } from '../../../../gqls'
import { Dashboard_getDashboard_watchlists } from '../../../../types/graphql/generated/Dashboard'

type Props = {
  watchlist: Dashboard_getDashboard_watchlists
}

export const Watchlist = ({ watchlist }: Props) => {
  const [hiddenContent, hideContent] = useState(!!watchlist.hidden)
  const [renderedAlready, setRenderedAlready] = useState(!watchlist.hidden)

  const [changeWatchlistSettings] = useMutation(CHANGE_WATCHLIST_SETTINGS, {
    fetchPolicy: 'no-cache',
    refetchQueries: [
      {
        query: GET_DASHBOARD
      }
    ]
  })

  const symbols = useMemo(() => {
    if (watchlist?.symbolsData?.length && (!hiddenContent || renderedAlready)) {
      setRenderedAlready(true)

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
  }, [watchlist, renderedAlready])

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
        <WatchlistName watchlist={watchlist} />
      </Box>
      <div className={classNames(styles.symbols, { [styles.hidden]: hiddenContent })}>{symbols}</div>
    </Box>
  )
}
