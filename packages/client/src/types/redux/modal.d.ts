import { ModalPriority } from '../../constants'

export type ModalConfig = {
  priority: ModalPriority
  id: string
  data: any
}

export type Modal = {
  map: {
    [id: string]: ModalConfig
  },
  routes: Record<ModalRoutes, boolean>
}
