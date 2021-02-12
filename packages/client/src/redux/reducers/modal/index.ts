import { ElementType } from 'react'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ModalPriority } from '../../../constants'
import { Modal } from '../../../types/redux/modal'

const initialState: Modal = {
  map: {}
}

export const modal = createSlice({
  initialState,
  name: 'MODAL',
  reducers: {
    open: (state, { payload }: PayloadAction<ElementType>) => {
      const modalId = `MODAL_${Date.now()}`
      state.map[modalId] = {
        id: modalId,
        data: payload,
        priority: ModalPriority.Normal
      }
    },
    close: (state, { payload }: PayloadAction<string>) => {
      const modalId = payload
      delete state.map[modalId]
    }
  }
})
