import { createSchema, Type, typedModel, ExtractProps } from 'ts-mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'

const ServerSettingSchema = createSchema({
    lastVolatilityCheckTimestamp: Type.number({default: 0}),
    lastSymbolsUpdateTimestamp: Type.number({default: 0}),
    lastPriceHitCheckTimestamp: Type.number({default: 0})
}, { _id: false, timestamps: true })

export type ServerSettingTsType = ExtractProps<typeof ServerSettingSchema>

export const ServerSettingTsModel = typedModel('ServerSetting', ServerSettingSchema)

export const serverSettingGraphql = composeMongoose(ServerSettingTsModel)
