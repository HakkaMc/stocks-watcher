import { createSlice } from '@reduxjs/toolkit'
import { App } from '../../../types/redux/app'

const initialState: App = {
  appReady: false
}

export const app = createSlice({
  initialState,
  name: 'APP',
  reducers: {
    setAppReady: (state) => {
      state.appReady = true
    }
  }
})
