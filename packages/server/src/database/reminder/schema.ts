import { createSchema, Type, typedModel, ExtractProps } from 'ts-mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import { UserSchema } from '../user/schema'

const ReminderSchema = createSchema(
  {
    user: Type.ref(Type.objectId()).to('User', UserSchema),
    title: Type.string({ required: true }),
    text: Type.string(),
    timestamp: Type.number({ required: true }),
    active: Type.boolean({ required: true, default: true })
  },
  { _id: true, timestamps: true }
)

export type ReminderTsType = ExtractProps<typeof ReminderSchema>

export const ReminderTsModel = typedModel('Reminder', ReminderSchema)

export const reminderGraphql = composeMongoose(ReminderTsModel)
