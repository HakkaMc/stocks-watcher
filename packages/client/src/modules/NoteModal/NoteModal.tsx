import React from 'react'
import { Modal} from '@material-ui/core'
import { useRedux } from '../../redux/useRedux'

import {Note} from "./modules/Note/Note";

import styles from './styles.module.scss'

export const NoteModal = () => {
  const { selectedState: showNotes, dispatchers } = useRedux((state) => state.app.showNotes)

  return (
      <Modal open={showNotes} className={styles.modal}>
        <div className={styles.contentWrapper}>
          <Note/>
        </div>
      </Modal>
  )
}
