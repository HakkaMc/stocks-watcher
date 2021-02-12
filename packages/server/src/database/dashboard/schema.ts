import { createSchema, Type, typedModel, ExtractProps, ExtractDoc } from 'ts-mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import { UserSchema } from '../user/schema'
import { SymbolSchema, SymbolTsModel, SymbolTsType, symbolGraphql } from '../symbol/schema'

export const Watchlist = createSchema(
  {
    name: Type.string({ required: true }),
    symbols: Type.array({ required: true }).of(Type.string())
  },
  {
    _id: true,
    timestamps: false,
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true
    }
  }
)

export const DashboardSchema = createSchema(
  {
    user: Type.ref(Type.objectId()).to('User', UserSchema),
    watchlists: Type.array({ required: true }).of(Watchlist)
  },
  {
    _id: true,
    timestamps: true,
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true
    }
  }
)

Watchlist.virtual('symbolsData').get(async function () {
    // @ts-ignore
    const symbolArray = this?.symbols || []

    const symbolsData = await SymbolTsModel.find(
        {symbol: { $in: symbolArray}}
    );

    return symbolsData
})

export type DashboardTsType = ExtractProps<typeof DashboardSchema>

export const DashboardTsModel = typedModel('Dashboard', DashboardSchema)

export const dashboardGraphql = composeMongoose(DashboardTsModel)

dashboardGraphql.getFieldOTC('watchlists').addFields({
    symbolsData: {
        type: [symbolGraphql]
    }
})
