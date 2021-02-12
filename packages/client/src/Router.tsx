import React, { useMemo, Suspense } from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { AppLazy, ChartGroupViewLazy } from './modules/lazy'
import { Login } from './modules/Login/Login'
import { LoginDone } from './modules/LoginDone/LoginDone'
import { useRedux } from './redux/useRedux'
import { ROUTES } from './constants'
import {ScreenLoader} from "./components";

export const Router = () => {
  const { selectedState, dispatchers } = useRedux((state) => state.user)

  const routes = useMemo(() => {
    if (selectedState.authorized) {
      return (
        <>
          <Route path={ROUTES.AUTH_FAIL}>Login failed. Close this window and try it again.</Route>
          <Route path={ROUTES.APP} component={AppLazy}/>
          <Route path={ROUTES.CHART_GROUP_VIEW} component={ChartGroupViewLazy}/>
          <Route exact path="/">
            <Redirect to={ROUTES.DASHBOARD} />
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
        <Suspense fallback={<ScreenLoader/>}>
          <Switch>
            <Route path={ROUTES.AUTH_SUCCESS} component={LoginDone} />
            {routes}
          </Switch>
        </Suspense>
    </BrowserRouter>
  )
}
