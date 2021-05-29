import { ResolverResolveParams } from 'graphql-compose'
import { noteGraphql, NoteTsModel } from './note'

noteGraphql.addResolver({
  kind: 'query',
  name: 'getNote',
  type: noteGraphql,
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session

    const note = await NoteTsModel.findOne({ user: userId })

    if (note) {
      console.log('return note')
      return note
    }
    const newNote = new NoteTsModel({
      text: '',
      user: userId
    })

    await newNote.save()

    console.log('saved new note')

    return newNote
  }
})

noteGraphql.addResolver({
  kind: 'mutation',
  name: 'saveNote',
  type: 'String!',
  args: {
    text: 'String!'
  },
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session

    await NoteTsModel.updateOne({ user: userId }, { text: params.args.text })

    return 'OK'
  }
})

export const noteResolvers = {
  query: {
    getNote: noteGraphql.getResolver('getNote')
  },
  mutation: {
    saveNote: noteGraphql.getResolver('saveNote')
  }
}
