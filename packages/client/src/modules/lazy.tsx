import React from 'react'

export const appLazyPreload = (): Promise<any> =>
  new Promise((resolve, reject) => {
    return import(/* webpackChunkName: "App" */ './App/App').then(
      (response: any) => resolve({ default: response.App }),
      (error) => reject(error)
    )
  })

export const AppLazy = React.lazy(appLazyPreload)

export const BinanceLazy = React.lazy(
  (): Promise<any> =>
    new Promise((resolve, reject) => {
      return import(/* webpackChunkName: "BinancePortfolio" */ './BinancePortfolio/BinancePortfolio').then(
        (response: any) => resolve({ default: response.BinancePortfolio }),
        (error) => reject(error)
      )
    })
)

export const OrdersLazy = React.lazy(
  (): Promise<any> =>
    new Promise((resolve, reject) => {
      return import(/* webpackChunkName: "Orders" */ './Orders/Orders').then(
        (response: any) => resolve({ default: response.Orders }),
        (error) => reject(error)
      )
    })
)

export const DashboardLazy = React.lazy(
  (): Promise<any> =>
    new Promise((resolve, reject) => {
      return import(/* webpackChunkName: "Dashboard" */ './Dashboard/Dashboard').then(
        (response: any) => resolve({ default: response.Dashboard }),
        (error) => reject(error)
      )
    })
)

export const chartGroupViewPreload = (): Promise<any> =>
  new Promise((resolve, reject) => {
    return import(/* webpackChunkName: "ChartGroupView" */ './ChartGroupView/ChartGroupView').then(
      (response: any) => resolve({ default: response.ChartGroupView }),
      (error) => reject(error)
    )
  })

export const ChartGroupViewLazy = React.lazy(chartGroupViewPreload)

export const ChartGroupsLazy = React.lazy(
  (): Promise<any> =>
    new Promise((resolve, reject) => {
      return import(/* webpackChunkName: "ChartGroups" */ './ChartGroups/ChartGroups').then(
        (response: any) => resolve({ default: response.ChartGroups }),
        (error) => reject(error)
      )
    })
)
