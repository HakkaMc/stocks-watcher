import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { useSelector as useReduxSelector, TypedUseSelectorHook } from 'react-redux'

import { app } from './reducers/app'
import { user } from './reducers/user'

export const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  middleware: [...getDefaultMiddleware(), sagaMiddleware] as const,
  reducer: {
    app: app.reducer,
    user: user.reducer
  }
})

export const actions = {
  app: app.actions,
  user: user.actions
}

export const dispatchers = { ...actions }

const tmpDispatchers: Record<string, any> = { ...actions }
Object.keys(tmpDispatchers).forEach((key) => {
  Object.keys(tmpDispatchers[key]).forEach((dispatcherName: string) => {
    const dispatcher = tmpDispatchers[key][dispatcherName]
    tmpDispatchers[key][dispatcherName] = (...params: any) => store.dispatch(dispatcher(...params))
  })
})

export type ReduxState = ReturnType<typeof store.getState>

export const useSelector: TypedUseSelectorHook<ReduxState> = useReduxSelector
