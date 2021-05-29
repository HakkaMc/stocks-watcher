/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: binanceOcoOrderUpdate
// ====================================================

export interface binanceOcoOrderUpdate_binanceOcoOrderUpdate {
  __typename: "BinanceOcoOrderUpdate";
  eventTime: number;
  symbol: string;
  transactionTime: number;
}

export interface binanceOcoOrderUpdate {
  binanceOcoOrderUpdate: binanceOcoOrderUpdate_binanceOcoOrderUpdate | null;
}
