export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  Date: any
  JSON: any
  MongoID: any
  /** The string representation of JavaScript regexp. You may provide it with flags "/^abc.*\/i" or without flags like "^abc.*". More info about RegExp characters and flags: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions */
  RegExpAsString: any
}

export type BinanceAccountInformation = {
  __typename?: 'BinanceAccountInformation'
  makerCommission: Scalars['Float']
  takerCommission: Scalars['Float']
  buyerCommission: Scalars['Float']
  sellerCommission: Scalars['Float']
  canTrade: Scalars['Boolean']
  canWithdraw: Scalars['Boolean']
  canDeposit: Scalars['Boolean']
  updateTime: Scalars['Float']
  accountType: Scalars['String']
  balances: Array<BinanceBalance>
  permissions: Array<Scalars['String']>
}

export type BinanceBalance = {
  __typename?: 'BinanceBalance'
  asset: Scalars['String']
  free: Scalars['Float']
  locked: Scalars['Float']
}

export type BinanceBalanceUpdate = {
  __typename?: 'BinanceBalanceUpdate'
  asset: Scalars['String']
  delta: Scalars['Float']
  eventTime: Scalars['Int']
  clearTime: Scalars['Int']
}

export type BinanceLastPrice = {
  __typename?: 'BinanceLastPrice'
  symbol: Scalars['String']
  ask: Scalars['Float']
  bid: Scalars['Float']
  middle: Scalars['Float']
  diff: Scalars['Float']
  diffPercentage: Scalars['Float']
  timestamp: Scalars['Float']
}

export type BinanceOcoOrderUpdate = {
  __typename?: 'BinanceOcoOrderUpdate'
  symbol: Scalars['String']
  eventTime: Scalars['Int']
  transactionTime: Scalars['Int']
}

export type BinanceOrder = {
  __typename?: 'BinanceOrder'
  symbol: Scalars['String']
  orderId: Scalars['Float']
  orderListId: Scalars['Float']
  clientOrderId: Scalars['String']
  price: Scalars['Float']
  origQty: Scalars['Float']
  executedQty: Scalars['Float']
  cummulativeQuoteQty: Scalars['Float']
  status: Scalars['String']
  timeInForce: Scalars['String']
  type: Scalars['String']
  side: Scalars['String']
  stopPrice: Scalars['Float']
  icebergQty: Scalars['Float']
  time: Scalars['Float']
  updateTime: Scalars['Float']
  isWorking: Scalars['Boolean']
  origQuoteOrderQty: Scalars['Float']
}

export type BinanceProfile = {
  __typename?: 'BinanceProfile'
  user?: Maybe<Scalars['MongoID']>
  lastBalanceHash?: Maybe<Scalars['String']>
  lastBalanceData?: Maybe<Scalars['JSON']>
  countedBalance: Array<Maybe<BinanceProfileCountedBalance>>
  _id: Scalars['MongoID']
  updatedAt?: Maybe<Scalars['Date']>
  createdAt?: Maybe<Scalars['Date']>
}

export type BinanceProfileCountedBalance = {
  __typename?: 'BinanceProfileCountedBalance'
  asset: Scalars['String']
  quantity: Scalars['Float']
  amount: Scalars['Float']
  averagePurchasePrice: Scalars['Float']
  realizedProfit: Scalars['Float']
  lastTradeTimestamp: Scalars['Float']
  _id?: Maybe<Scalars['MongoID']>
}

export type BinanceSymbol = {
  __typename?: 'BinanceSymbol'
  symbol: Scalars['String']
  status: Scalars['String']
  baseAsset: Scalars['String']
  baseAssetPrecision: Scalars['Float']
  quoteAsset: Scalars['String']
  quotePrecision: Scalars['Float']
  quoteAssetPrecision: Scalars['Float']
  orderTypes: Array<Maybe<Scalars['String']>>
  icebergAllowed: Scalars['Boolean']
  ocoAllowed: Scalars['Boolean']
  isSpotTradingAllowed: Scalars['Boolean']
  isMarginTradingAllowed: Scalars['Boolean']
  filters?: Maybe<Scalars['JSON']>
  permissions: Array<Maybe<Scalars['String']>>
  _id: Scalars['MongoID']
  updatedAt?: Maybe<Scalars['Date']>
  createdAt?: Maybe<Scalars['Date']>
}

