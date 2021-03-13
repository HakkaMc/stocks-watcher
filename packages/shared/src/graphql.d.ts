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
  MongoID: any;
  Date: any;
  /** The string representation of JavaScript regexp. You may provide it with flags "/^abc.*\/i" or without flags like "^abc.*". More info about RegExp characters and flags: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions */
  RegExpAsString: any;
  JSON: any;
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
  hidden?: Maybe<Scalars['Boolean']>;
  _id?: Maybe<Scalars['MongoID']>;
  symbolsData?: Maybe<Array<Maybe<Symbol>>>;
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

export type GetQuote = {
  __typename?: 'GetQuote';
  openPrice: Scalars['Float'];
  highPrice: Scalars['Float'];
  lowPrice: Scalars['Float'];
  currentPrice: Scalars['Float'];
  previousClose: Scalars['Float'];
};

export type GetPrices = {
  __typename?: 'GetPrices';
  priceArray?: Maybe<Array<Maybe<PriceTimestampArray>>>;
};

export type PriceTimestampArray = {
  __typename?: 'PriceTimestampArray';
  price: Scalars['Float'];
  timestamp: Scalars['Float'];
};

export type ChartGroup = {
  __typename?: 'ChartGroup';
  user?: Maybe<Scalars['MongoID']>;
  name: Scalars['String'];
  layout: EnumChartGroupLayout;
  charts: Array<Maybe<ChartGroupCharts>>;
  _id: Scalars['MongoID'];
};

export enum EnumChartGroupLayout {
  Vertical = 'vertical',
  Grid = 'grid'
}

export type ChartGroupCharts = {
  __typename?: 'ChartGroupCharts';
  symbol: Scalars['String'];
  order: Scalars['Float'];
  range: Scalars['JSON'];
  _id?: Maybe<Scalars['MongoID']>;
  symbolData?: Maybe<Symbol>;
};


export type Note = {
  __typename?: 'Note';
  user?: Maybe<Scalars['MongoID']>;
  text?: Maybe<Scalars['String']>;
  _id: Scalars['MongoID'];
  updatedAt?: Maybe<Scalars['Date']>;
  createdAt?: Maybe<Scalars['Date']>;
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

export type Subscription = {
  __typename?: 'Subscription';
  lastPrice?: Maybe<LastPrice>;
};


export type SubscriptionLastPriceArgs = {
  symbol?: Maybe<Scalars['String']>;
};

export type LastPrice = {
  __typename?: 'LastPrice';
  symbol: Scalars['String'];
  price: Scalars['Float'];
  timestamp: Scalars['Float'];
  volume: Scalars['Float'];
};
