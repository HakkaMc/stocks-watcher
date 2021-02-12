import { ResolverResolveParams } from 'graphql-compose'
import { symbolGraphql, SymbolTsModel, SymbolTsType } from './schema'

// const finSymbolRes = symbolGraphql.addResolver({
//     kind: 'query',
//     name: 'findSymbol',
//     type: symbolGraphql,
//     args: {
//         text: 'String',
//         symbol: 'String'
//     },
//     resolve: async (params: ResolverResolveParams<any, any, any>)=>{
//         const symbols = await SymbolTsModel.find({ $text: { $search: params.args.text } })
//         return symbols || []
//     },
// })

// symbolGraphql.getResolver('findMany').addFilter

// symbolGraphql.mongooseResolvers.findMany.addFilterArg({
//     name: 'search',
//     type: 'String',
//     query: (query, value, resolveParams) => {
//         resolveParams.args.sort = {
//             score: { $meta: 'textScore' },
//         };
//         query.$text = { $search: value, $language: 'en' };
//         resolveParams.projection.score = { $meta: 'textScore' };
//     },
// })

// @ts-ignore
// symbolGraphql.mongooseResolvers.findMany.addFilterArg({
//     name: 'search',
//     type: 'String', // also can be 'Int Float Boolean ID String! [String] AnyNamedType'
//     description: 'Search by regExp',
//     query: (rawQuery:any, value:any, resolveParams:any) => {
//         rawQuery = {
//             '$or': [
//                 { firstName: new RegExp(value, 'i') },
//                 { lastName: new RegExp(value, 'i') },
//                 { email: new RegExp(value, 'i') }
//             ]
//         }
//     },
// })

// symbolGraphql.wrapResolverResolve('mongooseResolvers.findMany', (next) => async (rp) => {
//     return next(rp)
// })

// console.log(symbolGraphql.mongooseResolvers.findMany())
// symbolGraphql.wrapResolverResolve('updateById', next => async rp => {
//
//     // extend resolve params with hook
//     // rp.beforeRecordMutate = async (doc, resolveParams) => { ... };
//
//     return next(rp);
// });

export const symbolResolvers = {
  query: {
    findSymbols: symbolGraphql.mongooseResolvers.findMany().addFilterArg({
      name: 'search',
      type: 'String',
      query: (query, value, resolveParams) => {
        const search = `\"${value}\"`
        return query.$text = {
          $search: search,
          $caseSensitive: false,
          $diacriticSensitive: false
        }
      }
    })
  }
}
