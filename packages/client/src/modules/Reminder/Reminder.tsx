import React, {useCallback} from 'react'

import { Paper, Box, IconButton } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { Close as CloseIcon} from '@material-ui/icons'

import styles from "./styles.module.scss";
import {ModalRoutes} from "../../constants";
import {useRedux} from "../../redux/useRedux";

export const Reminder = () => {
    const { dispatchers } = useRedux()

    const close = useCallback(() => {
        dispatchers.modal.setRoute({route: ModalRoutes.Reminder, value: false})

    }, [dispatchers])

    return <div>
        <Box p={6} className={styles.margin}>
            <Paper className={styles.paper}>
                <Box className={styles.header}>
                    <IconButton onClick={close} className={styles.closeButton}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Paper>
        </Box>
    </div>
}
