/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SortFindManyBinanceTradeInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: BinanceTrades
// ====================================================

export interface BinanceTrades_getBinanceTrades {
  __typename: "BinanceTrade";
  baseAsset: string;
  quoteAsset: string;
  commission: number;
  commissionAsset: string;
  tradeId: number;
  isBuyer: boolean;
  orderId: number;
  price: number;
  qty: number;
  quoteQty: number;
  symbol: string;
  time: number;
}

export interface BinanceTrades {
  getBinanceTrades: BinanceTrades_getBinanceTrades[];
}

export interface BinanceTradesVariables {
  symbol?: string | null;
  baseAsset?: string | null;
  quoteAsset?: string | null;
  limit?: number | null;
  sort?: SortFindManyBinanceTradeInput | null;
}
