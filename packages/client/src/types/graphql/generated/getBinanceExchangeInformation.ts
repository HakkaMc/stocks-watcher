/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getBinanceExchangeInformation
// ====================================================

export interface getBinanceExchangeInformation_getBinanceExchangeInformation {
  __typename: "BinanceExchangeInformation";
  baseAsset: string;
  filters: any;
  ocoAllowed: boolean;
  quoteAsset: string;
  symbol: string;
}

export interface getBinanceExchangeInformation {
  getBinanceExchangeInformation: getBinanceExchangeInformation_getBinanceExchangeInformation[];
}
