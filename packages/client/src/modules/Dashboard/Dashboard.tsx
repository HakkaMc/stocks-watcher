import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client'
import { Dashboard as DashboardType, DashboardWatchlists, Symbol as SymbolType } from '@sw/shared/src/graphql'
import { GET_DASHBOARD } from '../../gqls'

import styles from './styles.module.scss'

import { Watchlist } from './modules/Watchlist/Watchlist'
import { Search } from './modules/Search/Search'

export const Dashboard = () => {
  const { data, loading, error } = useQuery<{ getDashboard: DashboardType }>(GET_DASHBOARD)

  const watchlists = useMemo((): Array<DashboardWatchlists> => {
    if (data?.getDashboard?.watchlists?.length) {
      return data.getDashboard.watchlists.slice().sort((a, b) => {
        if (a && b) {
          return a?.name?.localeCompare(b?.name)
        }

        return 0
      }) as Array<DashboardWatchlists>
    }

    return []
  }, [data])

  return (
    <>
      <Search watchlists={watchlists} />
      <div className={styles.list}>
        {watchlists.map((wl) => (
          <Watchlist key={wl.name} watchlist={wl} />
        ))}
      </div>
    </>
  )
}
