import { createSchema, Type, typedModel, ExtractProps } from 'ts-mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import { UserSchema } from '../user/schema'

const OrderSchema = createSchema(
  {
    active: Type.boolean({ required: true, default: true }),
    user: Type.ref(Type.objectId()).to('User', UserSchema),
    type: Type.string({ required: true }), // BUY, SELL, TRAILING_STOP, TAKE_PROFIT, STOP_LOSS, CONSOLIDATION, MOVING_BUY
    symbol: Type.string({ required: true }),
    exchange: Type.string({ required: true }),
    fixedTrailingStop: {
      activateOnPrice: Type.number({ required: true, default: -1 }),
      sellOnPrice: Type.number({ required: true, default: -1 }),
      priceType: Type.string({ required: true }),
      quantityType: Type.string({ required: true }),
      quantity: Type.number({ required: true, default: -1 }),
      quoteOrderQty: Type.number({ required: true, default: -1 }),
      activatedTimestamp: Type.number({ required: true, default: -1 })
    },
    movingBuy: {
      activateOnPrice: Type.number({ required: true, default: -1 }),
      percent: Type.number({ required: true, default: 10 }),
      priceType: Type.string({ required: true }),
      quantityType: Type.string({ required: true }),
      quantity: Type.number({ required: true, default: -1 }),
      quoteOrderQty: Type.number({ required: true, default: -1 })
    },
    percentageTrailingStop: {
      activateOnPrice: Type.number({ required: true, default: -1 }),
      percentageDecrease: Type.number({ required: true, default: 10 })
    }
  },
  { _id: true, timestamps: true }
)

export type OrderTsType = ExtractProps<typeof OrderSchema>

export const OrderTsModel = typedModel('Order', OrderSchema)

export const orderGraphql = composeMongoose(OrderTsModel)
