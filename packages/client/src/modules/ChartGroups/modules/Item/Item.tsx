import React, { useCallback } from 'react'
import { Box, Typography, IconButton, Divider } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { Close as CloseIcon, Launch as LaunchIcon } from '@material-ui/icons'
import { ChartGroup } from '@sw/shared/src/graphql'
import { useSubscription, useMutation, useQuery, useLazyQuery } from '@apollo/client'
import styles from './styles.module.scss'
import { ROUTES } from '../../../../constants'
import { GET_CHART_GROUP, GET_CHART_GROUPS, REMOVE_CHART_FROM_CHART_GROUP, REMOVE_CHART_GROUP } from '../../../../gqls'

type Props = {
  data: ChartGroup
}

export const Item = ({ data }: Props) => {
  const [removeChartGroup, removeChartGroupResponse] = useMutation(REMOVE_CHART_GROUP, {
    refetchQueries: [
      {
        query: GET_CHART_GROUPS
      }
    ]
  })

  const [removeChartFromChartGroup, removeChartFromChartGroupResponse] = useMutation(REMOVE_CHART_FROM_CHART_GROUP, {
    refetchQueries: [
      {
        query: GET_CHART_GROUPS
      }
    ]
  })

  const removeGroup = useCallback(() => {
    removeChartGroup({
      variables: {
        chartGroupId: data._id
      }
    })
  }, [removeChartGroup])

  const removeChart = useCallback(
    (symbol: string) => () => {
      removeChartFromChartGroup({
        variables: {
          chartGroupId: data._id,
          symbol
        }
      })
    },
    [removeChartFromChartGroup]
  )

  return (
    <Box mb={5} ml={4} mt={4} mr={4} className={styles.group} key={data._id}>
      <Box className={styles.header}>
        <Box color={grey[600]}>{data.name}</Box>

        <a
          href={ROUTES.CHART_GROUP_VIEW.replace(':chartGroupId', data._id)}
          target="_blank"
          rel="noreferrer"
          className={styles.link}
        >
          <IconButton>
            <LaunchIcon />
          </IconButton>
        </a>

        <IconButton onClick={removeGroup}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box className={styles.symbolList} mb={2}>
        <table>
          <tbody>
            {data.charts?.map((chartSettings) => (
              <tr key={chartSettings?.symbol}>
                <td className={styles.symbolContainer}>
                  <div className={styles.symbol}>{chartSettings?.symbol}</div>
                  <div className={styles.description}>{chartSettings?.symbolData?.description}</div>
                </td>
                <td>
                  <IconButton onClick={removeChart(chartSettings?.symbol || '')}>
                    <CloseIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      <Divider />
    </Box>
  )
}
