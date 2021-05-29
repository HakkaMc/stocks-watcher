import React, { useMemo, Suspense } from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'

import { AppLazy, ChartGroupViewLazy } from './modules/lazy'
import { Login } from './modules/Login/Login'
import { LoginDone } from './modules/LoginDone/LoginDone'
import { ROUTES } from './constants'
import { ScreenLoader } from './components'
import { dispatchers, useTypedSelector } from './redux'

export const Router = () => {
  const selectedState = useTypedSelector((state) => state.user)

  const routes = useMemo(() => {
    if (selectedState.authorized) {
      return (
        <>
          <Route path={ROUTES.AuthFail}>Login failed. Close this window and try it again.</Route>
          <Route path={ROUTES.App} component={AppLazy} />
          <Route path={ROUTES.ChartGroupView} component={ChartGroupViewLazy} />
          <Route exact path="/">
            <Redirect to={ROUTES.Dashboard} />
          </Route>
        </>
      )
    }

    return (
      <Route path="/">
        <Login setAuthorized={dispatchers.user.setAuthorized} />
      </Route>
    )
  }, [selectedState.authorized, dispatchers.user.setAuthorized])

  return (
    <BrowserRouter>
      <Suspense fallback={<ScreenLoader />}>
        <Switch>
          <Route path={ROUTES.AuthSuccess} component={LoginDone} />
          {routes}
        </Switch>
      </Suspense>
    </BrowserRouter>
  )
}
