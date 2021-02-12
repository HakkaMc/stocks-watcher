import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '../../../types/redux/user'

const initialState: User = {
  authorized: false
}

export const user = createSlice({
  initialState,
  name: 'USER',
  reducers: {
    setAuthorized: (state, { payload }: PayloadAction<boolean>) => {
      console.log('setAuthorized')
      state.authorized = payload
    }
  }
})