export type BinanceTrade = {
  __typename?: 'BinanceTrade'
  user?: Maybe<Scalars['MongoID']>
  baseAsset: Scalars['String']
  quoteAsset: Scalars['String']
  symbol: Scalars['String']
  tradeId: Scalars['Float']
  orderId: Scalars['Float']
  orderListId: Scalars['Float']
  price: Scalars['Float']
  qty: Scalars['Float']
  quoteQty: Scalars['Float']
  commission: Scalars['Float']
  commissionAsset: Scalars['String']
  time: Scalars['Float']
  isBuyer: Scalars['Boolean']
  isMaker: Scalars['Boolean']
  isBestMatch: Scalars['Boolean']
  _id: Scalars['MongoID']
  updatedAt?: Maybe<Scalars['Date']>
  createdAt?: Maybe<Scalars['Date']>
}

export type CancelBinanceOrder = {
  __typename?: 'CancelBinanceOrder'
  symbol: Scalars['String']
  origClientOrderId: Scalars['String']
  orderId: Scalars['Int']
  orderListId: Scalars['Int']
  clientOrderId: Scalars['String']
  price: Scalars['Float']
  origQty: Scalars['Float']
  executedQty: Scalars['Float']
  cummulativeQuoteQty: Scalars['Float']
  status: Scalars['String']
  timeInForce: Scalars['String']
  type: Scalars['String']
  side: Scalars['String']
}

export type ChartGroup = {
  __typename?: 'ChartGroup'
  user?: Maybe<Scalars['MongoID']>
  name: Scalars['String']
  layout: EnumChartGroupLayout
  charts: Array<Maybe<ChartGroupCharts>>
  _id: Scalars['MongoID']
}

export type ChartGroupCharts = {
  __typename?: 'ChartGroupCharts'
  symbol: Scalars['String']
  order: Scalars['Float']
  range: Scalars['JSON']
  _id?: Maybe<Scalars['MongoID']>
  symbolData?: Maybe<symbol>
}

export type CreateOneOrderInput = {
  type: Scalars['String']
  symbol: Scalars['String']
  exchange: Scalars['String']
  activateOnPrice: Scalars['Float']
  sellOnPrice: Scalars['Float']
  priceType: Scalars['String']
  quantityType: Scalars['String']
  quantity: Scalars['Float']
  quoteOrderQty: Scalars['Float']
  percent: Scalars['Float']
  meta?: Maybe<Scalars['JSON']>
}

export type CreateOneOrderPayload = {
  __typename?: 'CreateOneOrderPayload'
  recordId?: Maybe<Scalars['MongoID']>
  record?: Maybe<Order>
  error?: Maybe<ErrorInterface>
}

export type DailyChangeIndicator = {
  __typename?: 'DailyChangeIndicator'
  sum: Scalars['Float']
  days?: Maybe<Array<Maybe<DailyChangeIndicatorDay>>>
}

export type DailyChangeIndicatorDay = {
  __typename?: 'DailyChangeIndicatorDay'
  date: Scalars['String']
  value: Scalars['Float']
}

export type Dashboard = {
  __typename?: 'Dashboard'
  user?: Maybe<Scalars['MongoID']>
  watchlists: Array<Maybe<DashboardWatchlists>>
  _id: Scalars['MongoID']
  updatedAt?: Maybe<Scalars['Date']>
  createdAt?: Maybe<Scalars['Date']>
}

export type DashboardWatchlists = {
  __typename?: 'DashboardWatchlists'
  name: Scalars['String']
  symbols: Array<Maybe<Scalars['String']>>
  hidden: Scalars['Boolean']
  _id?: Maybe<Scalars['MongoID']>
  symbolsData?: Maybe<Array<Maybe<symbol>>>
}

