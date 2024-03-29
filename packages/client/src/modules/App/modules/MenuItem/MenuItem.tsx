import React, { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { ListItem, ListItemIcon, ListItemText, Box } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'

import styles from './styles.module.scss'

type Props = {
  Icon: any
  text: string
  to?: string
  onClick?: () => void
  noActiveStyle?: boolean
}

export const MenuItem = ({ Icon, text, to = '#', onClick, noActiveStyle = false }: Props) => {
  const activeStyle = useMemo(() => {
    if (!noActiveStyle) {
      return {
        backgroundColor: grey[300]
      }
    }

    return {}
  }, [noActiveStyle])

  return (
    <NavLink to={to} className={styles.link} activeStyle={activeStyle} onClick={onClick}>
      <Box pl={5} pr={3} pt={1} pb={1} className={styles.box}>
        <ListItemIcon>{Icon}</ListItemIcon>
        <ListItemText primary={text} />
      </Box>
    </NavLink>
  )
}
