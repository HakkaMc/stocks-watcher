import { createSchema, Type, typedModel, ExtractProps } from 'ts-mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import {UserSchema} from "../user/schema";

const PriceAlertSchema = createSchema({
    user: Type.ref(Type.objectId()).to('User', UserSchema),
    symbol: Type.string({required: true}),
    targetPrice: Type.number({required: true}),
    actualPrice: Type.number({required: true}),
    notifiedTimestamp: Type.number({required: true, default: 0})
}, { _id: true, timestamps: true })

export type PriceAlertTsType = ExtractProps<typeof PriceAlertSchema>

export const PriceAlertTsModel = typedModel('PriceAlert', PriceAlertSchema)

export const priceAlertGraphql = composeMongoose(PriceAlertTsModel)