export enum EnumChartGroupLayout {
  Vertical = 'vertical',
  Grid = 'grid'
}

export type ErrorInterface = {
  message?: Maybe<Scalars['String']>
}

export type FilterFindManyBinanceSymbolInput = {
  symbol?: Maybe<Scalars['String']>
  status?: Maybe<Scalars['String']>
  baseAsset?: Maybe<Scalars['String']>
  baseAssetPrecision?: Maybe<Scalars['Float']>
  quoteAsset?: Maybe<Scalars['String']>
  quotePrecision?: Maybe<Scalars['Float']>
  quoteAssetPrecision?: Maybe<Scalars['Float']>
  orderTypes?: Maybe<Array<Maybe<Scalars['String']>>>
  icebergAllowed?: Maybe<Scalars['Boolean']>
  ocoAllowed?: Maybe<Scalars['Boolean']>
  isSpotTradingAllowed?: Maybe<Scalars['Boolean']>
  isMarginTradingAllowed?: Maybe<Scalars['Boolean']>
  filters?: Maybe<Scalars['JSON']>
  permissions?: Maybe<Array<Maybe<Scalars['String']>>>
  _id?: Maybe<Scalars['MongoID']>
  updatedAt?: Maybe<Scalars['Date']>
  createdAt?: Maybe<Scalars['Date']>
  _operators?: Maybe<FilterFindManyBinanceSymbolOperatorsInput>
  OR?: Maybe<Array<FilterFindManyBinanceSymbolInput>>
  AND?: Maybe<Array<FilterFindManyBinanceSymbolInput>>
}

export type FilterFindManyBinanceSymbolOperatorsInput = {
  _id?: Maybe<FilterFindManyBinanceSymbol_IdOperatorsInput>
}

export type FilterFindManyBinanceSymbol_IdOperatorsInput = {
  gt?: Maybe<Scalars['MongoID']>
  gte?: Maybe<Scalars['MongoID']>
  lt?: Maybe<Scalars['MongoID']>
  lte?: Maybe<Scalars['MongoID']>
  ne?: Maybe<Scalars['MongoID']>
  in?: Maybe<Array<Maybe<Scalars['MongoID']>>>
  nin?: Maybe<Array<Maybe<Scalars['MongoID']>>>
  exists?: Maybe<Scalars['Boolean']>
}

export type FilterFindManyBinanceTradeInput = {
  user?: Maybe<Scalars['MongoID']>
  baseAsset?: Maybe<Scalars['String']>
  quoteAsset?: Maybe<Scalars['String']>
  symbol?: Maybe<Scalars['String']>
  tradeId?: Maybe<Scalars['Float']>
  orderId?: Maybe<Scalars['Float']>
  orderListId?: Maybe<Scalars['Float']>
  price?: Maybe<Scalars['Float']>
  qty?: Maybe<Scalars['Float']>
  quoteQty?: Maybe<Scalars['Float']>
  commission?: Maybe<Scalars['Float']>
  commissionAsset?: Maybe<Scalars['String']>
  time?: Maybe<Scalars['Float']>
  isBuyer?: Maybe<Scalars['Boolean']>
  isMaker?: Maybe<Scalars['Boolean']>
  isBestMatch?: Maybe<Scalars['Boolean']>
  _id?: Maybe<Scalars['MongoID']>
  updatedAt?: Maybe<Scalars['Date']>
  createdAt?: Maybe<Scalars['Date']>
  _operators?: Maybe<FilterFindManyBinanceTradeOperatorsInput>
  OR?: Maybe<Array<FilterFindManyBinanceTradeInput>>
  AND?: Maybe<Array<FilterFindManyBinanceTradeInput>>
}

export type FilterFindManyBinanceTradeOperatorsInput = {
  _id?: Maybe<FilterFindManyBinanceTrade_IdOperatorsInput>
}

