/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getReminders
// ====================================================

export interface getReminders_getReminders {
  __typename: "Reminder";
  _id: any;
  title: string;
  text: string | null;
  timestamp: number;
}

export interface getReminders {
  getReminders: (getReminders_getReminders | null)[] | null;
}
