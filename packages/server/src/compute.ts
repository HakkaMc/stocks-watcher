import SendMail from 'sendmail'

import { getStockPrices } from './finnhub/finnhubClient'
import { UserTsType } from './database/user/schema'
import { DashboardTsModel, DashboardTsType } from './database/dashboard/schema'
import { ServerSettingTsModel } from './database/serverSetting/schema'
import { SymbolTsModel, SymbolTsType } from './database/symbol/schema'
import { ceilToMinute, getDayPoints } from '@sw/shared/src/time'
import {PriceAlertTsModel, PriceAlertTsType} from './database/priceAlert/schema'
import { getLastPrice } from './cache'

const sendMail = SendMail({})

const computeIntervalGain = async () => {
  console.log('computeIntervalGain')
  await ServerSettingTsModel.updateOne({}, { lastVolatilityCheckTimestamp: Date.now() }, { upsert: true })

  const now = Date.now()
  const dayPoints = getDayPoints()
  const openedStockHours = now >= dayPoints.stockStart.getTime() && now <= dayPoints.stockEnd.getTime()
  const to = ceilToMinute(now)
  const from = new Date(to)
  from.setMinutes(-11)

  const watchedSymbols = new Set<string>()
  const symbolToEmailsMap: Record<string, Set<string>> = {} // key is symbol, array is a list of emails
  let dashboards: Array<DashboardTsType & { user: UserTsType }> = []

  const results = await DashboardTsModel.find({}).populate('user')

  if (Array.isArray(results)) {
    // @ts-ignore
    dashboards = results
  } else {
    dashboards.push(results)
  }

  dashboards.forEach((dashboard) => {
    dashboard.watchlists?.forEach((wl) => {
      wl.symbols?.forEach((symbol) => {
        if (symbol) {
          watchedSymbols.add(symbol)

          if (!symbolToEmailsMap[symbol]) {
            symbolToEmailsMap[symbol] = new Set()
          }

          if (dashboard.user) {
            symbolToEmailsMap[symbol].add(dashboard.user?.email)
          }
        }
      })
    })
  })

  const watchedSymbolsArray = Object.keys(watchedSymbols)

  for (let i = 0; i < watchedSymbolsArray.length; i += 1) {
    const symbol = watchedSymbolsArray[i]
    const symbolObj = await SymbolTsModel.findOne({ symbol })

    if (symbolObj && (openedStockHours || symbolObj?.type.toLowerCase() === 'crypto')) {
      const prices = await getStockPrices(symbolObj.symbol, from.getTime(), to.getTime(), '5')

      if (prices?.length) {
        const startPriceObj = prices[0]
        const endPriceObj = prices[prices.length - 1]

        const gain = (100 / startPriceObj.price) * endPriceObj.price - 100

        if (gain > 5 || gain < -5) {
          symbolToEmailsMap[symbolObj.symbol].forEach((email: string) => {
            sendMail(
              {
                from: 'HakkaMc@gmail.com',
                to: email,
                subject: `Rapid stock raise/fall: ${symbolObj.symbol} ${gain}`
              },
              (error: any, reply: any) => {
                console.error(error && error.stack)
                // console.dir(reply);
              }
            )
          })
        }
      }
    }
  }
}

const computePriceHit = async () => {
  console.log('computePriceHit')
  const alerts = PriceAlertTsModel.find({}).populate('user')

  if (Array.isArray(alerts)) {
    const watchedSymbols = new Set<string>()
    const symbolToAlertMap:Record<string, Set<PriceAlertTsType>> = {}

    alerts.forEach((alert) => {
      const symbol = alert.symbol

      watchedSymbols.add(symbol)

      if(!symbolToAlertMap[symbol]){
        symbolToAlertMap[symbol] = new Set<PriceAlertTsType>()
      }

      symbolToAlertMap[symbol].add(alert)
    })

    const watchedSymbolsArray = Object.keys(watchedSymbols)

    for (let i = 0; i < watchedSymbolsArray.length; i += 1) {
      const symbol = watchedSymbolsArray[i]
      const symbolObj = await SymbolTsModel.findOne({ symbol })

      if (symbolObj) {
        const price = await getLastPrice(symbol)
        if (price !== undefined) {
          symbolToAlertMap[symbol].forEach(alertObj=>{
            if((alertObj.actualPrice<alertObj.targetPrice && price<alertObj.targetPrice) || (alertObj.actualPrice>alertObj.targetPrice && price>alertObj.targetPrice)){
              const user = alertObj.user as UserTsType

              sendMail(
                  {
                    from: 'HakkaMc@gmail.com',
                    to: user.email,
                    subject: `${symbol} hit the price: ${price}`
                  },
                  (error: any) => {
                    console.error(error && error.stack)
                  }
              )

              PriceAlertTsModel.deleteOne({_id: alertObj._id})
            }
          })
        }
      }
    }
  }
}

export const startComputing = async () => {
  const now = Date.now()
  const setting = await ServerSettingTsModel.findOne({})

  if (!setting?.lastVolatilityCheckTimestamp || (setting?.lastVolatilityCheckTimestamp || 0) < now - 10 * 60 * 1000) {
    computeIntervalGain()
  }

  setInterval(computeIntervalGain, 10 * 60 * 1000)

  if (!setting?.lastPriceHitCheckTimestamp || (setting?.lastPriceHitCheckTimestamp || 0) < now - 3 * 60 * 1000) {
    computePriceHit()
  }

  setInterval(computePriceHit, 3 * 60 * 1000)
}
