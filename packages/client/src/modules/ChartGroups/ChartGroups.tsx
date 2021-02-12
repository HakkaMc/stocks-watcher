import React, { useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Box } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { ChartGroup } from '@sw/shared/src/graphql'
import { GET_CHART_GROUPS } from '../../gqls'

import { AddGroup } from './modules/AddGroup/AddGroup'
import { Item } from './modules/Item/Item'

import styles from './styles.module.scss'

export const ChartGroups = () => {
  const [getChartGroups, chartGroupsResponse] = useLazyQuery<{ getChartGroups: Array<ChartGroup> }>(GET_CHART_GROUPS, {
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    getChartGroups()
  }, [])

  return (
    <div>
      <Box paddingLeft={4} bgcolor={grey[600]} className={styles.header}>
        <AddGroup />
      </Box>

      {chartGroupsResponse.data?.getChartGroups.map((chartGroup) => (
        <Item key={chartGroup._id} data={chartGroup} />
      ))}
    </div>
  )
}
