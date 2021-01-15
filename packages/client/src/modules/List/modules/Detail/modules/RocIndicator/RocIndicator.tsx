import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import { Container, Box } from '@material-ui/core'
import { FormattedNumber } from 'react-intl'
import { useSubscription, useMutation, useQuery, useLazyQuery } from '@apollo/client'
import { RocIndicator as RocIndicatorType } from '@sw/shared/src/graphql'
import { GET_ROC_INDICATOR } from '../../../../../../gqls'

import styles from './styles.module.scss'

type Props = {
  symbol: string
  shown: boolean
}

export const RocIndicator = ({ symbol, shown }: Props) => {
  const [loadData, { data, loading, error }] = useLazyQuery<{ getRocIndicator: RocIndicatorType }>(GET_ROC_INDICATOR, {
    variables: { symbol }
  })

  useEffect(() => {
    if (shown) {
      loadData()
    }
  }, [shown])

  if (!shown) return <></>

  return (
    <div>
      {loading && <div>ROC loading...</div>}
      {!loading && data && (
        <div className={styles.dailyChangesTable}>
          {data?.getRocIndicator?.days?.map((item) => (
            <Box key={item?.date} bgcolor={(item?.value || 0) >= 0 ? 'success.main' : 'error.main'}>
              <div>{item?.date}</div>
              <div>
                <FormattedNumber value={(item?.value || 0) / 100} style="percent" minimumFractionDigits={2} />
              </div>
            </Box>
          ))}
          <Box
            bgcolor={(data?.getRocIndicator?.sum || 0) >= 0 ? 'success.main' : 'error.main'}
            className={styles.percentageSum}
          >
            <b>
              <FormattedNumber
                value={(data?.getRocIndicator?.sum || 0) / 100}
                style="percent"
                minimumFractionDigits={2}
              />
            </b>
          </Box>
        </div>
      )}
    </div>
  )
}
