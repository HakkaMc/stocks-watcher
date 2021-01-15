import { createSchema, Type, typedModel, ExtractProps, ExtractDoc } from 'ts-mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'

import { SymbolSchema } from '../symbol/schema'

export const UserSchema = createSchema(
  {
    name: Type.string({ required: true, unique: true }),
    dashboard: {
      watchedSymbols: Type.array().of(Type.ref(Type.objectId()).to('Symbol', SymbolSchema))
    }
  },
  { _id: true, timestamps: true }
)

export type UserTsType = ExtractProps<typeof UserSchema>

export const UserTsModel = typedModel('User', UserSchema)

export const userGraphql = composeMongoose(UserTsModel)
