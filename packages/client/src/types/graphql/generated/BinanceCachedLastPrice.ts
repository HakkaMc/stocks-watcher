/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BinanceCachedLastPrice
// ====================================================

export interface BinanceCachedLastPrice_getBinanceCachedLastPrice {
  __typename: "BinanceLastPrice";
  ask: number;
  bid: number;
  diff: number;
  diffPercentage: number;
  middle: number;
  symbol: string;
  timestamp: number;
}

export interface BinanceCachedLastPrice {
  getBinanceCachedLastPrice: BinanceCachedLastPrice_getBinanceCachedLastPrice;
}

export interface BinanceCachedLastPriceVariables {
  symbol: string;
}
