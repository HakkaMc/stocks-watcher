/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetBinanceProfile
// ====================================================

export interface GetBinanceProfile_getBinanceProfile_countedBalance {
  __typename: "BinanceProfileCountedBalance";
  amount: number;
  asset: string;
  averagePurchasePrice: number;
  quantity: number;
  realizedProfit: number;
}

export interface GetBinanceProfile_getBinanceProfile {
  __typename: "BinanceProfile";
  countedBalance: (GetBinanceProfile_getBinanceProfile_countedBalance | null)[];
  updatedAt: any | null;
}

export interface GetBinanceProfile {
  getBinanceProfile: GetBinanceProfile_getBinanceProfile | null;
}
