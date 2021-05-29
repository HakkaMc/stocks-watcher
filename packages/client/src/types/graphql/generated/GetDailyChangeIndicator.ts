/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDailyChangeIndicator
// ====================================================

export interface GetDailyChangeIndicator_getDailyChangeIndicator_days {
  __typename: "DailyChangeIndicatorDay";
  date: string;
  value: number;
}

export interface GetDailyChangeIndicator_getDailyChangeIndicator {
  __typename: "DailyChangeIndicator";
  sum: number;
  days: (GetDailyChangeIndicator_getDailyChangeIndicator_days | null)[] | null;
}

export interface GetDailyChangeIndicator {
  getDailyChangeIndicator: GetDailyChangeIndicator_getDailyChangeIndicator | null;
}

export interface GetDailyChangeIndicatorVariables {
  symbol: string;
}
