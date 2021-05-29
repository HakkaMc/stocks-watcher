/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getChartGroup
// ====================================================

export interface getChartGroup_getChartGroup_charts {
  __typename: "ChartGroupCharts";
  symbol: string;
}

export interface getChartGroup_getChartGroup {
  __typename: "ChartGroup";
  _id: any;
  name: string;
  charts: (getChartGroup_getChartGroup_charts | null)[];
}

export interface getChartGroup {
  getChartGroup: getChartGroup_getChartGroup | null;
}

export interface getChartGroupVariables {
  chartGroupId: string;
}
