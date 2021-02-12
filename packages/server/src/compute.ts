import SendMail from 'sendmail'

import { Symbol as SymbolType } from '@sw/shared/src/graphql'
import { pubSub } from './pubSub'

import { getStockPrices } from './finnhub/finnhubClient'
import { UserTsModel } from './database/user/schema'
import { DashboardTsModel } from './database/dashboard/schema'

const sendMail = SendMail({})

const compute = async () => {
  const to = new Date()
  const from = new Date(to)
  from.setMinutes(from.getMinutes() - 10)

  const user = await UserTsModel.findOne({ name: 'admin' })
  const dashboard = await DashboardTsModel.findOne({ user: user?._id })
  // @ts-ignore
  const watchedSymbols: Array<string> = dashboard?.watchedSymbols || []

  for (let i = 0; i < watchedSymbols.length; i++) {
    const symbol = watchedSymbols[i]
    // console.log(symbol)
    const prices = await getStockPrices(
      symbol,
      parseInt((from.getTime() / 1000).toString()),
      parseInt((to.getTime() / 1000).toString()),
      '1'
    )

    if (prices && prices.length) {
      const startPriceObj = prices[0]
      const endPriceObj = prices[prices.length - 1]

      // console.log(startPriceObj, endPriceObj)
      // console.log(new Date(startPriceObj.timestamp*1000).toLocaleString(), new Date(endPriceObj.timestamp*1000).toLocaleString())

      const gain = (100 / startPriceObj.price) * endPriceObj.price - 100

      // console.log('gain: ', symbol.symbol, gain)
      // console.log('length: ', prices.length)

      if (gain > 5 || gain < -5) {
        // TODO - push notification
        sendMail(
          {
            from: 'HakkaMc@gmail.com',
            to: 'HakkaMc@gmail.com',
            subject: `Rapid stock raise/fall: ${symbol} ${gain}`
          },
          (error: any, reply: any) => {
            console.log(error && error.stack)
            // console.dir(reply);
          }
        )
      }
    }
    // return
  }
}

export const startComputing = async () => {
  await compute()
  setInterval(compute, 10 * 60 * 1000)
}
