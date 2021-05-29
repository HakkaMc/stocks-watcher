import { OrderTsType } from '../database/order/schema'
import { pubSub } from '../pubSub'

export type InProcessParams = {
  activated: boolean
  locked: boolean
  order: OrderTsType
  subscribeNumber: number
  destroy: boolean
  specificData: Record<string, any>
}

class InProcess {
  public readonly orderId: string

  public activated = false

  public locked = false

  public order: OrderTsType

  public subscribeNumber = -1

  public destroy = false

  public specificData: Record<string, any> = {}

  private removeCallback: (orderId: string) => void

  constructor(orderId: string, params: InProcessParams, remove: (orderId: string) => void) {
    this.activated = params.activated
    this.locked = params.locked
    this.order = params.order
    this.subscribeNumber = params.subscribeNumber
    this.destroy = params.destroy
    this.specificData = params.specificData
    this.orderId = orderId
    this.removeCallback = remove
  }

  public remove = () => {
    pubSub.unsubscribe(this.subscribeNumber)
    this.removeCallback(this.orderId)
  }
}

const inProcess: Record<string, InProcess> = {}

const exists = (orderId: string) => !!inProcess[orderId]

const add = (orderId: string, data: InProcessParams) => {
  if (!inProcess[orderId]) {
    inProcess[orderId] = new InProcess(orderId, data, remove)
  }

  return inProcess[orderId]
}

const destroy = (orderId: string) => {
  if (inProcess[orderId]) {
    inProcess[orderId].locked = true
    inProcess[orderId].destroy = true

    return inProcess[orderId]
  }

  return null
}

const remove = (orderId: string) => {
  delete inProcess[orderId]
}

export const register = {
  exists,
  add,
  destroy
}
