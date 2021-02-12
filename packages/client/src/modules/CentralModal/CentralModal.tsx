import React, { useEffect, useMemo, useState } from 'react'
import { Modal as ModalComponent } from '@material-ui/core'
import { useRedux } from '../../redux/useRedux'
import { ModalItem } from './modules/ModalItem/ModalItem'
import { ModalConfig } from '../../types/redux/modal'

export const CentralModal = () => {
  const { selectedState: modalMap } = useRedux((state) => state.modal.map)
  const [modalArray, setModalArray] = useState<Array<{ data: any; open: boolean; id: string }>>([])

  useEffect(() => {
    const openedModals = new Set()

    const array = Object.entries(modalMap).map(([id, config]) => {
      openedModals.add(id)

      return {
        data: config.data,
        id: config.id,
        priority: config.priority,
        open: true
      }
    })

    const closedArray = modalArray
      .filter((config) => !openedModals.has(config.id) && config.open)
      .map((config) => ({
        ...config,
        open: false
      }))

    setModalArray([...array, ...closedArray])
  }, [modalMap])

  return (
    <>
      {modalArray.map((config) => (
        <ModalComponent open={config.open}>{config.data}</ModalComponent>
      ))}
    </>
  )
}
