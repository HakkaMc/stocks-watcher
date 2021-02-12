import { ResolverResolveParams } from 'graphql-compose'
import { GraphQLResolveInfo } from 'graphql/type/definition'
import mongoose from 'mongoose'
import { userGraphql, UserTsModel, UserTsType } from './schema'
import { SymbolTsType, SymbolTsModel, symbolGraphql } from '../symbol/schema'

// userGraphql.addRelation('dashboardwatchedSymbols', {
//     resolver: () => symbolGraphql.mongooseResolvers.dataLoader(),
//     prepareArgs: {
//         _id: (source: UserTsType) => {
//             console.log(source)
//             return source.dashboard.watchedSymbols
//         }
//     },
//     // projection: { dashboard: {watchedSymbols: 1 }}
//     projection: { watchedSymbols: 1 }
// })

// userGraphql.addRelation('flags', {
//   resolver: (args: Record<string, any>) => {
//     const user = UserTsModel.findOne({_id: args.userId})//  symbolGraphql.mongooseResolvers.findByIds()
//     const flags: any[] = user.flags.toJson()
//     // const flagMap: Record<string, any> = {}
//     const flagArray: any[] = []
//     flags.forEach(flagObj=>{
//       // flagMap[flagObj['_id']] = flagObj
//       if(args.ids.includes(flagObj['_id'])) {
//         flagArray.push[flagObj]
//       }
//     })
//     return flagArray
//   },
//   prepareArgs: {
//     ids: (source: any) => source.flags||[],
//     userId: (source: any) => source['_id']
//   },
//   projection: { flags: 1 }
// })

// export const userResolvers = {
//   query: {
//     getUserProfile: userGraphql.getResolver('getUserProfile')
//   }
// }
