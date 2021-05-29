import { httpServer } from './expressServer'

import './finnhub/finnhubSocket'
import { startComputing } from './computes/compute'
import { startReminder } from './computes/reminder'

import { initApolloServer } from './apolloServer'
import { initAdmin, initBinanceSymbols, initSymbols } from './init'
import { computeOrders } from './computes/computeOrders'
//
const PORT = process.env.port || 5000

const start = async () => {
  const apolloServer = await initApolloServer()

  await initAdmin()

  initSymbols()
  initBinanceSymbols()

  startComputing()

  startReminder()

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
