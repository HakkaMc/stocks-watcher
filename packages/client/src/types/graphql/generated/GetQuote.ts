/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetQuote
// ====================================================

export interface GetQuote_getQuote {
  __typename: "GetQuote";
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  previousClose: number;
}

export interface GetQuote {
  getQuote: GetQuote_getQuote | null;
}

export interface GetQuoteVariables {
  symbol: string;
}
