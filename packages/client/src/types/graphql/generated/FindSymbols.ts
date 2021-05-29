/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FindSymbols
// ====================================================

export interface FindSymbols_findSymbols {
  __typename: "Symbol";
  description: string;
  symbol: string;
  displaySymbol: string;
  type: string;
}

export interface FindSymbols {
  findSymbols: FindSymbols_findSymbols[];
}

export interface FindSymbolsVariables {
  search: string;
}
