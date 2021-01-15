import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SelectedSymbols, SelectedSymbol, User } from '../../../types/redux/user'

const initialState: User = {
  dashboard: {
    selectedSymbols: []
  }
}

export const user = createSlice({
  initialState,
  name: 'USER',
  reducers: {
    addDashboardSelectedSymbol: (state, { payload }: PayloadAction<SelectedSymbol>) => {
      state.dashboard.selectedSymbols.push(payload)
    },
    setDashboardSelectedSymbols: (state, { payload }: PayloadAction<SelectedSymbols>) => {
      state.dashboard.selectedSymbols = payload
    },
    getUserProfile: () => {}
  }
})
