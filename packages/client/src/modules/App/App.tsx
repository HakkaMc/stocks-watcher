import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import { Container, AppBar, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline } from '@material-ui/core'
import { Dashboard as DashboardIcon } from '@material-ui/icons';

import { Search } from '../Search/Search'
import { List as ListComponent } from '../List/List'

import styles from './styles.module.scss'

const App = (): ReactElement => {
  return (
      <>
          <CssBaseline />
          <AppBar position="sticky" className={styles.appBar}><Search /></AppBar>
          <Drawer>
              <List>
                  <ListItem>
                      <ListItemIcon><DashboardIcon color="action"/></ListItemIcon>
                      <ListItemText primary="Dashboard"/>
                  </ListItem>
              </List>
          </Drawer>
          <ListComponent />
    </>
  )
}

export default App