export type FilterFindManyBinanceTrade_IdOperatorsInput = {
  gt?: Maybe<Scalars['MongoID']>
  gte?: Maybe<Scalars['MongoID']>
  lt?: Maybe<Scalars['MongoID']>
  lte?: Maybe<Scalars['MongoID']>
  ne?: Maybe<Scalars['MongoID']>
  in?: Maybe<Array<Maybe<Scalars['MongoID']>>>
  nin?: Maybe<Array<Maybe<Scalars['MongoID']>>>
  exists?: Maybe<Scalars['Boolean']>
}

export type FilterFindManyOrderInput = {
  active?: Maybe<Scalars['Boolean']>
  user?: Maybe<Scalars['MongoID']>
  type?: Maybe<Scalars['String']>
  symbol?: Maybe<Scalars['String']>
  exchange?: Maybe<Scalars['String']>
  activateOnPrice?: Maybe<Scalars['Float']>
  sellOnPrice?: Maybe<Scalars['Float']>
  priceType?: Maybe<Scalars['String']>
  quantityType?: Maybe<Scalars['String']>
  quantity?: Maybe<Scalars['Float']>
  quoteOrderQty?: Maybe<Scalars['Float']>
  activatedTimestamp?: Maybe<Scalars['Float']>
  percent?: Maybe<Scalars['Float']>
  meta?: Maybe<Scalars['JSON']>
  _id?: Maybe<Scalars['MongoID']>
  updatedAt?: Maybe<Scalars['Date']>
  createdAt?: Maybe<Scalars['Date']>
  _operators?: Maybe<FilterFindManyOrderOperatorsInput>
  OR?: Maybe<Array<FilterFindManyOrderInput>>
  AND?: Maybe<Array<FilterFindManyOrderInput>>
}

export type FilterFindManyOrderOperatorsInput = {
  _id?: Maybe<FilterFindManyOrder_IdOperatorsInput>
}

export type FilterFindManyOrder_IdOperatorsInput = {
  gt?: Maybe<Scalars['MongoID']>
  gte?: Maybe<Scalars['MongoID']>
  lt?: Maybe<Scalars['MongoID']>
  lte?: Maybe<Scalars['MongoID']>
  ne?: Maybe<Scalars['MongoID']>
  in?: Maybe<Array<Maybe<Scalars['MongoID']>>>
  nin?: Maybe<Array<Maybe<Scalars['MongoID']>>>
  exists?: Maybe<Scalars['Boolean']>
}

export type FilterFindManySymbolDescriptionOperatorsInput = {
  gt?: Maybe<Scalars['String']>
  gte?: Maybe<Scalars['String']>
  lt?: Maybe<Scalars['String']>
  lte?: Maybe<Scalars['String']>
  ne?: Maybe<Scalars['String']>
  in?: Maybe<Array<Maybe<Scalars['String']>>>
  nin?: Maybe<Array<Maybe<Scalars['String']>>>
  regex?: Maybe<Scalars['RegExpAsString']>
  exists?: Maybe<Scalars['Boolean']>
}

export type FilterFindManySymbolDisplaySymbolOperatorsInput = {
  gt?: Maybe<Scalars['String']>
  gte?: Maybe<Scalars['String']>
  lt?: Maybe<Scalars['String']>
  lte?: Maybe<Scalars['String']>
  ne?: Maybe<Scalars['String']>
  in?: Maybe<Array<Maybe<Scalars['String']>>>
  nin?: Maybe<Array<Maybe<Scalars['String']>>>
  regex?: Maybe<Scalars['RegExpAsString']>
  exists?: Maybe<Scalars['Boolean']>
}

export type FilterFindManySymbolInput = {
  description?: Maybe<Scalars['String']>
  displaySymbol?: Maybe<Scalars['String']>
  symbol?: Maybe<Scalars['String']>
  type?: Maybe<Scalars['String']>
  currency?: Maybe<Scalars['String']>
  _id?: Maybe<Scalars['MongoID']>
  updatedAt?: Maybe<Scalars['Date']>
  createdAt?: Maybe<Scalars['Date']>
  _operators?: Maybe<FilterFindManySymbolOperatorsInput>
  OR?: Maybe<Array<FilterFindManySymbolInput>>
  AND?: Maybe<Array<FilterFindManySymbolInput>>
  search?: Maybe<Scalars['String']>
}

