/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Orders
// ====================================================

export interface Orders_getOrders {
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

export interface Orders {
  getOrders: Orders_getOrders[];
}
