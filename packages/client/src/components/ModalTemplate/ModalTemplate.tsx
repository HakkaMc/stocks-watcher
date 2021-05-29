import React, { useCallback } from 'react'
import classNames from 'classnames'
import { Box, Paper, IconButton } from '@material-ui/core'

import { dispatchers } from '../../redux'
import { CloseIcon } from '../../utils/icons'
import styles from './styles.module.scss'

type Props = {
  header?: any
  onClose?: () => void
  children: any
  modalId: string
}

export const ModalTemplate = ({ header = null, onClose = () => undefined, children, modalId }: Props) => {
  const close = useCallback(() => {
    if (modalId) {
      dispatchers.modal.close(modalId)
    }
    if (onClose) {
      onClose()
    }
  }, [modalId])

  return (
    <Box p={6} className={styles.margin}>
      <Paper className={styles.paper}>
        <div className={styles.header}>
          <Box pl={3} pt={1}>
            {header}
          </Box>
          <div>
            <IconButton onClick={close}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>

        <Box className={styles.body} pr={3} pl={3} pt={3} pb={3}>
          {children}
        </Box>
      </Paper>
    </Box>
  )
}
