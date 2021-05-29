export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  JSON: any;
  MongoID: any;
  /** The string representation of JavaScript regexp. You may provide it with flags "/^abc.*\/i" or without flags like "^abc.*". More info about RegExp characters and flags: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions */
  RegExpAsString: any;
};

export type BinanceAccountInformation = {
  __typename?: 'BinanceAccountInformation';
  makerCommission: Scalars['Float'];
  takerCommission: Scalars['Float'];
  buyerCommission: Scalars['Float'];
  sellerCommission: Scalars['Float'];
  canTrade: Scalars['Boolean'];
  canWithdraw: Scalars['Boolean'];
  canDeposit: Scalars['Boolean'];
  updateTime: Scalars['Float'];
  accountType: Scalars['String'];
  balances: Array<BinanceBalance>;
  permissions: Array<Scalars['String']>;
};

export type BinanceBalance = {
  __typename?: 'BinanceBalance';
  asset: Scalars['String'];
  free: Scalars['Float'];
  locked: Scalars['Float'];
};

export type BinanceBalanceUpdate = {
  __typename?: 'BinanceBalanceUpdate';
  asset: Scalars['String'];
  delta: Scalars['Float'];
  eventTime: Scalars['Int'];
  clearTime: Scalars['Int'];
};

export type BinanceExchangeInformation = {
  __typename?: 'BinanceExchangeInformation';
  symbol: Scalars['String'];
  baseAsset: Scalars['String'];
  quoteAsset: Scalars['String'];
  filters: Scalars['JSON'];
  ocoAllowed: Scalars['Boolean'];
};

export type BinanceFill = {
  __typename?: 'BinanceFill';
  price: Scalars['Float'];
  qty: Scalars['Float'];
  commission: Scalars['Float'];
  commissionAsset: Scalars['String'];
};

export type BinanceLastPrice = {
  __typename?: 'BinanceLastPrice';
  symbol: Scalars['String'];
  ask: Scalars['Float'];
  bid: Scalars['Float'];
  middle: Scalars['Float'];
  diff: Scalars['Float'];
  diffPercentage: Scalars['Float'];
  timestamp: Scalars['Float'];
};

export type BinanceNewOrderResponseFull = {
  __typename?: 'BinanceNewOrderResponseFull';
  symbol: Scalars['String'];
  orderId: Scalars['Int'];
  orderListId: Scalars['Int'];
  clientOrderId: Scalars['String'];
  transactTime: Scalars['Float'];
  price: Scalars['String'];
  origQty: Scalars['String'];
  executedQty: Scalars['String'];
  cummulativeQuoteQty: Scalars['String'];
  status: Scalars['String'];
  timeInForce: Scalars['String'];
  type: Scalars['String'];
  side: Scalars['String'];
  fills: Array<BinanceFill>;
};

export type BinanceOcoOrderUpdate = {
  __typename?: 'BinanceOcoOrderUpdate';
  symbol: Scalars['String'];
  eventTime: Scalars['Int'];
  transactionTime: Scalars['Int'];
};

export type BinanceOrder = {
  __typename?: 'BinanceOrder';
  symbol: Scalars['String'];
  orderId: Scalars['Float'];
  orderListId: Scalars['Float'];
  clientOrderId: Scalars['String'];
  price: Scalars['Float'];
  origQty: Scalars['Float'];
  executedQty: Scalars['Float'];
  cummulativeQuoteQty: Scalars['Float'];
  status: Scalars['String'];
  timeInForce: Scalars['String'];
  type: Scalars['String'];
  side: Scalars['String'];
  stopPrice: Scalars['Float'];
  icebergQty: Scalars['Float'];
  time: Scalars['Float'];
  updateTime: Scalars['Float'];
  isWorking: Scalars['Boolean'];
  origQuoteOrderQty: Scalars['Float'];
};

export type BinanceOrderUpdate = {
  __typename?: 'BinanceOrderUpdate';
  symbol: Scalars['String'];
  eventTime: Scalars['Int'];
  side: Scalars['String'];
  orderId: Scalars['Int'];
  transactionTime: Scalars['Int'];
};

