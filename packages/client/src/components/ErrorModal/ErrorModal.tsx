import React, { useCallback, useEffect, useState } from 'react'

import { Modal } from '../Modal/Modal'
import { ModalTemplate } from '../ModalTemplate/ModalTemplate'

import styles from './styles.module.scss'

type Props = {
  error: any
}

export const ErrorModal = ({ error }: Props) => {
  const [stringError, setStringError] = useState<string>('')

  const close = useCallback(() => {
    setStringError('')
  }, [])

  useEffect(() => {
    if (error !== undefined && error !== null) {
      if (typeof error === 'string') {
        if (error.trim().length) {
          setStringError(error)
        }
      } else {
        setStringError(JSON.stringify(error))
      }
    }
  }, [error])

  return stringError ? (
    <Modal open={!!stringError}>
      <ModalTemplate modalId="" onClose={close} header="ERROR!">
        <textarea value={stringError} className={styles.textarea} />
      </ModalTemplate>
    </Modal>
  ) : null
}
