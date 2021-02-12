import { createSchema, Type, typedModel, ExtractProps, ExtractDoc } from 'ts-mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'

export const UserSchema = createSchema(
  {
    name: Type.string({ required: true, unique: true }),
    email: Type.string({ required: true, unique: true }),
    accessToken: Type.string(),
    refreshToken: Type.string(),
    accessTokenExpiration: Type.number()
  },
  { _id: true, timestamps: true }
)

export type UserTsType = ExtractProps<typeof UserSchema>

export const UserTsModel = typedModel('User', UserSchema)

export const userGraphql = composeMongoose(UserTsModel)
