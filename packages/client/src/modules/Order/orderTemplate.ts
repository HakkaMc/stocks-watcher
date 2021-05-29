import { CreateOneOrderInput } from '../../types/graphql/generated/globalTypes'

export const orderTemplate: CreateOneOrderInput = {
  activateOnPrice: -1,
  exchange: 'BINANCE',
  percent: -1,
  priceType: 'NA',
  quantity: -1,
  quantityType: 'NA',
  quoteOrderQty: -1,
  sellOnPrice: -1,
  symbol: 'NA',
  type: 'NA'
}
