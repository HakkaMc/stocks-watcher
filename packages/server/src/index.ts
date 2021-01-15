import express from 'express'
import bodyParser from 'body-parser'
import { ApolloServer } from 'apollo-server-express'
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer'
import { getSymbols } from './finnhub/finnhubClient'
import { initDatabase } from './database'
import { SymbolTsModel } from './database/symbol/schema'
import { UserTsModel } from './database/user/schema'
import './finnhub/finnhubSocket'
import {startComputing} from './compute'

// stockSymbols().then(stocks=>{
//     console.log(stocks.length)
// })

import { createServer } from 'http'

const start = async () => {
  const graphqlSchema = await initDatabase()

  // Init symbols DB
  const symbol = await SymbolTsModel.findOne({})
  if (!symbol || (symbol && new Date(symbol.updatedAt).getTime() + 60 * 60 * 1000 < Date.now())) {
    const symbols = await getSymbols()
    const promiseArray: Array<any> = []
    // for(let i=0;i<symbols.length;i++) {
    symbols.forEach((symbolObj) => {
      // promiseArray.push(new Promise((resolve, reject)=>{
      //     SymbolTsModel.find({symbol: symbolObj.symbol}, async (error, data)=>{
      //         if(!error && !data ){
      //             await SymbolTsModel.create({symbol: symbolObj.symbol})
      //
      //         }
      //
      //         resolve(null)
      //     })
      // }))

      promiseArray.push(SymbolTsModel.replaceOne({ symbol: symbolObj.symbol }, symbolObj, { upsert: true }))
    })
    Promise.all(promiseArray).then(() => {
      console.log('All symbols saved')
    })
  }

  // Init admin user
  const admin = await UserTsModel.findOne({ name: 'admin' })
  if (!admin) {
    new UserTsModel({
      name: 'admin',
      dashboard: {
        watchedSymbols: []
      }
    }).save()
  }

  // Init apollo server
  const apolloServer = new ApolloServer({
    schema: graphqlSchema,
    context: async (contextArguments: ExpressContext) => {
      if (contextArguments.connection) {
        // check connection for metadata
        return contextArguments.connection.context
      }
      // check from req
      const token = contextArguments.req.headers.authorization || ''

      return { token }
    }
  })

  // Init express server
  const app = express()

  app.use('/graphql', bodyParser.json())

  apolloServer.applyMiddleware({ app })

  const httpServer = createServer(app)

  apolloServer.installSubscriptionHandlers(httpServer)

  const PORT = 5000

  // Start the server
  httpServer.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`)
    console.log(`Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`)

    startComputing()
  })
}
start().catch((ex) => {
  console.error(ex)
})
