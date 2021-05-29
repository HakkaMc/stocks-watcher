import { createSchema, Type, typedModel, ExtractProps } from 'ts-mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import { UserSchema } from '../user/schema'

const BinanceProfileSchema = createSchema(
  {
    user: Type.ref(Type.objectId()).to('User', UserSchema),
    lastBalanceHash: Type.string(),
    lastBalanceData: Type.mixed(),
    countedBalance: Type.array({ required: true, default: [] }).of({
      asset: Type.string({ required: true }),
      quantity: Type.number({ required: true, default: 0 }),
      amount: Type.number({ required: true, default: 0 }), // Amount bought in USD
      averagePurchasePrice: Type.number({ required: true, default: -1 }),
      realizedProfit: Type.number({ required: true, default: 0 }),
      lastTradeTimestamp: Type.number({ required: true, default: -1 }) // last trade ID used for computing profit/loss
    })
  },
  { _id: true, timestamps: true }
)

export type BinanceProfileTsType = ExtractProps<typeof BinanceProfileSchema>

export const BinanceProfileTsModel = typedModel('BinanceProfile', BinanceProfileSchema)

export const BinanceProfileGraphql = composeMongoose(BinanceProfileTsModel)
