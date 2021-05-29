import React, { useCallback, useState } from 'react'
import { Box, IconButton } from '@material-ui/core'
import classNames from 'classnames'
import { useSubscription, useMutation, useQuery, useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { ChartGroup, ChartGroupCharts } from '@sw/shared/src/graphql'
import { ViewModule as ViewModuleIcon, ViewStream as ViewStreamIcon } from '@material-ui/icons'

import styles from './styles.module.scss'

import { Chart } from './modules/Chart/Chart'
import { SearchSymbolInput } from '../../components/SearchSymbolInput/SearchSymbolInput'
import { ADD_CHART_TO_CHART_GROUP, GET_CHART_GROUP, REMOVE_CHART_FROM_CHART_GROUP } from '../../gqls'

const symbols = ['GME', 'NIO', 'BNGO', 'NVAX']

enum LAYOUT {
  VERTICAL,
  GRID
}

export const ChartGroupView = () => {
  const urlParams = useParams<{ chartGroupId: string }>()
  const [layout, setLayout] = useState<LAYOUT>(LAYOUT.VERTICAL)

  const chartGroupResponse = useQuery<{ getChartGroup: ChartGroup }>(GET_CHART_GROUP, {
    fetchPolicy: 'network-only',
    variables: {
      chartGroupId: urlParams.chartGroupId
    }
  })

  const [addChartToChartGroup, addChartToChartGroupResponse] = useMutation(ADD_CHART_TO_CHART_GROUP, {
    fetchPolicy: 'no-cache',
    refetchQueries: [
      {
        query: GET_CHART_GROUP,
        variables: {
          chartGroupId: urlParams.chartGroupId
        }
      }
    ]
  })

  const [removeChartFromChartGroup, removeChartFromChartGroupResponse] = useMutation(REMOVE_CHART_FROM_CHART_GROUP, {
    fetchPolicy: 'no-cache',
    refetchQueries: [
      {
        query: GET_CHART_GROUP,
        variables: {
          chartGroupId: urlParams.chartGroupId
        }
      }
    ]
  })

  const addChart = useCallback(
    (symbol: string) => {
      if (symbol && urlParams.chartGroupId) {
        addChartToChartGroup({
          variables: {
            chartGroupId: urlParams.chartGroupId,
            symbol,
            order: chartGroupResponse?.data?.getChartGroup?.charts.length || 0,
            range: '1'
          }
        })
      }
    },
    [addChartToChartGroup, urlParams]
  )

  const removeChart = useCallback(
    (symbol: string) => () => {
      removeChartFromChartGroup({
        variables: {
          chartGroupId: urlParams.chartGroupId,
          symbol
        }
      })
    },
    [removeChartFromChartGroup]
  )

  const setLayoutWrapper = useCallback((l: LAYOUT) => () => setLayout(l), [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Box m={0} className={styles.box}>
          <Box ml={1} mr={3}>
            {chartGroupResponse.data?.getChartGroup.name}
          </Box>
          <span>
            <SearchSymbolInput save={addChart} />
          </span>
          <IconButton onClick={setLayoutWrapper(LAYOUT.VERTICAL)}>
            <ViewStreamIcon color="primary" />
          </IconButton>
          <IconButton onClick={setLayoutWrapper(LAYOUT.GRID)}>
            <ViewModuleIcon color="primary" />
          </IconButton>
        </Box>
      </div>
      <div
        className={classNames(styles.body, {
          [styles.vertical]: layout === LAYOUT.GRID,
          [styles.grid]: layout === LAYOUT.GRID && symbols.length > 1
        })}
      >
        {chartGroupResponse.data?.getChartGroup?.charts?.map((chartSettings) => (
          <Chart
            symbol={chartSettings?.symbol || ''}
            key={chartSettings?.symbol}
            layout={layout}
            chartsCount={chartGroupResponse.data?.getChartGroup?.charts?.length || 0}
            range={chartSettings?.range}
            removeChart={removeChart(chartSettings?.symbol || '')}
          />
        ))}
      </div>
    </div>
  )
}
