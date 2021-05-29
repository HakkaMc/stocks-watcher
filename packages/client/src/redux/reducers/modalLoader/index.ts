import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ModalLoader } from '../../../types/redux/modalLoader'

const initialState: ModalLoader = {
  ids: []
}

export const modalLoader = createSlice({
  initialState,
  name: 'MODAL_LOADER',
  reducers: {
    show: {
      prepare: (id: string | undefined) => {
        return {
          payload: {
            id: id || Date.now().toString()
          }
        }
      },
      reducer: (state, { payload }: PayloadAction<{ id: string }>) => {
        if (!state.ids.find((item) => item === payload.id)) {
          state.ids.push(payload.id)
        }
      }
    },
    close: (state, { payload }: PayloadAction<string>) => {
      state.ids = state.ids.filter((id) => id !== payload)
    }
  }
})
