import React, { ReactElement, useContext, useEffect, useMemo, useState } from 'react'
import { useSubscription, useMutation, useQuery, useLazyQuery } from '@apollo/client'
import { User } from '@sw/shared/src/graphql'
import { GET_USER_PROFILE } from '../../gqls'

import styles from './styles.module.scss'

import { Item } from './modules/Item/Item'

export const List = () => {
  const { data, loading, error } = useQuery<{ getUserProfile: User }>(GET_USER_PROFILE)

  return (
    <div className={styles.list}>
      {data?.getUserProfile?.dashboard?.watchedSymbols?.map((symbolObj) => (
        <Item symbol={symbolObj} key={symbolObj.symbol} />
      ))}
    </div>
  )
}
