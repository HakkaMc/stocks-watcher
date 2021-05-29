import React from 'react'
import { Modal as ModalComponent } from '@material-ui/core'

import styles from './styles.module.scss'

type Props = {
  open: boolean
  children: any
}

export const Modal = ({ open, children }: Props) => {
  return (
    <ModalComponent open={open} className={styles.modal}>
      <div className={styles.contentWrapper}>{children}</div>
    </ModalComponent>
  )
}
