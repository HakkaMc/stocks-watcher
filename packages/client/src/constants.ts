export const API_PREFIX = '/api'
export const REFRESH_AUTH_ENDPOINT = '/auth/refresh'
export const LOGIN_ENDPOINT = '/auth/google/login'
export const LOGOUT_ENDPOINT = '/auth/logout'

export const GRAPHQL_ENDPOINT = '/api/graphql'

export enum ROUTES {
  AuthFail = '/auth/fail',
  AuthSuccess = '/auth/success',
  App = '/app',
  BinancePortfolio = '/app/binance-portfolio',
  Dashboard = '/app/dashboard',
  ChartGroups = '/app/chartgroups',
  ChartGroupView = '/chartgroup/:chartGroupId',
  Orders = '/app/orders',
  Trades = '/app/trades'
}

export enum ModalPriority {
  Low,
  Normal,
  High,
  Error
}

export enum ModalRoutes {
  Note,
  Reminder,
  BinanceOrder,
  BinanceBuyOrder,
  BinanceSellOrder,
  BinanceTrailingStopOrder,
  BinanceMovingBuyOrder,
  Order
}

export enum OrderDialogType {
  BinanceDirectBuy,
  BinanceDirectSell,
  BinanceFixedTrailingStop,
  BinanceMovingTrailingStop,
  BinanceMovingBuy,
  BinanceConsolidation
}
