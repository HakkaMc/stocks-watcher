/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: binanceOrderUpdate
// ====================================================

export interface binanceOrderUpdate_binanceOrderUpdate {
  __typename: "BinanceOrderUpdate";
  eventTime: number;
  orderId: number;
  side: string;
  symbol: string;
  transactionTime: number;
}

export interface binanceOrderUpdate {
  binanceOrderUpdate: binanceOrderUpdate_binanceOrderUpdate | null;
}
