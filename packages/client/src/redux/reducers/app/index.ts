import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { App } from '../../../types/redux/app'

const initialState: App = {
  appReady: false,
  showNotes: false
}

export const app = createSlice({
  initialState,
  name: 'APP',
  reducers: {
    setAppReady: (state) => {
      console.log('setAppReady')
      state.appReady = true
    },
    toggleShowNotes: (state) => {
      console.log('toggleShowNotes')
      state.showNotes = !state.showNotes
    }
  }
})
