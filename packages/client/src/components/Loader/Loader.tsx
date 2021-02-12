import React from 'react'
import { Box } from '@material-ui/core'
import { HourglassEmpty as HourglassEmptyIcon } from '@material-ui/icons'
import { grey } from '@material-ui/core/colors'
import styles from './styles.module.scss'

export const Loader = () => {
  return (
    <Box className={styles.container} p={4}>
        <HourglassEmptyIcon className={styles.icon} style={{color: grey[400]}}/>
    </Box>
  )
}