export type FilterFindManySymbolOperatorsInput = {
  description?: Maybe<FilterFindManySymbolDescriptionOperatorsInput>
  displaySymbol?: Maybe<FilterFindManySymbolDisplaySymbolOperatorsInput>
  symbol?: Maybe<FilterFindManySymbolSymbolOperatorsInput>
  _id?: Maybe<FilterFindManySymbol_IdOperatorsInput>
}

export type FilterFindManySymbolSymbolOperatorsInput = {
  gt?: Maybe<Scalars['String']>
  gte?: Maybe<Scalars['String']>
  lt?: Maybe<Scalars['String']>
  lte?: Maybe<Scalars['String']>
  ne?: Maybe<Scalars['String']>
  in?: Maybe<Array<Maybe<Scalars['String']>>>
  nin?: Maybe<Array<Maybe<Scalars['String']>>>
  regex?: Maybe<Scalars['RegExpAsString']>
  exists?: Maybe<Scalars['Boolean']>
}

export type FilterFindManySymbol_IdOperatorsInput = {
  gt?: Maybe<Scalars['MongoID']>
  gte?: Maybe<Scalars['MongoID']>
  lt?: Maybe<Scalars['MongoID']>
  lte?: Maybe<Scalars['MongoID']>
  ne?: Maybe<Scalars['MongoID']>
  in?: Maybe<Array<Maybe<Scalars['MongoID']>>>
  nin?: Maybe<Array<Maybe<Scalars['MongoID']>>>
  exists?: Maybe<Scalars['Boolean']>
}

export type FilterFindOneBinanceProfileCountedBalanceInput = {
  asset?: Maybe<Scalars['String']>
  quantity?: Maybe<Scalars['Float']>
  amount?: Maybe<Scalars['Float']>
  averagePurchasePrice?: Maybe<Scalars['Float']>
  realizedProfit?: Maybe<Scalars['Float']>
  lastTradeTimestamp?: Maybe<Scalars['Float']>
  _id?: Maybe<Scalars['MongoID']>
}

export type FilterFindOneBinanceProfileInput = {
  user?: Maybe<Scalars['MongoID']>
  lastBalanceHash?: Maybe<Scalars['String']>
  lastBalanceData?: Maybe<Scalars['JSON']>
  countedBalance?: Maybe<Array<Maybe<FilterFindOneBinanceProfileCountedBalanceInput>>>
  _id?: Maybe<Scalars['MongoID']>
  updatedAt?: Maybe<Scalars['Date']>
  createdAt?: Maybe<Scalars['Date']>
  _operators?: Maybe<FilterFindOneBinanceProfileOperatorsInput>
  OR?: Maybe<Array<FilterFindOneBinanceProfileInput>>
  AND?: Maybe<Array<FilterFindOneBinanceProfileInput>>
}

export type FilterFindOneBinanceProfileOperatorsInput = {
  _id?: Maybe<FilterFindOneBinanceProfile_IdOperatorsInput>
}

export type FilterFindOneBinanceProfile_IdOperatorsInput = {
  gt?: Maybe<Scalars['MongoID']>
  gte?: Maybe<Scalars['MongoID']>
  lt?: Maybe<Scalars['MongoID']>
  lte?: Maybe<Scalars['MongoID']>
  ne?: Maybe<Scalars['MongoID']>
  in?: Maybe<Array<Maybe<Scalars['MongoID']>>>
  nin?: Maybe<Array<Maybe<Scalars['MongoID']>>>
  exists?: Maybe<Scalars['Boolean']>
}

export type GetPrices = {
  __typename?: 'GetPrices'
  priceArray?: Maybe<Array<Maybe<PriceTimestampArray>>>
}

export type GetQuote = {
  __typename?: 'GetQuote'
  openPrice: Scalars['Float']
  highPrice: Scalars['Float']
  lowPrice: Scalars['Float']
  currentPrice: Scalars['Float']
  previousClose: Scalars['Float']
}