export type BinanceTrade = {
  __typename?: 'BinanceTrade';
  id: Scalars['Float'];
  orderId: Scalars['Float'];
  symbol: Scalars['String'];
  isBuyer: Scalars['Boolean'];
  price: Scalars['Float'];
  qty: Scalars['Float'];
  quoteQty: Scalars['Float'];
  time: Scalars['Float'];
  commission: Scalars['Float'];
  commissionAsset: Scalars['String'];
};

export type CancelBinanceOrder = {
  __typename?: 'CancelBinanceOrder';
  symbol: Scalars['String'];
  origClientOrderId: Scalars['String'];
  orderId: Scalars['Int'];
  orderListId: Scalars['Int'];
  clientOrderId: Scalars['String'];
  price: Scalars['Float'];
  origQty: Scalars['Float'];
  executedQty: Scalars['Float'];
  cummulativeQuoteQty: Scalars['Float'];
  status: Scalars['String'];
  timeInForce: Scalars['String'];
  type: Scalars['String'];
  side: Scalars['String'];
};

export type ChartGroup = {
  __typename?: 'ChartGroup';
  user?: Maybe<Scalars['MongoID']>;
  name: Scalars['String'];
  layout: EnumChartGroupLayout;
  charts: Array<Maybe<ChartGroupCharts>>;
  _id: Scalars['MongoID'];
};

export type ChartGroupCharts = {
  __typename?: 'ChartGroupCharts';
  symbol: Scalars['String'];
  order: Scalars['Float'];
  range: Scalars['JSON'];
  _id?: Maybe<Scalars['MongoID']>;
  symbolData?: Maybe<Symbol>;
};

export type DailyChangeIndicator = {
  __typename?: 'DailyChangeIndicator';
  sum: Scalars['Float'];
  days?: Maybe<Array<Maybe<DailyChangeIndicatorDay>>>;
};

export type DailyChangeIndicatorDay = {
  __typename?: 'DailyChangeIndicatorDay';
  date: Scalars['String'];
  value: Scalars['Float'];
};

export type Dashboard = {
  __typename?: 'Dashboard';
  user?: Maybe<Scalars['MongoID']>;
  watchlists: Array<Maybe<DashboardWatchlists>>;
  _id: Scalars['MongoID'];
  updatedAt?: Maybe<Scalars['Date']>;
  createdAt?: Maybe<Scalars['Date']>;
};

export type DashboardWatchlists = {
  __typename?: 'DashboardWatchlists';
  name: Scalars['String'];
  symbols: Array<Maybe<Scalars['String']>>;
  hidden: Scalars['Boolean'];
  _id?: Maybe<Scalars['MongoID']>;
  symbolsData?: Maybe<Array<Maybe<Symbol>>>;
};


export enum EnumChartGroupLayout {
  Vertical = 'vertical',
  Grid = 'grid'
}

export type FilterFindManySymbolDescriptionOperatorsInput = {
  gt?: Maybe<Scalars['String']>;
  gte?: Maybe<Scalars['String']>;
  lt?: Maybe<Scalars['String']>;
  lte?: Maybe<Scalars['String']>;
  ne?: Maybe<Scalars['String']>;
  in?: Maybe<Array<Maybe<Scalars['String']>>>;
  nin?: Maybe<Array<Maybe<Scalars['String']>>>;
  regex?: Maybe<Scalars['RegExpAsString']>;
  exists?: Maybe<Scalars['Boolean']>;
};

export type FilterFindManySymbolDisplaySymbolOperatorsInput = {
  gt?: Maybe<Scalars['String']>;
  gte?: Maybe<Scalars['String']>;
  lt?: Maybe<Scalars['String']>;
  lte?: Maybe<Scalars['String']>;
  ne?: Maybe<Scalars['String']>;
  in?: Maybe<Array<Maybe<Scalars['String']>>>;
  nin?: Maybe<Array<Maybe<Scalars['String']>>>;
  regex?: Maybe<Scalars['RegExpAsString']>;
  exists?: Maybe<Scalars['Boolean']>;
};

export type FilterFindManySymbolInput = {
  description?: Maybe<Scalars['String']>;
  displaySymbol?: Maybe<Scalars['String']>;
  symbol?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  currency?: Maybe<Scalars['String']>;
  _id?: Maybe<Scalars['MongoID']>;
  updatedAt?: Maybe<Scalars['Date']>;
  createdAt?: Maybe<Scalars['Date']>;
  _operators?: Maybe<FilterFindManySymbolOperatorsInput>;
  OR?: Maybe<Array<FilterFindManySymbolInput>>;
  AND?: Maybe<Array<FilterFindManySymbolInput>>;
  search?: Maybe<Scalars['String']>;
};

