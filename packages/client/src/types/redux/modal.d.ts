import { ModalPriority, ModalRoutes } from '../../constants'

export type ModalConfig = {
  priority: ModalPriority
  id: string
  name: ModalRoutes
  props: Record<string, any>
}

export type Modal = {
  map: {
    [id: string]: ModalConfig
  }
}
