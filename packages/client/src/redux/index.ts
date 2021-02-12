import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { useSelector as useReduxSelector, TypedUseSelectorHook } from 'react-redux'

import { app } from './reducers/app'
import { user } from './reducers/user'
import { modal } from './reducers/modal'

export const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  middleware: [...getDefaultMiddleware(), sagaMiddleware] as const,
  reducer: {
    app: app.reducer,
    user: user.reducer,
    modal: modal.reducer
  }
})

export const actions = {
  app: app.actions,
  user: user.actions,
  modal: modal.actions
}

// export const dispatchers: typeof actions & {[x:string]: any} = {...actions}

const tmpDispatchers:any = {}
const tmpActions:any = actions
Object.keys(tmpActions).forEach((key) => {
  tmpDispatchers[key] = {}

  Object.keys(tmpActions[key]).forEach((dispatcherName: string) => {
    const action = tmpActions[key][dispatcherName]
    tmpDispatchers[key][dispatcherName] = (...params: any) => {
      return store.dispatch(action(...params))
    }
  })
})

export const dispatchers: typeof actions = tmpDispatchers


export type ReduxState = ReturnType<typeof store.getState>

export const useTypedSelector: TypedUseSelectorHook<ReduxState> = useReduxSelector
