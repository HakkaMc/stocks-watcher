/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BinanceAccountInformation
// ====================================================

export interface BinanceAccountInformation_getBinanceAccountInformation_balances {
  __typename: "BinanceBalance";
  asset: string;
  free: number;
  locked: number;
}

export interface BinanceAccountInformation_getBinanceAccountInformation {
  __typename: "BinanceAccountInformation";
  accountType: string;
  balances: BinanceAccountInformation_getBinanceAccountInformation_balances[];
  buyerCommission: number;
  canDeposit: boolean;
  canTrade: boolean;
  canWithdraw: boolean;
  makerCommission: number;
  permissions: string[];
  sellerCommission: number;
  takerCommission: number;
  updateTime: number;
}

export interface BinanceAccountInformation {
  getBinanceAccountInformation: BinanceAccountInformation_getBinanceAccountInformation | null;
}
