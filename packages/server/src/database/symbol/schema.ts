import { createSchema, Type, typedModel, ExtractProps, ExtractDoc } from 'ts-mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'

export const SymbolSchema = createSchema(
  {
    description: Type.string({ required: true, index: true }),
    displaySymbol: Type.string({ required: true, index: true }),
    symbol: Type.string({ required: true, index: true }),
    type: Type.string({ required: true }),
    currency: Type.string({ required: false })
  },
  { _id: true, timestamps: true, autoIndex: true }
)

SymbolSchema.index({
  description: 'text',
  symbol: 'text',
  displaySymbol: 'text'
})

export type SymbolTsType = ExtractProps<typeof SymbolSchema>

export const SymbolTsModel = typedModel('Symbol', SymbolSchema)

export const symbolGraphql = composeMongoose(SymbolTsModel)
