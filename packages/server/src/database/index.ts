import fs from 'fs'
import { printSchema } from 'graphql/utilities'
import mongoose from 'mongoose'
import { schemaComposer } from 'graphql-compose'

import { symbolResolvers } from './symbol/resolvers'
import { dashboardResolvers } from './dashboard/resolvers'
import { finnhubResolvers } from '../finnhub/resolvers'
import { chartGroupResolvers } from './chartGroup/resolvers'
import { noteResolvers } from './note/resolvers'
import { priceAlertResolvers } from './priceAlert/resolvers'
import { reminderResolvers } from './reminder/resolvers'

export const initDatabase = async () => {
  console.log('initDatabase')

  await mongoose.connect('mongodb://localhost:27017/stocksWatcher', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })

  schemaComposer.Query.addFields({
    ...symbolResolvers.query,
    ...dashboardResolvers.query,
    ...finnhubResolvers.query,
    ...chartGroupResolvers.query,
    ...noteResolvers.query,
    ...priceAlertResolvers.query,
    ...reminderResolvers.query
  })

  schemaComposer.Mutation.addFields({
    ...dashboardResolvers.mutation,
    ...chartGroupResolvers.mutation,
    ...noteResolvers.mutation,
    ...priceAlertResolvers.mutation,
    ...reminderResolvers.mutation
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
