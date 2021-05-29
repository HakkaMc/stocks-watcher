/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getPrices
// ====================================================

export interface getPrices_getPrices_priceArray {
  __typename: "PriceTimestampArray";
  price: number;
  timestamp: number;
}

export interface getPrices_getPrices {
  __typename: "GetPrices";
  priceArray: (getPrices_getPrices_priceArray | null)[] | null;
}

export interface getPrices {
  getPrices: getPrices_getPrices | null;
}

export interface getPricesVariables {
  symbol: string;
  timestampFrom?: number | null;
  timestampTo?: number | null;
  range?: string | null;
}
