import React, { ReactElement, Suspense } from 'react'
import { IconButton, Box } from '@material-ui/core'
import { KeyboardBackspace as KeyboardBackspaceIcon } from '@material-ui/icons'
import { Switch, Route } from 'react-router-dom'
import { grey } from '@material-ui/core/colors'
import { Loader, ScreenLoader } from '../../components'
import { DashboardLazy, ChartGroupsLazy } from '../lazy'
import { CentralModal } from '../CentralModal/CentralModal'
import { NoteModal } from '../NoteModal/NoteModal'
import styles from './styles.module.scss'

import { Menu } from './modules/Menu/Menu'
import {Brokers} from "./modules/Brokers/Brokers";

export const App = () => (
  <>
    <div className={styles.layout}>
      <Box className={styles.leftColumn}>
        <Brokers/>
        <Menu />
      </Box>
      <div className={styles.rightColumn}>
        <Suspense fallback={<Loader />}>
          <Switch>
            <Route path="/app/dashboard" component={DashboardLazy} />
            <Route path="/app/chartgroups" component={ChartGroupsLazy} />
          </Switch>
        </Suspense>
      </div>
    </div>
    <NoteModal />
    <CentralModal />
  </>
)