export type LastPrice = {
  __typename?: 'LastPrice'
  symbol: Scalars['String']
  price: Scalars['Float']
  timestamp: Scalars['Float']
  volume: Scalars['Float']
}

export type MongoError = ErrorInterface & {
  __typename?: 'MongoError'
  message?: Maybe<Scalars['String']>
  code?: Maybe<Scalars['Int']>
}

export type Mutation = {
  __typename?: 'Mutation'
  saveSymbolToDashboard?: Maybe<Scalars['String']>
  changeSymbolWatchlist?: Maybe<Scalars['String']>
  changeWatchlistSettings?: Maybe<Scalars['String']>
  createWatchlist?: Maybe<Scalars['String']>
  removeSymbolFromDashboard?: Maybe<Scalars['String']>
  createChartGroup?: Maybe<ChartGroup>
  addChartToChartGroup: Scalars['String']
  removeChartFromChartGroup: Scalars['String']
  removeChartGroup: Scalars['String']
  saveNote: Scalars['String']
  setPriceAlert?: Maybe<Scalars['String']>
  removePriceAlert?: Maybe<Scalars['String']>
  setReminder?: Maybe<Scalars['String']>
  removeReminder?: Maybe<Scalars['String']>
  cancelOrder: Scalars['String']
  setOrder?: Maybe<CreateOneOrderPayload>
  setBinanceSellOrder: Scalars['String']
  setBinanceBuyOrder: Scalars['String']
  cancelBinanceOrder: Array<CancelBinanceOrder>
  refreshBinanceTrades: Scalars['String']
}

export type MutationSaveSymbolToDashboardArgs = {
  symbol: Scalars['String']
  watchlist: Scalars['String']
}

export type MutationChangeSymbolWatchlistArgs = {
  symbol: Scalars['String']
  watchlist?: Maybe<Scalars['String']>
  add: Scalars['Boolean']
}

export type MutationChangeWatchlistSettingsArgs = {
  id: Scalars['String']
  hidden?: Maybe<Scalars['Boolean']>
  name?: Maybe<Scalars['String']>
}

export type MutationCreateWatchlistArgs = {
  watchlist: Scalars['String']
}

export type MutationRemoveSymbolFromDashboardArgs = {
  symbol: Scalars['String']
}

export type MutationCreateChartGroupArgs = {
  name: Scalars['String']
}

export type MutationAddChartToChartGroupArgs = {
  chartGroupId: Scalars['String']
  symbol: Scalars['String']
  order: Scalars['Int']
  range: Scalars['String']
}

export type MutationRemoveChartFromChartGroupArgs = {
  chartGroupId: Scalars['String']
  symbol: Scalars['String']
}

export type MutationRemoveChartGroupArgs = {
  chartGroupId: Scalars['String']
}

export type MutationSaveNoteArgs = {
  text: Scalars['String']
}

export type MutationSetPriceAlertArgs = {
  symbol: Scalars['String']
  targetPrice: Scalars['Float']
}

export type MutationRemovePriceAlertArgs = {
  id: Scalars['String']
}

export type MutationSetReminderArgs = {
  title: Scalars['String']
  text?: Maybe<Scalars['String']>
  timestamp: Scalars['Float']
}

export type MutationRemoveReminderArgs = {
  id: Scalars['String']
}

export type MutationCancelOrderArgs = {
  orderId: Scalars['String']
}

export type MutationSetOrderArgs = {
  record: CreateOneOrderInput
}

export type MutationSetBinanceSellOrderArgs = {
  symbol: Scalars['String']
  priceType: Scalars['String']
  price: Scalars['Float']
  quantityType: Scalars['String']
  quantity: Scalars['Float']
  quoteOrderQty: Scalars['Float']
}

export type MutationSetBinanceBuyOrderArgs = {
  symbol: Scalars['String']
  priceType: Scalars['String']
  price: Scalars['Float']
  quantityType: Scalars['String']
  quantity: Scalars['Float']
  quoteOrderQty: Scalars['Float']
}

