import { all, call, cancel, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import { actions, sagaMiddleware } from './index'
import * as userSagas from './reducers/user/sagas'

const sagas = {
  user: userSagas
}

// TODO - add error handler
export function* prepareSagas(): Generator {
  const watch = (action: Record<string, any>, saga: any) => takeLatest(action.toString(), saga)

  const sagasToInit = [
    [actions.user.setDashboardSelectedSymbols, sagas.user.setDashboardSelectedSymbols],
    // [actions.user.getUserProfile, sagas.user.getUserProfile]
  ]
  yield all(sagasToInit.map(([action, saga, api]) => watch(action, saga)))
}

export function* rootSaga() {
  yield fork(prepareSagas)

  // yield call(sagas.user.setDashboardSelectedSymbols)
  // yield call(sagas.user.getUserProfile)

  yield put(actions.app.setAppReady())
}

export const initSagas = () => sagaMiddleware.run(rootSaga)
