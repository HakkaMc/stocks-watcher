/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: BinanceLastPriceSubscription
// ====================================================

export interface BinanceLastPriceSubscription_binanceLastPrice {
  __typename: "BinanceLastPrice";
  ask: number;
  bid: number;
  diff: number;
  diffPercentage: number;
  middle: number;
  symbol: string;
  timestamp: number;
}

export interface BinanceLastPriceSubscription {
  binanceLastPrice: BinanceLastPriceSubscription_binanceLastPrice;
}

export interface BinanceLastPriceSubscriptionVariables {
  symbol: string;
}
