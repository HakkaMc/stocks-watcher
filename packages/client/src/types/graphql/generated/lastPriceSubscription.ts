/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: lastPriceSubscription
// ====================================================

export interface lastPriceSubscription_lastPrice {
  __typename: "LastPrice";
  price: number;
  symbol: string;
  timestamp: number;
  volume: number;
}

export interface lastPriceSubscription {
  lastPrice: lastPriceSubscription_lastPrice | null;
}

export interface lastPriceSubscriptionVariables {
  symbol: string;
}
