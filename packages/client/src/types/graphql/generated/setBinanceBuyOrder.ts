/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: setBinanceBuyOrder
// ====================================================

export interface setBinanceBuyOrder_setBinanceBuyOrder {
  __typename: "BinanceNewOrderResponseFull";
  status: string;
}

export interface setBinanceBuyOrder {
  setBinanceBuyOrder: setBinanceBuyOrder_setBinanceBuyOrder | null;
}

export interface setBinanceBuyOrderVariables {
  symbol: string;
  priceType: string;
  price: number;
  quantityType: string;
  quantity: number;
  quoteOrderQty: number;
}
