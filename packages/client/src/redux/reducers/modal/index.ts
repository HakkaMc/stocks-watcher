import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ModalPriority, ModalRoutes } from '../../../constants'
import { Modal } from '../../../types/redux/modal'

const initialState: Modal = {
  map: {}
}

export const modal = createSlice({
  initialState,
  name: 'MODAL',
  reducers: {
    open: (state, { payload }: PayloadAction<{ name: ModalRoutes; props?: Record<string, any> }>) => {
      const modalId = `MODAL_${Date.now()}`
      state.map[modalId] = {
        id: modalId,
        name: payload.name,
        props: payload.props || {},
        priority: ModalPriority.Normal
      }
    },
    close: (state, { payload }: PayloadAction<string>) => {
      const modalId = payload
      delete state.map[modalId]
    }
  }
})
