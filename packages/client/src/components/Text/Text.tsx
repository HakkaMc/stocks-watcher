import React from 'react'
import classNames from 'classnames'
import { Box, FormLabel } from '@material-ui/core'

import styles from './styles.module.scss'

type Props = {
  children: any
  size?: 32 | 42
}

export const Text = ({ children, size = 32 }: Props) => (
  <div className={classNames(styles.container, { [styles.sizeOne]: size === 32, [styles.sizeTwo]: size === 42 })}>
    {children}
  </div>
)
