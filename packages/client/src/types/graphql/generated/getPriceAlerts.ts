/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getPriceAlerts
// ====================================================

export interface getPriceAlerts_getPriceAlerts {
  __typename: "PriceAlert";
  _id: any;
  symbol: string;
  targetPrice: number;
  actualPrice: number;
}

export interface getPriceAlerts {
  getPriceAlerts: (getPriceAlerts_getPriceAlerts | null)[] | null;
}

export interface getPriceAlertsVariables {
  symbol: string;
}