export type FilterFindManySymbolOperatorsInput = {
  description?: Maybe<FilterFindManySymbolDescriptionOperatorsInput>;
  displaySymbol?: Maybe<FilterFindManySymbolDisplaySymbolOperatorsInput>;
  symbol?: Maybe<FilterFindManySymbolSymbolOperatorsInput>;
  _id?: Maybe<FilterFindManySymbol_IdOperatorsInput>;
};

export type FilterFindManySymbolSymbolOperatorsInput = {
  gt?: Maybe<Scalars['String']>;
  gte?: Maybe<Scalars['String']>;
  lt?: Maybe<Scalars['String']>;
  lte?: Maybe<Scalars['String']>;
  ne?: Maybe<Scalars['String']>;
  in?: Maybe<Array<Maybe<Scalars['String']>>>;
  nin?: Maybe<Array<Maybe<Scalars['String']>>>;
  regex?: Maybe<Scalars['RegExpAsString']>;
  exists?: Maybe<Scalars['Boolean']>;
};

export type FilterFindManySymbol_IdOperatorsInput = {
  gt?: Maybe<Scalars['MongoID']>;
  gte?: Maybe<Scalars['MongoID']>;
  lt?: Maybe<Scalars['MongoID']>;
  lte?: Maybe<Scalars['MongoID']>;
  ne?: Maybe<Scalars['MongoID']>;
  in?: Maybe<Array<Maybe<Scalars['MongoID']>>>;
  nin?: Maybe<Array<Maybe<Scalars['MongoID']>>>;
  exists?: Maybe<Scalars['Boolean']>;
};

export type GetPrices = {
  __typename?: 'GetPrices';
  priceArray?: Maybe<Array<Maybe<PriceTimestampArray>>>;
};

export type GetQuote = {
  __typename?: 'GetQuote';
  openPrice: Scalars['Float'];
  highPrice: Scalars['Float'];
  lowPrice: Scalars['Float'];
  currentPrice: Scalars['Float'];
  previousClose: Scalars['Float'];
};


export type LastPrice = {
  __typename?: 'LastPrice';
  symbol: Scalars['String'];
  price: Scalars['Float'];
  timestamp: Scalars['Float'];
  volume: Scalars['Float'];
};


export type Mutation = {
  __typename?: 'Mutation';
  saveSymbolToDashboard?: Maybe<Scalars['String']>;
  changeSymbolWatchlist?: Maybe<Scalars['String']>;
  changeWatchlistSettings?: Maybe<Scalars['String']>;
  createWatchlist?: Maybe<Scalars['String']>;
  removeSymbolFromDashboard?: Maybe<Scalars['String']>;
  createChartGroup?: Maybe<ChartGroup>;
  addChartToChartGroup: Scalars['String'];
  removeChartFromChartGroup: Scalars['String'];
  removeChartGroup: Scalars['String'];
  saveNote: Scalars['String'];
  setPriceAlert?: Maybe<Scalars['String']>;
  removePriceAlert?: Maybe<Scalars['String']>;
  setReminder?: Maybe<Scalars['String']>;
  removeReminder?: Maybe<Scalars['String']>;
  cancelOrder: Scalars['String'];
  setTrailingStopOrder: Scalars['String'];
  setMovingBuyOrder: Scalars['String'];
};


export type MutationSaveSymbolToDashboardArgs = {
  symbol: Scalars['String'];
  watchlist: Scalars['String'];
};


export type MutationChangeSymbolWatchlistArgs = {
  symbol: Scalars['String'];
  watchlist?: Maybe<Scalars['String']>;
  add: Scalars['Boolean'];
};


export type MutationChangeWatchlistSettingsArgs = {
  id: Scalars['String'];
  hidden?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
};


export type MutationCreateWatchlistArgs = {
  watchlist: Scalars['String'];
};


export type MutationRemoveSymbolFromDashboardArgs = {
  symbol: Scalars['String'];
};


export type MutationCreateChartGroupArgs = {
  name: Scalars['String'];
};


export type MutationAddChartToChartGroupArgs = {
  chartGroupId: Scalars['String'];
  symbol: Scalars['String'];
  order: Scalars['Int'];
  range: Scalars['String'];
};


