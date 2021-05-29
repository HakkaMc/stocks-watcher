import { BinanceProfileGraphql } from './schema'
import { ResolverContext } from '../../types'

let getBinanceProfile = BinanceProfileGraphql.mongooseResolvers.findOne()
getBinanceProfile = getBinanceProfile.withMiddlewares([
  async (resolve, source, args, context: ResolverContext, info) => {
    const enhancedArgs: any = {
      ...(args || {})
    }

    if (!enhancedArgs.filter) {
      enhancedArgs.filter = {}
    }

    enhancedArgs.filter.user = context.session.userId

    const res = await resolve(source, enhancedArgs, context, info)

    return res
  }
])

export const binanceProfileResolvers = {
  query: {
    getBinanceProfile
  },
  mutation: {}
}
