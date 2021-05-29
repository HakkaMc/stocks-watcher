import { ceilToMinute, getDayPoints } from '@sw/shared/src/time'
import { getStockPrices } from './finnhub/finnhubClient'
import { UserTsType } from './database/user/schema'
import { DashboardTsModel, DashboardTsType } from './database/dashboard/schema'
import { ServerSettingTsModel } from './database/serverSetting/schema'
import { SymbolTsModel, SymbolTsType } from './database/symbol/schema'
import { PriceAlertTsModel, PriceAlertTsType } from './database/priceAlert/schema'
import { getLastPrice } from './cache'
import { sendEmail } from './emailSender'

const getIsStockOpened = () => {
  const dayPoints = getDayPoints()
  const now = Date.now()
  return now >= dayPoints.stockStart.getTime() && now <= dayPoints.stockEnd.getTime()
}

const computeIntervalGain = async () => {
  console.log('computeIntervalGain')

  await ServerSettingTsModel.updateOne({}, { lastVolatilityCheckTimestamp: Date.now() }, { upsert: true })

  const now = Date.now()
  const isStockOpened = getIsStockOpened()
  const to = ceilToMinute(now)
  const from = new Date(to)
  from.setMinutes(from.getMinutes() - 11)

  console.log(from, to)

  const watchedSymbols = new Set<string>()
  const symbolToEmailsMap: Record<string, Set<string>> = {} // key is symbol, array is a list of emails
  let dashboards: Array<DashboardTsType & { user: UserTsType }> = []

  const results = await DashboardTsModel.find({}).populate('user')

  if (Array.isArray(results)) {
    // @ts-ignore
    dashboards = results
  } else if (results) {
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

  const watchedSymbolsArray = Array.from(watchedSymbols)

  for (let i = 0; i < watchedSymbolsArray.length; i += 1) {
    const symbol = watchedSymbolsArray[i]
    const symbolObj = await SymbolTsModel.findOne({ symbol })

    if (symbolObj && (isStockOpened || symbolObj?.type.toLowerCase() === 'crypto')) {
      const prices = await getStockPrices(symbolObj.symbol, from.getTime(), to.getTime(), '5')

      if (prices?.length) {
        const startPriceObj = prices[0]
        const endPriceObj = prices[prices.length - 1]

        const gain = (100 / startPriceObj.price) * endPriceObj.price - 100

        if (gain > 5 || gain < -5) {
          symbolToEmailsMap[symbolObj.symbol].forEach((email: string) => {
            sendEmail(email, `Rapid stock raise/fall: ${symbolObj.symbol} ${gain.toFixed(2)}%`).catch((error) => {
              console.error('Send stock raise/fall email error: ', error)
            })
          })
        }
      }
    }
  }
}

const computePriceHit = async () => {
  console.log('computePriceHit')

  const now = Date.now()

  const isStockOpened = getIsStockOpened()

  const serverSetting = await ServerSettingTsModel.findOne({})

  const timestampFrom = serverSetting?.lastPriceHitCheckTimestamp || now - 3 * 60 * 1000

  await ServerSettingTsModel.updateOne({}, { lastPriceHitCheckTimestamp: now }, { upsert: true })

  const results = await PriceAlertTsModel.find({}).populate('user')

  let alerts: Array<PriceAlertTsType & { user: UserTsType }> = []

  if (Array.isArray(results)) {
    // @ts-ignore
    alerts = results
  } else if (results) {
    // @ts-ignore
    alerts.push(results)
  }

  if (alerts.length) {
    const watchedSymbols = new Set<string>()
    const symbolToAlertMap: Record<string, Set<PriceAlertTsType>> = {}

    alerts.forEach((alert) => {
      const { symbol } = alert

      watchedSymbols.add(symbol)

      if (!symbolToAlertMap[symbol]) {
        symbolToAlertMap[symbol] = new Set<PriceAlertTsType>()
      }

      symbolToAlertMap[symbol].add(alert)
    })

    const watchedSymbolsArray = Array.from(watchedSymbols)

    for (let i = 0; i < watchedSymbolsArray.length; i += 1) {
      const symbol = watchedSymbolsArray[i]
      const symbolObj = await SymbolTsModel.findOne({ symbol })

      if (symbolObj && (isStockOpened || symbolObj?.type.toLowerCase() === 'crypto')) {
        // const price = await getLastPrice(symbol)

        const prices = await getStockPrices(symbol, timestampFrom - 5 * 60 * 1000, Date.now(), '1')

        let minPrice = Number.MAX_VALUE
        let maxPrice = Number.MIN_VALUE
        prices?.forEach((priceObj) => {
          minPrice = Math.min(minPrice, priceObj.price)
          maxPrice = Math.max(maxPrice, priceObj.price)
        })

        console.log(symbol, minPrice, maxPrice)

        if (prices) {
          symbolToAlertMap[symbol].forEach((alertObj) => {
            const notifiedTimestamp = alertObj.notifiedTimestamp || 0
            const shouldNotify = now - notifiedTimestamp > 1 * 60 * 60 * 1000
            // console.log(alertObj.targetPrice, minPrice, maxPrice)
            // if((alertObj.actualPrice<alertObj.targetPrice && price<alertObj.targetPrice) || (alertObj.actualPrice>alertObj.targetPrice && price>alertObj.targetPrice)){
            if (shouldNotify && alertObj.targetPrice >= minPrice && alertObj.targetPrice <= maxPrice) {
              const user = alertObj.user as UserTsType

              sendEmail(user.email, `${symbol} hit the price: ${alertObj.targetPrice}`).catch((error) => {
                console.error('Send price hit email error: ', error)
              })

              // Wrapped by promise otherwise the delete is not finished
              // Promise.resolve(PriceAlertTsModel.deleteOne({_id: alertObj._id, user: user._id}))
              Promise.resolve(
                PriceAlertTsModel.updateOne({ _id: alertObj._id, user: user._id }, { notifiedTimestamp: now })
              )
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

  // if (!setting?.lastPriceHitCheckTimestamp || (setting?.lastPriceHitCheckTimestamp || 0) < now - 3 * 60 * 1000) {
  computePriceHit()
  // }

  setInterval(computePriceHit, 3 * 60 * 1000)
}