export type MutationCancelBinanceOrderArgs = {
  symbol: Scalars['String']
  orderId?: Maybe<Scalars['Int']>
  origClientOrderId?: Maybe<Scalars['String']>
}

export type Note = {
  __typename?: 'Note'
  user?: Maybe<Scalars['MongoID']>
  text?: Maybe<Scalars['String']>
  _id: Scalars['MongoID']
  updatedAt?: Maybe<Scalars['Date']>
  createdAt?: Maybe<Scalars['Date']>
}

export type Order = {
  __typename?: 'Order'
  active: Scalars['Boolean']
  user?: Maybe<Scalars['MongoID']>
  type: Scalars['String']
  symbol: Scalars['String']
  exchange: Scalars['String']
  activateOnPrice: Scalars['Float']
  sellOnPrice: Scalars['Float']
  priceType: Scalars['String']
  quantityType: Scalars['String']
  quantity: Scalars['Float']
  quoteOrderQty: Scalars['Float']
  activatedTimestamp: Scalars['Float']
  percent: Scalars['Float']
  meta?: Maybe<Scalars['JSON']>
  _id: Scalars['MongoID']
  updatedAt?: Maybe<Scalars['Date']>
  createdAt?: Maybe<Scalars['Date']>
}

export type PriceAlert = {
  __typename?: 'PriceAlert'
  user?: Maybe<Scalars['MongoID']>
  symbol: Scalars['String']
  targetPrice: Scalars['Float']
  actualPrice: Scalars['Float']
  notifiedTimestamp: Scalars['Float']
  _id: Scalars['MongoID']
  updatedAt?: Maybe<Scalars['Date']>
  createdAt?: Maybe<Scalars['Date']>
}

export type PriceTimestampArray = {
  __typename?: 'PriceTimestampArray'
  price: Scalars['Float']
  timestamp: Scalars['Float']
}

export type Query = {
  __typename?: 'Query'
  findSymbols: Array<symbol>
  getDashboard?: Maybe<Dashboard>
  getDailyChangeIndicator?: Maybe<DailyChangeIndicator>
  getQuote?: Maybe<GetQuote>
  getPrices?: Maybe<GetPrices>
  getChartGroups?: Maybe<Array<Maybe<ChartGroup>>>
  getChartGroup?: Maybe<ChartGroup>
  getNote?: Maybe<Note>
  getPriceAlerts?: Maybe<Array<Maybe<PriceAlert>>>
  getReminders?: Maybe<Array<Maybe<Reminder>>>
  getBinanceAccountInformation?: Maybe<BinanceAccountInformation>
  getBinanceOrders: Array<BinanceOrder>
  getBinanceCachedLastPrice: BinanceLastPrice
  getOrders: Array<Order>
  getBinanceTrades: Array<BinanceTrade>
  getBinanceSymbols: Array<BinanceSymbol>
  getBinanceProfile?: Maybe<BinanceProfile>
}

export type QueryFindSymbolsArgs = {
  filter?: Maybe<FilterFindManySymbolInput>
  skip?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
  sort?: Maybe<SortFindManySymbolInput>
}

export type QueryGetDailyChangeIndicatorArgs = {
  symbol?: Maybe<Scalars['String']>
}

export type QueryGetQuoteArgs = {
  symbol?: Maybe<Scalars['String']>
}

export type QueryGetPricesArgs = {
  symbol: Scalars['String']
  timestampFrom?: Maybe<Scalars['Float']>
  timestampTo?: Maybe<Scalars['Float']>
  range?: Maybe<Scalars['String']>
}

export type QueryGetChartGroupArgs = {
  chartGroupId: Scalars['String']
}

export type QueryGetPriceAlertsArgs = {
  symbol: Scalars['String']
}

export type QueryGetBinanceCachedLastPriceArgs = {
  symbol: Scalars['String']
}

export type QueryGetOrdersArgs = {
  filter?: Maybe<FilterFindManyOrderInput>
  skip?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
  sort?: Maybe<SortFindManyOrderInput>
}

