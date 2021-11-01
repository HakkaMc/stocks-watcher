import { BinanceAccountInformation_getBinanceAccountInformation_balances as Balance } from "../../types/graphql/generated/BinanceAccountInformation";
import { BinanceLastPriceSubscription_binanceLastPrice as BinanceLastPrice } from "../../types/graphql/generated/BinanceLastPriceSubscription";

export type PropsBase = {
  assetAmount: AssetAmount
  balances: Array<Balance>
  dollars: Dollars
  lastPrice?: BinanceLastPrice
  baseAsset: string
  quoteAsset: string
  setError: (error: any) => void
  setLoading: (value: boolean) => void
  setSymbol: (symbol: string) => void
}

export type FormBase = {
  baseAsset: string
  baseAssetPrecision: number
  quoteAsset: string
}

export type Dollars = {
  BUSD: {
    free: number
    locked: number
  },
  USDT: {
    free: number
    locked: number
  },
  USDC: {
    free: number
    locked: number
  },
}

export type AssetAmount = {
  free: number
  locked: number
}
