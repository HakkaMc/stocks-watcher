import React from 'react'
import { HourglassEmpty as HourglassEmptyIcon } from '@material-ui/icons'
import { grey } from '@material-ui/core/colors'
import styles from './styles.module.scss'

export const ScreenLoader = () => {
    return <div className={styles.container}>
        <HourglassEmptyIcon className={styles.icon} style={{color: grey[400]}}/>
    </div>
}
