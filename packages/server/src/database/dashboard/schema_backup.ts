import { createSchema, Type, typedModel, ExtractProps, ExtractDoc } from 'ts-mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import { UserSchema } from '../user/schema'
import { SymbolSchema, SymbolTsModel, SymbolTsType, symbolGraphql } from '../symbol/schema'

const Flag = createSchema(
  {
    name: Type.string({ required: true, unique: false })
  },
  { _id: true, timestamps: false }
)

const WatchedSymbol = createSchema(
  {
    symbol: Type.string({ required: true }),
    flags: Type.array().of(Type.ref(Type.objectId()).to('Flag', Flag))
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
    flags: Type.array().of(Flag),
    watchedSymbols: Type.array().of(WatchedSymbol)
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

WatchedSymbol.virtual('symbolData').get(async function () {
  // @ts-ignore
  const symbol = this?.symbol || ''

  const symbolObj = await SymbolTsModel.findOne({ symbol })

  return symbolObj
})

export type DashboardTsType = ExtractProps<typeof DashboardSchema>

export const DashboardTsModel = typedModel('Dashboard', DashboardSchema)

export const dashboardGraphql = composeMongoose(DashboardTsModel)

dashboardGraphql.getFieldOTC('watchedSymbols').addFields({
  symbolData: {
    type: symbolGraphql
  }
})
