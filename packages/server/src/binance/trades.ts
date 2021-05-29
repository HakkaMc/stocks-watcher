import mongoose from 'mongoose'
import { BinanceTradeTsModel } from '../database/binanceTrade/schema'
import { getTrades, getAccountInformation, getExchangeInfo } from './queries'

const quoteAssets = ['USDT', 'BUSD']

const inProgressMap: Record<string, boolean> = {}

const getStartTime = async (userId: string, symbol: string) => {
  const lastTrade = await BinanceTradeTsModel.find({ user: mongoose.Types.ObjectId(userId), symbol }, null, {
    sort: {
      time: -1
    },
    limit: 1
  })

  let startTime = 0
  if (lastTrade && Array.isArray(lastTrade) && lastTrade.length) {
    startTime = lastTrade[0].time + 1
  }

  return startTime
}

export const syncTrades = async (userId: string, specificAssets: Array<string> | undefined = []) => {
  if (!inProgressMap[userId]) {
    inProgressMap[userId] = true

    console.log('syncTrades')

    // TODO - cache exchange info
    const exchangeInfo = await getExchangeInfo()
    const accInfo = await getAccountInformation()

    if (!accInfo.error && accInfo.data?.balances.length && !exchangeInfo.error) {
      for (let i = 0; i < accInfo.data?.balances?.length; i++) {
        const balance = accInfo.data?.balances[i]
        const assetAmount = balance.free + balance.locked

        if (
          assetAmount > 0 &&
          !quoteAssets.includes(balance.asset) &&
          (!specificAssets?.length || specificAssets?.includes(balance.asset))
        ) {
          for (let j = 0; j < quoteAssets.length; j++) {
            const symbol = `${balance.asset}${quoteAssets[j]}`

            let startTime = await getStartTime(userId, symbol)

            if (exchangeInfo.data[symbol]) {
              console.log(symbol, ' get trades from timestamp: ', new Date(startTime).toISOString())

              let repeat = true

              while (repeat) {
                const trades = await getTrades(symbol, startTime)

                if (!trades.error && trades.data.length) {
                  // TODO - if data.length >= 1000, then call getTrades again

                  for (let k = 0; k < trades.data.length; k++) {
                    const trade = trades.data[k]

                    const enhancedData: any = {
                      ...trade,
                      user: mongoose.Types.ObjectId(userId),
                      baseAsset: balance.asset,
                      quoteAsset: quoteAssets[j],
                      tradeId: trade.id
                    }
                    delete enhancedData.id

                    await new BinanceTradeTsModel(enhancedData).save()
                  }

                  if (trades.data.length >= 1000) {
                    startTime = await getStartTime(userId, symbol)
                  } else {
                    repeat = false
                  }
                } else {
                  repeat = false
                }
              }
            }
          }
        }
      }
    }
  }

  inProgressMap[userId] = false
}

// export const syncTradesDemo = async () => {
//   const user: any = await UserTsModel.findOne({ email: 'hakkamc@gmail.com' })
//
//   if (user?.email) {
//     syncTrades(user._id.toString())
//   } else {
//     console.log('syncTradesDemo error')
//   }
// }
