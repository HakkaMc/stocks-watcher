/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum SortFindManyBinanceTradeInput {
  TIME_ASC = "TIME_ASC",
  TIME_DESC = "TIME_DESC",
  _ID_ASC = "_ID_ASC",
  _ID_DESC = "_ID_DESC",
}

export interface CreateOneOrderInput {
  type: string;
  symbol: string;
  exchange: string;
  activateOnPrice: number;
  sellOnPrice: number;
  priceType: string;
  quantityType: string;
  quantity: number;
  quoteOrderQty: number;
  percent: number;
  meta?: any | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
