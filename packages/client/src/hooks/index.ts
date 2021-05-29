import { useCallback, useState } from 'react'

import { dispatchers } from '../redux'

export const useModalLoader = () => {
  const [id, setId] = useState(`${Math.random()}_${Date.now()}`)

  const showLoader = useCallback(() => {
    dispatchers.modalLoader.show(id)
  }, [id, setId])

  const hideLoader = useCallback(() => {
    dispatchers.modalLoader.close(id)
  }, [id, setId])

  return {
    loaderId: id,
    showLoader,
    hideLoader
  }
}
