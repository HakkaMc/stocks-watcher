import React from 'react'
import classNames from 'classnames'
import { Box } from '@material-ui/core'
import { dispatchers, useTypedSelector } from '../../redux'
import styles from './styles.module.scss'

export const ModalLoader = () => {
  const showLoader = useTypedSelector((state) => state.modalLoader.ids.length > 0)

  return (
    <div>
      <div className={classNames(styles.container, { [styles.visible]: showLoader })} />
    </div>
  )
}
