import { createSchema, Type, typedModel, ExtractProps, ExtractDoc } from 'ts-mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import {UserSchema} from "../user/schema";

const NoteSchema = createSchema({
    user: Type.ref(Type.objectId()).to('User', UserSchema),
    text: Type.string({required: false})
}, { _id: true, timestamps: true })

export type NoteTsType = ExtractProps<typeof NoteSchema>

export const NoteTsModel = typedModel('Note', NoteSchema)

export const noteGraphql = composeMongoose(NoteTsModel)
