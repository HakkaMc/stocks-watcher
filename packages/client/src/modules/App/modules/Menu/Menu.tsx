import React, { useCallback } from 'react'
import { List, Box, Divider } from '@material-ui/core'
import {
  Dashboard as DashboardIcon,
  ExitToApp as ExitToAppIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Event as EventIcon,
  Note as NoteIcon
} from '@material-ui/icons'
import { grey } from '@material-ui/core/colors'

import { logout } from '../../../../utils/session'
import { ROUTES } from '../../../../constants'
import { MenuItem } from '../MenuItem/MenuItem'
import { useRedux } from '../../../../redux/useRedux'
import styles from './styles.module.scss'

export const Menu = () => {
  const { dispatchers } = useRedux()

  const showNotes = useCallback(() => {
    dispatchers.app.toggleShowNotes()
  }, [])

  return (
    <Box bgcolor={grey[100]} className={styles.menu}>
      <Box mt={3}>
        <List>
          <MenuItem Icon={<DashboardIcon color="action" />} text="Dashboard" to={ROUTES.DASHBOARD} />
          <MenuItem Icon={<TimelineIcon color="action" />} text="Chart groups" to={ROUTES.CHART_GROUPS} />
          <MenuItem Icon={<NoteIcon color="action" />} text="Notes" noActiveStyle onClick={showNotes} />
          <MenuItem Icon={<EventIcon color="action" />} text="Reminder" noActiveStyle />
        </List>
      </Box>
      <Divider />
      <Box mt={3} mb={3}>
        <List>
          <MenuItem Icon={<SettingsIcon color="action" />} text="Settings" noActiveStyle />
          <MenuItem Icon={<ExitToAppIcon color="action" />} text="Logout" onClick={logout} noActiveStyle />
        </List>
      </Box>
    </Box>
  )
}
