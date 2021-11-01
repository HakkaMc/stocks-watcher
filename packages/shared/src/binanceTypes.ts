export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP_LOSS = 'STOP_LOSS',
  STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
  TAKE_PROFIT = 'TAKE_PROFIT',
  TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
  LIMIT_MAKER = 'LIMIT_MAKER'
}

export enum OrderStatus {
  NEW = 'NEW',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELED = 'CANCELED',
  PENDING_CANCEL = 'PENDING_CANCEL',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum OcoOrderStatus {
  EXECUTING = 'EXECUTING',
  ALL_DONE = 'ALL_DONE',
  REJECT = 'REJECT'
}

export enum Side {
  SELL = 'SELL',
  BUY = 'BUY'
}

export enum PriceType {
  Market = 'Market',
  Middle = 'Middle',
  Price = 'Price'
}

export enum NewOrderRespType {
  ACK = 'ACK',
  RESULT = 'RESULT',
  FULL = 'FULL'
}

export enum TimeInForce {
  GTC = 'GTC', // Good Til Canceled. An order will be on the book unless the order is canceled.
  IOC = 'IOC', // Immediate Or Cancel. An order will try to fill the order as much as it can before the order expires.
  FOK = 'FOK' // Fill or Kill. An order will expire if the full order cannot be filled upon execution.
}

export enum QuantityType {
  All = 'All',
  QuoteOrderQty = 'QuoteOrderQty', // Amount of USD the user want to buy/sell
  Quantity = 'Quantity' // Amount of the base asset
}

export enum FilterType {
  PRICE_FILTER = 'PRICE_FILTER',
  PERCENT_PRICE = 'PERCENT_PRICE',
  LOT_SIZE = 'LOT_SIZE',
  MIN_NOTIONAL = 'MIN_NOTIONAL',
  ICEBERG_PARTS = 'ICEBERG_PARTS',
  MARKET_LOT_SIZE = 'MARKET_LOT_SIZE',
  MAX_NUM_ORDERS = 'MAX_NUM_ORDERS',
  MAX_NUM_ALGO_ORDERS = 'MAX_NUM_ALGO_ORDERS',
  MAX_NUM_ICEBERG_ORDERS = 'MAX_NUM_ICEBERG_ORDERS',
  MAX_POSITION = 'MAX_POSITION',
  EXCHANGE_MAX_NUM_ORDERS = 'EXCHANGE_MAX_NUM_ORDERS',
  EXCHANGE_MAX_NUM_ALGO_ORDERS = 'EXCHANGE_MAX_NUM_ALGO_ORDERS'
}

export type LotSize = {
  filterType: FilterType
  minQty: number
  maxQty: number
  stepSize: number
}

export type PriceFilter = {
  filterType: FilterType
  minPrice: number
  maxPrice: number
  tickSize: number
}

export type MarketLotSize = {
  filterType: FilterType
  minQty: number
  maxQty: number
  stepSize: number
}

export type PercentPrice = {
  filterType: FilterType
  multiplierUp: number
  multiplierDown: number
  avgPriceMins: number
}

export type MinNotional = {
  filterType: FilterType
  minNotional: number
  applyToMarket: boolean
  avgPriceMins: number
}

export type IcebergParts = {
  filterType: FilterType
  limit: number
}

export type MaxNumOrders = {
  filterType: FilterType
  maxNumOrders: number
}
export type MaxNumAlgoOrders = {
  filterType: FilterType
  maxNumAlgoOrders: number
}

export type NewOrderResponseAck = {
  symbol: string
  orderId: number
  orderListId: number
  clientOrderId: string
  transactTime: number
}

export type NewOrderResponseResult = {
  symbol: string
  orderId: number
  orderListId: number
  clientOrderId: string
  transactTime: number
  price: string
  origQty: string
  executedQty: string
  cummulativeQuoteQty: string
  status: string
  timeInForce: TimeInForce
  type: OrderType
  side: Side
}

export type NewOrderResponseFull = {
  symbol: string
  orderId: number
  orderListId: number
  clientOrderId: string
  transactTime: number
  price: string
  origQty: string
  executedQty: string
  cummulativeQuoteQty: string
  status: OrderStatus
  timeInForce: TimeInForce
  type: OrderType
  side: Side
  fills: Array<{
    price: string
    qty: string
    commission: string
    commissionAsset: string
  }>
}

export type DepositHistory = Array<{
  "amount":string
  "coin":string
  "network":string
  "status":number
  "address":string
  "addressTag":string
  "txId":string
  "insertTime":number
  "transferType":number
  "unlockConfirm":string
  "confirmTimes":string
}>

export type WithdrawHistory = Array<{
  "address": string
  "amount": string
  "applyTime": string
  "coin": string
  "id": string
  "withdrawOrderId": string
  "network": string
  "transferType": number
  "status": number
  "transactionFee": string
  "confirmNo":number
  "txId": string
}>

export type FiatOrderHistory = {
  "code": string
  "message": string
  "data": Array<
    {
      "orderNo":string
      "fiatCurrency": string
      "indicatedAmount": string
      "amount": string
      "totalFee": string
      "method": string
      "status": string  // Processing, Failed, Successful, Finished, Refunding, Refunded, Refund Failed, Order Partial credit Stopped
      "createTime": number
      "updateTime": number
    }
  >
  "total": number
  "success": boolean
}

export type FiatPaymentHistory = {
  "code": string
  "message": string
  "data": Array<{
    "orderNo": string
    "sourceAmount": string
    "fiatCurrency": string
    "obtainAmount": string
    "cryptoCurrency": string
    "totalFee": string
    "price": string
    "status": string
    "createTime": 1624529919000,
    "updateTime": 1624529919000
  }>
  "total": number
  "success": boolean
}

export type UniversalTransferHistory = {
  "total":number
  "rows":Array<
    {
      "asset":string
      "amount":string
      "type":string
      "status": string
      "tranId": number
      "timestamp":number
    }
  >
}
