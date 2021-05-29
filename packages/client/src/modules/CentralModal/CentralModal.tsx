import React, { useEffect, useState } from 'react'
import { useTypedSelector } from '../../redux'
import { ModalRoutes } from '../../constants'
import { BinanceOrder } from '../BinanceOrder/BinanceOrder'
import { Reminder } from '../Reminder/Reminder'
import { Note } from '../Note/Note'
import { Modal } from '../../components'
import { Order } from '../Order/Order'

const getComponent = (name: ModalRoutes): any => {
  switch (name) {
    case ModalRoutes.BinanceOrder:
      return BinanceOrder

    case ModalRoutes.Reminder:
      return Reminder

    case ModalRoutes.Note:
      return Note

    case ModalRoutes.Order:
      return Order

    default:
      return () => <div />
  }
}

export const CentralModal = () => {
  const modalMap = useTypedSelector((state) => state.modal.map)

  const [modalArray, setModalArray] = useState<
    Array<{ name: ModalRoutes; props: Record<string, any>; open: boolean; id: string }>
  >([])

  useEffect(() => {
    const openedModals = new Set()

    const array = Object.entries(modalMap).map(([id, config]) => {
      openedModals.add(id)

      return {
        name: config.name,
        props: config.props,
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

  console.log('central modal: ', modalArray)

  return (
    <>
      {modalArray.map((config) => {
        const Component = getComponent(config.name)

        return (
          <Modal open={config.open} key={config.id}>
            <Component {...config.props} id={config.id} />
          </Modal>
        )
      })}
    </>
  )
}
