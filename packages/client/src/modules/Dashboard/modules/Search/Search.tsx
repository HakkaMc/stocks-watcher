import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation } from '@apollo/client'
import { Box, List, ListItem, ListItemText } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { DashboardWatchlists } from '@sw/shared/src/graphql'
import styles from './styles.module.scss'

import { SearchSymbolInput } from '../../../../components/SearchSymbolInput/SearchSymbolInput'
import { GET_DASHBOARD, SAVE_SYMBOL_TO_DASHBOARD } from '../../../../gqls'

type Props = {
  watchlists: Array<DashboardWatchlists>
}

export const Search = ({ watchlists }: Props) => {
  const [symbol, setSymbol] = useState('')
  const [saveSymbolToDashboard] = useMutation(SAVE_SYMBOL_TO_DASHBOARD, {
    fetchPolicy: 'no-cache',
    refetchQueries: [
      {
        query: GET_DASHBOARD
      }
    ]
  })

  const hideWatchlistSelector = useCallback(() => {
    setSymbol('')
    window.removeEventListener('mousedown', hideWatchlistSelector)
  }, [setSymbol])

  const save = useCallback(
    (watchlist: string) => () => {
      if (symbol && watchlist) {
        saveSymbolToDashboard({ variables: { symbol, watchlist: watchlist || 'Default' } })
        hideWatchlistSelector()
      }
    },
    [saveSymbolToDashboard, symbol, hideWatchlistSelector]
  )

  const showWatchlistSelector = useCallback(
    (symbolName: string) => {
      setSymbol(symbolName)

      setTimeout(() => {
        window.addEventListener('mousedown', hideWatchlistSelector)
      }, 500)
    },
    [setSymbol]
  )

  const watchlistList = useMemo(() => {
    if (watchlists?.length) {
      return watchlists?.map((wl) => {
        return (
          <ListItem onClick={save(wl.name)} key={wl._id}>
            <ListItemText primary={wl.name} />
          </ListItem>
        )
      })
    }
    return (
      <ListItem onClick={save('Default')}>
        <ListItemText primary="Default" />
      </ListItem>
    )
  }, [watchlists, save])

  const listContainerClick = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  return (
    <Box paddingLeft={4} paddingRight={4} bgcolor={grey[600]} className={styles.container}>
      <div className={styles.content}>
        <SearchSymbolInput save={showWatchlistSelector} white />
        {symbol && (
          <>
            <div className={styles.listContainer} onMouseDown={listContainerClick}>
              <Box p={2}>
                <b>Watchlists:</b>
              </Box>
              <List className={styles.list}>{watchlistList}</List>
            </div>
          </>
        )}
      </div>
    </Box>
  )
}
