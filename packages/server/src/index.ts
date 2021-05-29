import { httpServer } from './expressServer'

import './finnhub/finnhubSocket'
import { startComputing } from './compute'
import { startReminder } from './reminder'

import { initApolloServer } from './apolloServer'
import { initAdmin, initSymbols } from './init'
import { connectWebsocket } from './binance/ws'
import { connectUserDataWebsocket } from './binance/wsUserData'
import { computeOrders } from './computes/computeOrders'

const PORT = process.env.port || 5000

const start = async () => {
  // await getExchangeInfo()
  // await getAccountInfo()
  // await getReport()
  const apolloServer = await initApolloServer()

  await initAdmin()

  // initSymbols()

  // startComputing()

  startReminder()

  connectUserDataWebsocket()
  connectWebsocket()

  computeOrders()

  // Start the server
  httpServer.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`)
    console.log(`Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`)
  })
}
start().catch((ex) => {
  console.error(ex)
})
