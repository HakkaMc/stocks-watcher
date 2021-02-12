import { ApolloServer } from 'apollo-server-express'
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer'
// import expressSession from "express-session";

import { expressServer, httpServer, session } from './expressServer'
import { initDatabase } from './database'

export const initApolloServer = async () => {
  const graphqlSchema = await initDatabase()

  console.log('init ApolloServer')
  const apolloServer = new ApolloServer({
    debug: true,
    schema: graphqlSchema,
    context: async (contextArguments: ExpressContext) => {
      //     // check from req
      //     const accessToken = contextArguments.req?.headers?.authorization || ''
      //     // console.log('session: ', contextArguments.req?.session)

      //     console.log('apolloServer: accessToken: ', accessToken)
      //     console.log('apolloServer: cookies: ', contextArguments.req?.cookies)
      //     console.log('apolloServer: headers: ', contextArguments.req?.headers)
      //     // console.log('context:', contextArguments.connection?.context)
      //
      if (contextArguments.connection) {
        //     //     // check connection for metadata
        return contextArguments.connection.context
      }
      //
      //
      //
      //     console.log('apolloServer: session ID: ', contextArguments.req?.session.id)
      //     console.log('apolloServer: userId: ', contextArguments.req?.session.userId)

      return { ...contextArguments.req }
    },
    // subscriptions: {
    //     onConnect: (params, websocket, context) => {
    //         console.log('sub context: ')
    //         // @ts-ignore
    //         const req = websocket.upgradeReq;
    //
    //         console.log('sub session id: ', req.session.id)
    //
    //         // const res = {} as any;
    //     }
    // }
    subscriptions: {
      onConnect: async (connectionParams, webSocket, context) => {
        const wsSession: any = await new Promise((resolve) => {
          // use same session parser as normal gql queries
          // @ts-ignore
          session(webSocket.upgradeReq, {}, () => {
            // @ts-ignore
            if (webSocket.upgradeReq.session) {
              // @ts-ignore
              resolve(webSocket.upgradeReq.session)
            }
            return false
          })
        })
        // console.log('wsSession: ', wsSession)
        // We have a good session. attach to context
        if (wsSession.userId) {
          return { session: wsSession }
        }

        // throwing error rejects the connection
        throw new Error('Missing auth!')

        // const promise = new Promise((resolve, reject) => {
        //     const req = context.request as express.Request;
        //     const res = ({} as any) as express.Response;
        //     sessionHandler(req, res, next => {
        //         const userId = req.session && req.session.userId;
        //         return resolve({userId});
        //     });
        // });
        // return promise;
      }
    }
  })

  apolloServer.applyMiddleware({
    app: expressServer,
    // path: '/graphql',
    cors: false
    // cors: {
    //     origin: 'https://localhost:4001',
    //     credentials: true
    //    }
  })

  apolloServer.installSubscriptionHandlers(httpServer)

  return apolloServer
}
