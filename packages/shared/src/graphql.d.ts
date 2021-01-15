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
};

export type Query = {
  __typename?: 'Query';
  findSymbols: Array<Symbol>;
  getUserProfile?: Maybe<User>;
  getRocIndicator?: Maybe<RocIndicator>;
  getQuote?: Maybe<GetQuote>;
};


export type QueryFindSymbolsArgs = {
  filter?: Maybe<FilterFindManySymbolInput>;
  skip?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<SortFindManySymbolInput>;
};


export type QueryGetRocIndicatorArgs = {
  symbol?: Maybe<Scalars['String']>;
};


export type QueryGetQuoteArgs = {
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

export type User = {
  __typename?: 'User';
  name: Scalars['String'];
  dashboard?: Maybe<UserDashboard>;
  _id: Scalars['MongoID'];
  updatedAt?: Maybe<Scalars['Date']>;
  createdAt?: Maybe<Scalars['Date']>;
};

export type UserDashboard = {
  __typename?: 'UserDashboard';
  watchedSymbols: Array<Symbol>;
};


export type UserDashboardWatchedSymbolsArgs = {
  limit?: Maybe<Scalars['Int']>;
  sort?: Maybe<SortFindByIdsSymbolInput>;
};

export enum SortFindByIdsSymbolInput {
  IdAsc = '_ID_ASC',
  IdDesc = '_ID_DESC',
  DescriptionAsc = 'DESCRIPTION_ASC',
  DescriptionDesc = 'DESCRIPTION_DESC',
  DisplaysymbolAsc = 'DISPLAYSYMBOL_ASC',
  DisplaysymbolDesc = 'DISPLAYSYMBOL_DESC',
  SymbolAsc = 'SYMBOL_ASC',
  SymbolDesc = 'SYMBOL_DESC'
}

export type RocIndicator = {
  __typename?: 'RocIndicator';
  sum: Scalars['Float'];
  days?: Maybe<Array<Maybe<RocIndicatorDay>>>;
};

export type RocIndicatorDay = {
  __typename?: 'RocIndicatorDay';
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

export type Mutation = {
  __typename?: 'Mutation';
  saveSymbolToDashboard?: Maybe<Symbol>;
};


export type MutationSaveSymbolToDashboardArgs = {
  symbol?: Maybe<Scalars['String']>;
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
