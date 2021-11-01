/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BinanceSymbols
// ====================================================

export interface BinanceSymbols_getBinanceSymbols {
  __typename: "BinanceSymbol";
  symbol: string;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quoteAssetPrecision: number;
  quotePrecision: number;
  filters: any | null;
  ocoAllowed: boolean;
}

export interface BinanceSymbols {
  getBinanceSymbols: BinanceSymbols_getBinanceSymbols[];
}

export interface BinanceSymbolsVariables {
  quoteAsset?: string | null;
}
