/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CancelBinanceOrder
// ====================================================

export interface CancelBinanceOrder_cancelBinanceOrder {
  __typename: "CancelBinanceOrder";
  status: string;
}

export interface CancelBinanceOrder {
  cancelBinanceOrder: CancelBinanceOrder_cancelBinanceOrder;
}

export interface CancelBinanceOrderVariables {
  symbol: string;
  orderId: number;
  origClientOrderId?: string | null;
}
