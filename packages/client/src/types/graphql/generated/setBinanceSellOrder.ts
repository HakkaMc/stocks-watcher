/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: setBinanceSellOrder
// ====================================================

export interface setBinanceSellOrder_setBinanceSellOrder {
  __typename: "BinanceNewOrderResponseFull";
  status: string;
}

export interface setBinanceSellOrder {
  setBinanceSellOrder: setBinanceSellOrder_setBinanceSellOrder | null;
}

export interface setBinanceSellOrderVariables {
  symbol: string;
  priceType: string;
  price: number;
  quantityType: string;
  quantity: number;
  quoteOrderQty: number;
}
