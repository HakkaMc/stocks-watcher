import React, { useCallback } from 'react'
import { Box, Divider, List } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'

import {
  AddIcon,
  ListIcon,
  DashboardIcon,
  EventIcon,
  ExitToAppIcon,
  NoteIcon,
  SettingsIcon,
  TimelineIcon
} from '../../../../utils/icons'
import { logout } from '../../../../utils/session'
import { ModalRoutes, OrderDialogType, ROUTES } from '../../../../constants'
import { MenuItem } from '../MenuItem/MenuItem'
import { dispatchers } from '../../../../redux'

import styles from './styles.module.scss'

export const Menu = () => {
  const openModal = useCallback(
    (route: ModalRoutes, props?: Record<string, any>) => () => {
      dispatchers.modal.open({ name: route, props })
    },
    []
  )

  return (
    <Box bgcolor={grey[100]} className={styles.menu}>
      <Box mt={3}>
        <List>
          <MenuItem Icon={<DashboardIcon color="action" />} text="Dashboard" to={ROUTES.Dashboard} />

          <MenuItem Icon={<TimelineIcon color="action" />} text="Chart groups" to={ROUTES.ChartGroups} />

          <MenuItem Icon={<ListIcon color="action" />} text="Orders" noActiveStyle to={ROUTES.Orders} />

          <MenuItem
            Icon={<NoteIcon color="action" />}
            text="Notes"
            noActiveStyle
            onClick={openModal(ModalRoutes.Note)}
          />
          <MenuItem
            Icon={<EventIcon color="action" />}
            text="Reminder"
            noActiveStyle
            onClick={openModal(ModalRoutes.Reminder)}
          />
          <MenuItem
            Icon={<DashboardIcon color="action" />}
            text="Binance Portfolio"
            noActiveStyle
            to={ROUTES.BinancePortfolio}
          />

          <MenuItem
            Icon={<AddIcon color="action" />}
            text="Binance Direct Buy Order"
            noActiveStyle
            onClick={openModal(ModalRoutes.Order, { orderDialogType: OrderDialogType.BinanceDirectBuy })}
          />
          <MenuItem
            Icon={<AddIcon color="action" />}
            text="Binance Direct Sell Order"
            noActiveStyle
            onClick={openModal(ModalRoutes.Order, { orderDialogType: OrderDialogType.BinanceDirectSell })}
          />

          <MenuItem
            Icon={<AddIcon color="action" />}
            text="Binance Fixed Trailing Stop Order"
            noActiveStyle
            onClick={openModal(ModalRoutes.Order, { orderDialogType: OrderDialogType.BinanceFixedTrailingStop })}
          />

          <MenuItem
            Icon={<AddIcon color="action" />}
            text="Binance Moving Buy Order"
            noActiveStyle
            onClick={openModal(ModalRoutes.Order, { orderDialogType: OrderDialogType.BinanceMovingBuy })}
          />
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
