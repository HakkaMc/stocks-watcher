/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Dashboard
// ====================================================

export interface Dashboard_getDashboard_watchlists_symbolsData {
  __typename: "Symbol";
  _id: any;
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface Dashboard_getDashboard_watchlists {
  __typename: "DashboardWatchlists";
  _id: any | null;
  name: string;
  hidden: boolean;
  symbols: (string | null)[];
  symbolsData: (Dashboard_getDashboard_watchlists_symbolsData | null)[] | null;
}

export interface Dashboard_getDashboard {
  __typename: "Dashboard";
  watchlists: (Dashboard_getDashboard_watchlists | null)[];
}

export interface Dashboard {
  getDashboard: Dashboard_getDashboard | null;
}