export type MutationRemoveChartFromChartGroupArgs = {
  chartGroupId: Scalars['String'];
  symbol: Scalars['String'];
};


export type MutationRemoveChartGroupArgs = {
  chartGroupId: Scalars['String'];
};


export type MutationSaveNoteArgs = {
  text: Scalars['String'];
};


export type MutationSetPriceAlertArgs = {
  symbol: Scalars['String'];
  targetPrice: Scalars['Float'];
};


export type MutationRemovePriceAlertArgs = {
  id: Scalars['String'];
};


export type MutationSetReminderArgs = {
  title: Scalars['String'];
  text?: Maybe<Scalars['String']>;
  timestamp: Scalars['Float'];
};


export type MutationRemoveReminderArgs = {
  id: Scalars['String'];
};


export type MutationCancelOrderArgs = {
  orderId: Scalars['String'];
};


export type MutationSetTrailingStopOrderArgs = {
  symbol: Scalars['String'];
  activateOnPrice: Scalars['Float'];
  sellOnPrice: Scalars['Float'];
  priceType: Scalars['String'];
  quantityType: Scalars['String'];
  quantity: Scalars['Float'];
  quoteOrderQty: Scalars['Float'];
};


export type MutationSetMovingBuyOrderArgs = {
  symbol: Scalars['String'];
  activateOnPrice: Scalars['Float'];
  percent: Scalars['Float'];
  priceType: Scalars['String'];
  quantityType: Scalars['String'];
  quantity: Scalars['Float'];
  quoteOrderQty: Scalars['Float'];
};

export type Note = {
  __typename?: 'Note';
  user?: Maybe<Scalars['MongoID']>;
  text?: Maybe<Scalars['String']>;
  _id: Scalars['MongoID'];
  updatedAt?: Maybe<Scalars['Date']>;
  createdAt?: Maybe<Scalars['Date']>;
};

export type Order = {
  __typename?: 'Order';
  active: Scalars['Boolean'];
  user?: Maybe<Scalars['MongoID']>;
  type: Scalars['String'];
  symbol: Scalars['String'];
  exchange: Scalars['String'];
  fixedTrailingStop?: Maybe<OrderFixedTrailingStop>;
  movingBuy?: Maybe<OrderMovingBuy>;
  percentageTrailingStop?: Maybe<OrderPercentageTrailingStop>;
  _id: Scalars['MongoID'];
  updatedAt?: Maybe<Scalars['Date']>;
  createdAt?: Maybe<Scalars['Date']>;
};

export type OrderFixedTrailingStop = {
  __typename?: 'OrderFixedTrailingStop';
  activateOnPrice: Scalars['Float'];
  sellOnPrice: Scalars['Float'];
  priceType: Scalars['String'];
  quantityType: Scalars['String'];
  quantity: Scalars['Float'];
  quoteOrderQty: Scalars['Float'];
  activatedTimestamp: Scalars['Float'];
};

export type OrderMovingBuy = {
  __typename?: 'OrderMovingBuy';
  activateOnPrice: Scalars['Float'];
  percent: Scalars['Float'];
  priceType: Scalars['String'];
  quantityType: Scalars['String'];
  quantity: Scalars['Float'];
  quoteOrderQty: Scalars['Float'];
};

export type OrderPercentageTrailingStop = {
  __typename?: 'OrderPercentageTrailingStop';
  activateOnPrice: Scalars['Float'];
  percentageDecrease: Scalars['Float'];
};

export type PriceAlert = {
  __typename?: 'PriceAlert';
  user?: Maybe<Scalars['MongoID']>;
  symbol: Scalars['String'];
  targetPrice: Scalars['Float'];
  actualPrice: Scalars['Float'];
  notifiedTimestamp: Scalars['Float'];
  _id: Scalars['MongoID'];
  updatedAt?: Maybe<Scalars['Date']>;
  createdAt?: Maybe<Scalars['Date']>;
};

export type PriceTimestampArray = {
  __typename?: 'PriceTimestampArray';
  price: Scalars['Float'];
  timestamp: Scalars['Float'];
};

