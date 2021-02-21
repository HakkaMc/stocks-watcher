import React from 'react'
import { Modal } from '@material-ui/core'
import { useRedux } from '../../redux/useRedux'
import { Note } from '../Note/Note'
import { Reminder } from '../Reminder/Reminder'
import { ModalRoutes } from '../../constants'

import styles from './styles.module.scss'

export const ModalRouter = () => {
  const { selectedState: modalRoutes } = useRedux((state) => state.modal.routes)

  return (
    <>
      <Modal open={modalRoutes[ModalRoutes.Note]} className={styles.modal}>
        <div className={styles.contentWrapper}>
          <Note />
        </div>
      </Modal>

      <Modal open={modalRoutes[ModalRoutes.Reminder]} className={styles.modal}>
        <div className={styles.contentWrapper}>
          <Reminder />
        </div>
      </Modal>
    </>
  )
}
