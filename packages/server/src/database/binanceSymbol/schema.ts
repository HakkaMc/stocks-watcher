import { createSchema, Type, typedModel, ExtractProps } from 'ts-mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'

const BinanceSymbolSchema = createSchema(
  {
    symbol: Type.string({ required: true }),
    status: Type.string({ required: true }),
    baseAsset: Type.string({ required: true }),
    baseAssetPrecision: Type.number({ required: true, default: 0 }),
    quoteAsset: Type.string({ required: true }),
    quotePrecision: Type.number({ required: true, default: 0 }),
    quoteAssetPrecision: Type.number({ required: true, default: 0 }),
    orderTypes: Type.array({ required: true }).of(Type.string()),
    icebergAllowed: Type.boolean({ required: true }),
    ocoAllowed: Type.boolean({ required: true }),
    isSpotTradingAllowed: Type.boolean({ required: true }),
    isMarginTradingAllowed: Type.boolean({ required: true }),
    filters: Type.mixed(),
    permissions: Type.array({ required: true }).of(Type.string())
  },
  { _id: true, timestamps: true }
)

export type BinanceSymbolTsType = ExtractProps<typeof BinanceSymbolSchema>

export const BinanceSymbolTsModel = typedModel('BinanceSymbol', BinanceSymbolSchema)

export const binanceSymbolGraphql = composeMongoose(BinanceSymbolTsModel)
