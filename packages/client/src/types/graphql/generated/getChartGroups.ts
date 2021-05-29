/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getChartGroups
// ====================================================

export interface getChartGroups_getChartGroups_charts_symbolData {
  __typename: "Symbol";
  description: string;
  displaySymbol: string;
  symbol: string;
}

export interface getChartGroups_getChartGroups_charts {
  __typename: "ChartGroupCharts";
  symbol: string;
  symbolData: getChartGroups_getChartGroups_charts_symbolData | null;
}

export interface getChartGroups_getChartGroups {
  __typename: "ChartGroup";
  _id: any;
  name: string;
  charts: (getChartGroups_getChartGroups_charts | null)[];
}

export interface getChartGroups {
  getChartGroups: (getChartGroups_getChartGroups | null)[] | null;
}
