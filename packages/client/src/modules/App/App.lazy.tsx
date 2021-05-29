import React from 'react'

export const appLazyPreload = (): Promise<any> =>
  new Promise((resolve, reject) => {
    return import(/* webpackChunkName: "App" */ './App').then(
      (response: any) => resolve({ default: response.App }),
      (error) => reject(error)
    )
  })

export const AppLazy = React.lazy(appLazyPreload)
