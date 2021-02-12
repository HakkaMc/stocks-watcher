import { createSchema, Type, typedModel, ExtractProps } from 'ts-mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'

import { symbolGraphql, SymbolTsModel } from '../symbol/schema'
import { UserSchema } from '../user/schema'

const layout = ['vertical', 'grid'] as const
const range = ['1', '5', '15', '30', '60', 'D', 'W', 'M'] as const

const Chart = createSchema(
  {
    symbol: Type.string({ required: true }),
    order: Type.number({ required: true, default: 0 }),
    range: Type.mixed({ required: true, enum: range })
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

export const ChartGroupSchema = createSchema(
  {
    user: Type.ref(Type.objectId()).to('User', UserSchema),
    name: Type.string({ required: true }),
    layout: Type.string({ required: true, enum: layout }),
    charts: Type.array({ required: true }).of(Chart)
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

Chart.virtual('symbolData').get(async function () {
  // @ts-ignore
  const symbol = this?.symbol || ''

  const symbolObj = await SymbolTsModel.findOne({ symbol })

  return symbolObj
})

export type ChartGroupTsType = ExtractProps<typeof ChartGroupSchema>

export const ChartGroupTsModel = typedModel('ChartGroup', ChartGroupSchema)

export const chartGroupGraphql = composeMongoose(ChartGroupTsModel)

chartGroupGraphql.getFieldOTC('charts').addFields({
  symbolData: {
    type: symbolGraphql
  }
})
