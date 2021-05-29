import React, { Suspense } from 'react'
import { Box } from '@material-ui/core'
import { Switch, Route } from 'react-router-dom'
import { Loader } from '../../components'
import { BinanceLazy, DashboardLazy, ChartGroupsLazy, OrdersLazy } from '../lazy'
import styles from './styles.module.scss'

import { Menu } from './modules/Menu/Menu'
import { Brokers } from './modules/Brokers/Brokers'
import { ROUTES } from '../../constants'

export const App = () => {
  console.log('render APP')

  return (
    <div className={styles.layout}>
      <Box className={styles.leftColumn}>
        <Brokers />
        <Menu />
      </Box>
      <div className={styles.rightColumn}>
        <Suspense fallback={<Loader />}>
          <Switch>
            <Route path={ROUTES.Dashboard} component={DashboardLazy} />
            <Route path={ROUTES.ChartGroups} component={ChartGroupsLazy} />
            <Route path={ROUTES.BinancePortfolio} component={BinanceLazy} />
            <Route path={ROUTES.Orders} component={OrdersLazy} />
          </Switch>
        </Suspense>
      </div>
    </div>
  )
}
