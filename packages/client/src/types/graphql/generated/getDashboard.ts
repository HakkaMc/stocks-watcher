/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getDashboard
// ====================================================

export interface getDashboard_getDashboard_watchlists_symbolsData {
  __typename: "Symbol";
  _id: any;
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface getDashboard_getDashboard_watchlists {
  __typename: "DashboardWatchlists";
  _id: any | null;
  name: string;
  hidden: boolean;
  symbols: (string | null)[];
  symbolsData: (getDashboard_getDashboard_watchlists_symbolsData | null)[] | null;
}

export interface getDashboard_getDashboard {
  __typename: "Dashboard";
  watchlists: (getDashboard_getDashboard_watchlists | null)[];
}

export interface getDashboard {
  getDashboard: getDashboard_getDashboard | null;
}
