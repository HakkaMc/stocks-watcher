import { all, call, cancel, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import { actions, sagaMiddleware } from './index'

const sagas = {}

// TODO - add error handler
// export function* prepareSagas(): Generator {
//   const watch = (action: Record<string, any>, saga: any) => takeLatest(action.toString(), saga)

// const sagasToInit = [
// [actions.user.setDashboardSelectedSymbols, sagas.user.setDashboardSelectedSymbols],
// [actions.user.getDashboard, sagas.user.getDashboard]
// ]
// yield all(sagasToInit.map(([action, saga, api]) => watch(action, saga)))
// }

export function* rootSaga() {
  console.log('rootSaga')
  // yield fork(prepareSagas)

  // yield call(sagas.user.setDashboardSelectedSymbols)
  // yield call(sagas.user.getDashboard)

  yield put(actions.app.setAppReady())
}

export const initSagas = () => sagaMiddleware.run(rootSaga)
