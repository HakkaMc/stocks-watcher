/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: binanceBalanceUpdate
// ====================================================

export interface binanceBalanceUpdate_binanceBalanceUpdate {
  __typename: "BinanceBalanceUpdate";
  asset: string;
  clearTime: number;
  delta: number;
  eventTime: number;
}

export interface binanceBalanceUpdate {
  binanceBalanceUpdate: binanceBalanceUpdate_binanceBalanceUpdate | null;
}
