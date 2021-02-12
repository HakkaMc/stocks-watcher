import { httpServer } from './expressServer'

import './finnhub/finnhubSocket'
// import { startComputing } from './compute'

import { initApolloServer } from './apolloServer'
import { initAdmin, initSymbols } from './init'

const PORT = 5000

const start = async () => {
  const apolloServer = await initApolloServer()

  await initAdmin()

  await initSymbols()

  // Start the server
  httpServer.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`)
    console.log(`Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`)

    // startComputing()
  })
}
start().catch((ex) => {
  console.error(ex)
})
