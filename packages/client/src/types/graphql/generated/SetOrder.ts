/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateOneOrderInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SetOrder
// ====================================================

export interface SetOrder_setOrder_error {
  __typename: "ValidationError" | "MongoError" | "RuntimeError";
  message: string | null;
}

export interface SetOrder_setOrder {
  __typename: "CreateOneOrderPayload";
  error: SetOrder_setOrder_error | null;
}

export interface SetOrder {
  setOrder: SetOrder_setOrder | null;
}

export interface SetOrderVariables {
  record: CreateOneOrderInput;
}