export type QueryGetBinanceTradesArgs = {
  filter?: Maybe<FilterFindManyBinanceTradeInput>
  skip?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
  sort?: Maybe<SortFindManyBinanceTradeInput>
}

export type QueryGetBinanceSymbolsArgs = {
  filter?: Maybe<FilterFindManyBinanceSymbolInput>
  skip?: Maybe<Scalars['Int']>
  limit?: Maybe<Scalars['Int']>
  sort?: Maybe<SortFindManyBinanceSymbolInput>
}

export type QueryGetBinanceProfileArgs = {
  filter?: Maybe<FilterFindOneBinanceProfileInput>
  skip?: Maybe<Scalars['Int']>
  sort?: Maybe<SortFindOneBinanceProfileInput>
}

export type Reminder = {
  __typename?: 'Reminder'
  user?: Maybe<Scalars['MongoID']>
  title: Scalars['String']
  text?: Maybe<Scalars['String']>
  timestamp: Scalars['Float']
  active: Scalars['Boolean']
  _id: Scalars['MongoID']
  updatedAt?: Maybe<Scalars['Date']>
  createdAt?: Maybe<Scalars['Date']>
}

export type RuntimeError = ErrorInterface & {
  __typename?: 'RuntimeError'
  message?: Maybe<Scalars['String']>
}

export enum SortFindManyBinanceSymbolInput {
  IdAsc = '_ID_ASC',
  IdDesc = '_ID_DESC'
}

export enum SortFindManyBinanceTradeInput {
  IdAsc = '_ID_ASC',
  IdDesc = '_ID_DESC',
  TimeAsc = 'TIME_ASC',
  TimeDesc = 'TIME_DESC'
}

export enum SortFindManyOrderInput {
  IdAsc = '_ID_ASC',
  IdDesc = '_ID_DESC',
  CreatedAsc = 'CREATED_ASC',
  CreatedDesc = 'CREATED_DESC'
}

export enum SortFindManySymbolInput {
  IdAsc = '_ID_ASC',
  IdDesc = '_ID_DESC',
  DescriptionAsc = 'DESCRIPTION_ASC',
  DescriptionDesc = 'DESCRIPTION_DESC',
  DisplaysymbolAsc = 'DISPLAYSYMBOL_ASC',
  DisplaysymbolDesc = 'DISPLAYSYMBOL_DESC',
  SymbolAsc = 'SYMBOL_ASC',
  SymbolDesc = 'SYMBOL_DESC'
}

export enum SortFindOneBinanceProfileInput {
  IdAsc = '_ID_ASC',
  IdDesc = '_ID_DESC'
}

export type Subscription = {
  __typename?: 'Subscription'
  lastPrice?: Maybe<LastPrice>
  binanceLastPrice: BinanceLastPrice
  binanceBalanceUpdate?: Maybe<BinanceBalanceUpdate>
  binanceOrderUpdate: Scalars['Int']
  binanceOcoOrderUpdate?: Maybe<BinanceOcoOrderUpdate>
}

export type SubscriptionLastPriceArgs = {
  symbol?: Maybe<Scalars['String']>
}

export type SubscriptionBinanceLastPriceArgs = {
  symbol?: Maybe<Scalars['String']>
}

export type Symbol = {
  __typename?: 'Symbol'
  description: Scalars['String']
  displaySymbol: Scalars['String']
  symbol: Scalars['String']
  type: Scalars['String']
  currency?: Maybe<Scalars['String']>
  _id: Scalars['MongoID']
  updatedAt?: Maybe<Scalars['Date']>
  createdAt?: Maybe<Scalars['Date']>
}

export type ValidationError = ErrorInterface & {
  __typename?: 'ValidationError'
  message?: Maybe<Scalars['String']>
  errors?: Maybe<Array<ValidatorError>>
}

export type ValidatorError = {
  __typename?: 'ValidatorError'
  message?: Maybe<Scalars['String']>
  path?: Maybe<Scalars['String']>
  value?: Maybe<Scalars['JSON']>
  idx: Scalars['Int']
}
