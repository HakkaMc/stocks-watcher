import { createSchema, Type, typedModel, ExtractProps } from 'ts-mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import { UserSchema } from '../user/schema'

const BinanceTradeSchema = createSchema(
  {
    user: Type.ref(Type.objectId()).to('User', UserSchema),
    baseAsset: Type.string({ required: true }),
    quoteAsset: Type.string({ required: true }),
    symbol: Type.string({ required: true }),
    tradeId: Type.number({ required: true, default: -1 }),
    orderId: Type.number({ required: true, default: -1 }),
    orderListId: Type.number({ required: true, default: -1 }),
    price: Type.number({ required: true, default: 0 }),
    qty: Type.number({ required: true, default: 0 }),
    quoteQty: Type.number({ required: true, default: 0 }),
    commission: Type.number({ required: true, default: 0 }),
    commissionAsset: Type.string({ required: true }),
    time: Type.number({ required: true, default: -1 }),
    isBuyer: Type.boolean({ required: true }),
    isMaker: Type.boolean({ required: true }),
    isBestMatch: Type.boolean({ required: true })
  },
  { _id: true, timestamps: true }
)

export type BinanceTradeTsType = ExtractProps<typeof BinanceTradeSchema>

export const BinanceTradeTsModel = typedModel('BinanceTrade', BinanceTradeSchema)

export const binanceTradeGraphql = composeMongoose(BinanceTradeTsModel)
