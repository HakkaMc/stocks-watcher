/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BinanceSellOrder
// ====================================================

export interface BinanceSellOrder {
  setBinanceSellOrder: string;
}

export interface BinanceSellOrderVariables {
  symbol: string;
  priceType: string;
  price: number;
  quantityType: string;
  quantity: number;
  quoteOrderQty: number;
}
