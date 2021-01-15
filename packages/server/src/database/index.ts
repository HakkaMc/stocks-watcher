import fs from 'fs'
import { printSchema } from 'graphql/utilities'
import mongoose from 'mongoose'
import { schemaComposer, Resolver, ResolverResolveParams } from 'graphql-compose'

import { symbolResolvers } from './symbol/resolvers'
import { userResolvers } from './user/resolvers'
import { finnhubResolvers } from '../finnhub/resolvers'

export const initDatabase = async () => {
  await mongoose.connect('mongodb://localhost:27017/stocksWatcher', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })

  schemaComposer.Query.addFields({
    ...symbolResolvers.query,
    ...userResolvers.query,
    ...finnhubResolvers.query
  })

  schemaComposer.Mutation.addFields({
    ...userResolvers.mutation
  })

  // @ts-ignore
  schemaComposer.Subscription.addFields({
    ...finnhubResolvers.subscription
  })

  const graphqlSchema = schemaComposer.buildSchema()

  fs.writeFileSync(
    '../../packages/shared/src/schema.graphql',
    printSchema(graphqlSchema).replace(/"{3}[^"]*"{3}/gm, '')
  )

  return graphqlSchema
}
