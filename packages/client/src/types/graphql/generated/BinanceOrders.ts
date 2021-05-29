/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BinanceOrders
// ====================================================

export interface BinanceOrders_getBinanceOrders {
  __typename: "BinanceOrder";
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  price: number;
  origQty: number;
  executedQty: number;
  cummulativeQuoteQty: number;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  stopPrice: number;
  time: number;
  updateTime: number;
  isWorking: boolean;
  origQuoteOrderQty: number;
}

export interface BinanceOrders {
  getBinanceOrders: BinanceOrders_getBinanceOrders[];
}
