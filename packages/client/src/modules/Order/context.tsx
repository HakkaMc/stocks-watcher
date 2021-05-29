import React, { createContext } from 'react'

export const OrderContext = createContext({
  asset: '',
  symbol: '',
  setAsset: (asset: string) => undefined
})
