import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import { Container, Box } from '@material-ui/core'
import { red, green, grey, lightGreen } from '@material-ui/core/colors'
import { FormattedNumber } from 'react-intl'
import { useSubscription, useMutation, useQuery, useLazyQuery } from '@apollo/client'
import { DailyChangeIndicator as DailyChangeIndicatorType, Symbol as SymbolType } from '@sw/shared/src/graphql'
import { GET_DAILY_CHANGE_INDICATOR } from '../../../../../../gqls'

import styles from './styles.module.scss'

type Props = {
  symbolObj: SymbolType
  shown: boolean
}

export const DailyChangeIndicator = ({ symbolObj, shown }: Props) => {
  const [loadData, { data, loading, error }] = useLazyQuery<{ getDailyChangeIndicator: DailyChangeIndicatorType }>(
    GET_DAILY_CHANGE_INDICATOR,
    {
      variables: { symbol: symbolObj.symbol }
    }
  )

  useEffect(() => {
    if (shown) {
      loadData()
    }
  }, [shown])

  if (!shown) return <></>

  let sumColor = ''
  if ((data?.getDailyChangeIndicator?.sum || 0) > 0) sumColor = green.A700
  if ((data?.getDailyChangeIndicator?.sum || 0) < 0) sumColor = red.A700

  return (
    <div>
      {loading && <div>Daily changes loading...</div>}
      {!loading && !error && data && (
        <div className={styles.dailyChangesTable}>
          {data?.getDailyChangeIndicator?.days?.map((item) => {
            let color = ''
            if ((item?.value || 0) > 0) color = green.A700
            if ((item?.value || 0) < 0) color = red.A700

            return (
              <Box key={item?.date}>
                <Box color={grey[500]}>{item?.date}</Box>
                <Box color={color}>
                  <FormattedNumber value={(item?.value || 0) / 100} style="percent" minimumFractionDigits={2} />
                </Box>
              </Box>
            )
          })}
          <Box color={sumColor} className={styles.percentageSum} border={1} borderColor={grey[300]}>
            <b>
              <FormattedNumber
                value={(data?.getDailyChangeIndicator?.sum || 0) / 100}
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
