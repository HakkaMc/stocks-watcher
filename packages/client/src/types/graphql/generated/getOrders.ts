/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getOrders
// ====================================================

export interface getOrders_getOrders {
  __typename: "Order";
  _id: any;
  activateOnPrice: number;
  sellOnPrice: number;
  activatedTimestamp: number;
  priceType: string;
  quantity: number;
  quantityType: string;
  quoteOrderQty: number;
  percent: number;
  type: string;
  createdAt: any | null;
  symbol: string;
  exchange: string;
}

export interface getOrders {
  getOrders: getOrders_getOrders[];
}
