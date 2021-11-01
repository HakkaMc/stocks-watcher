import React, { useCallback } from 'react'
import { Box, Divider, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'

import {
  AddIcon,
  RemoveIcon,
  ListIcon,
  DashboardIcon,
  EventIcon,
  ExitToAppIcon,
  NoteIcon,
  SettingsIcon,
  TimelineIcon,
  ExposureIcon,
  WalletIcon,
  BitcoinIconFa
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

          <Box pl={3} pr={3}>
            <ListItem>
              <ListItemIcon>
                <BitcoinIconFa size="24px" />
              </ListItemIcon>
              <ListItemText primary="Binance" />
            </ListItem>

            <MenuItem
              Icon={<WalletIcon color="action" />}
              text="Portfolio"
              noActiveStyle
              to={ROUTES.BinancePortfolio}
            />

            <MenuItem Icon={<ListIcon color="action" />} text="Trade list" noActiveStyle to={ROUTES.Trades} />

            <MenuItem Icon={<ListIcon color="action" />} text="Order list" noActiveStyle to={ROUTES.Orders} />

            <MenuItem
              Icon={<AddIcon color="action" />}
              text="Direct Buy Order"
              noActiveStyle
              onClick={openModal(ModalRoutes.Order, { orderDialogType: OrderDialogType.BinanceDirectBuy })}
            />
            <MenuItem
              Icon={<RemoveIcon color="action" />}
              text="Direct Sell Order"
              noActiveStyle
              onClick={openModal(ModalRoutes.Order, { orderDialogType: OrderDialogType.BinanceDirectSell })}
            />

            <MenuItem
              Icon={<RemoveIcon color="action" />}
              text="Fixed Trailing Stop Order"
              noActiveStyle
              onClick={openModal(ModalRoutes.Order, { orderDialogType: OrderDialogType.BinanceFixedTrailingStop })}
            />

            <MenuItem
              Icon={<RemoveIcon color="action" />}
              text="Moving Trailing Stop Order"
              noActiveStyle
              onClick={openModal(ModalRoutes.Order, { orderDialogType: OrderDialogType.BinanceMovingTrailingStop })}
            />

            <MenuItem
              Icon={<AddIcon color="action" />}
              text="Moving Buy Order"
              noActiveStyle
              onClick={openModal(ModalRoutes.Order, { orderDialogType: OrderDialogType.BinanceMovingBuy })}
            />

            <MenuItem
              Icon={<ExposureIcon color="action" />}
              text="Consolidation Order"
              noActiveStyle
              onClick={openModal(ModalRoutes.Order, { orderDialogType: OrderDialogType.BinanceConsolidation })}
            />
          </Box>

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