export type Query = {
  __typename?: 'Query';
  findSymbols: Array<Symbol>;
  getDashboard?: Maybe<Dashboard>;
  getDailyChangeIndicator?: Maybe<DailyChangeIndicator>;
  getQuote?: Maybe<GetQuote>;
  getPrices?: Maybe<GetPrices>;
  getChartGroups?: Maybe<Array<Maybe<ChartGroup>>>;
  getChartGroup?: Maybe<ChartGroup>;
  getNote?: Maybe<Note>;
  getPriceAlerts?: Maybe<Array<Maybe<PriceAlert>>>;
  getReminders?: Maybe<Array<Maybe<Reminder>>>;
  setBinanceSellOrder?: Maybe<BinanceNewOrderResponseFull>;
  setBinanceBuyOrder?: Maybe<BinanceNewOrderResponseFull>;
  getBinanceAccountInformation?: Maybe<BinanceAccountInformation>;
  getBinanceTrades: Array<BinanceTrade>;
  getBinanceExchangeInformation: Array<BinanceExchangeInformation>;
  getBinanceOrders: Array<BinanceOrder>;
  cancelBinanceOrder: Array<CancelBinanceOrder>;
  getOrders: Array<Maybe<Order>>;
};


export type QueryFindSymbolsArgs = {
  filter?: Maybe<FilterFindManySymbolInput>;
  skip?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<SortFindManySymbolInput>;
};


export type QueryGetDailyChangeIndicatorArgs = {
  symbol?: Maybe<Scalars['String']>;
};


export type QueryGetQuoteArgs = {
  symbol?: Maybe<Scalars['String']>;
};


export type QueryGetPricesArgs = {
  symbol: Scalars['String'];
  timestampFrom?: Maybe<Scalars['Float']>;
  timestampTo?: Maybe<Scalars['Float']>;
  range?: Maybe<Scalars['String']>;
};


export type QueryGetChartGroupArgs = {
  chartGroupId: Scalars['String'];
};


export type QueryGetPriceAlertsArgs = {
  symbol: Scalars['String'];
};


export type QuerySetBinanceSellOrderArgs = {
  symbol: Scalars['String'];
  priceType: Scalars['String'];
  price: Scalars['Float'];
  quantityType: Scalars['String'];
  quantity: Scalars['Float'];
  quoteOrderQty: Scalars['Float'];
};


export type QuerySetBinanceBuyOrderArgs = {
  symbol: Scalars['String'];
  priceType: Scalars['String'];
  price: Scalars['Float'];
  quantityType: Scalars['String'];
  quantity: Scalars['Float'];
  quoteOrderQty: Scalars['Float'];
};


export type QueryGetBinanceTradesArgs = {
  symbol: Scalars['String'];
};


export type QueryCancelBinanceOrderArgs = {
  symbol: Scalars['String'];
  orderId?: Maybe<Scalars['Int']>;
  origClientOrderId?: Maybe<Scalars['String']>;
};


export type Reminder = {
  __typename?: 'Reminder';
  user?: Maybe<Scalars['MongoID']>;
  title: Scalars['String'];
  text?: Maybe<Scalars['String']>;
  timestamp: Scalars['Float'];
  active: Scalars['Boolean'];
  _id: Scalars['MongoID'];
  updatedAt?: Maybe<Scalars['Date']>;
  createdAt?: Maybe<Scalars['Date']>;
};

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

export type Subscription = {
  __typename?: 'Subscription';
  lastPrice?: Maybe<LastPrice>;
  binanceLastPrice?: Maybe<BinanceLastPrice>;
  binanceBalanceUpdate?: Maybe<BinanceBalanceUpdate>;
  binanceOrderUpdate?: Maybe<BinanceOrderUpdate>;
  binanceOcoOrderUpdate?: Maybe<BinanceOcoOrderUpdate>;
};


export type SubscriptionLastPriceArgs = {
  symbol?: Maybe<Scalars['String']>;
};


export type SubscriptionBinanceLastPriceArgs = {
  symbol?: Maybe<Scalars['String']>;
};

export type Symbol = {
  __typename?: 'Symbol';
  description: Scalars['String'];
  displaySymbol: Scalars['String'];
  symbol: Scalars['String'];
  type: Scalars['String'];
  currency?: Maybe<Scalars['String']>;
  _id: Scalars['MongoID'];
  updatedAt?: Maybe<Scalars['Date']>;
  createdAt?: Maybe<Scalars['Date']>;
};
