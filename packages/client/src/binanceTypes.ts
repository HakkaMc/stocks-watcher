export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP_LOSS = 'STOP_LOSS',
  STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
  TAKE_PROFIT = 'TAKE_PROFIT',
  TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
  LIMIT_MAKER = 'LIMIT_MAKER'
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

export enum QuantityType {
  All = 'All',
  QuoteOrderQty = 'QuoteOrderQty', // Amount of USD the user want to buy/sell
  Quantity = 'Quantity' // Amount of the base asset
}
