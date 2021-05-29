import mongoose from 'mongoose'
import { SymbolTsModel } from './database/symbol/schema'
import { getSymbols } from './finnhub/finnhubClient'
import { UserTsModel } from './database/user/schema'
import { DashboardTsModel } from './database/dashboard/schema'
import { ServerSettingTsModel } from './database/serverSetting/schema'
import { BinanceSymbolTsModel } from './database/binanceSymbol/schema'
import { getExchangeInfo } from './binance/queries'

// Init symbols DB
export const initSymbols = async () => {
  console.log('initSymbols on background...')
  const serverSetting = await ServerSettingTsModel.findOne({}, 'lastSymbolsUpdateTimestamp')

  if (!serverSetting || (serverSetting?.lastSymbolsUpdateTimestamp || 0) < Date.now() - 60 * 60 * 1000) {
    const symbols = await getSymbols()
    const promiseArray: Array<any> = []

    symbols.forEach((symbolObj) => {
      promiseArray.push(SymbolTsModel.replaceOne({ symbol: symbolObj.symbol }, symbolObj as any, { upsert: true }))
    })

    Promise.all(promiseArray).then(async () => {
      await ServerSettingTsModel.updateOne({}, { lastSymbolsUpdateTimestamp: Date.now() }, { upsert: true })
      console.log('All symbols saved')
    })
  }
}

// Init admin user
export const initAdmin = async () => {
  console.log('initAdmin')
  const admin = await UserTsModel.findOne({ name: 'admin' })
  if (!admin) {
    const user = new UserTsModel({
      name: `admin`,
      email: 'admin'
    })
    await user.save()

    const flagId = mongoose.Types.ObjectId()

    await new DashboardTsModel({
      user: user._id,
      watchedSymbols: [
        {
          symbol: 'APPL',
          flags: [flagId]
        }
      ],
      flags: [{ name: 'Default', _id: flagId }]
    }).save()
  }
}

export const initBinanceSymbols = async () => {
  console.log('init binance symbols')

  let lastUpdateTimestamp = 0

  const binanceSymbolArray = await BinanceSymbolTsModel.find(
    {},
    { updatedAt: 1 },
    {
      sort: {
        updatedAt: 1
      },
      limit: 1
    }
  )

  if (Array.isArray(binanceSymbolArray) && binanceSymbolArray.length) {
    lastUpdateTimestamp = new Date(binanceSymbolArray[0].updatedAt).getTime()
  }

  console.log(
    lastUpdateTimestamp,
    Date.now() - 12 * 60 * 60 * 1000,
    lastUpdateTimestamp < Date.now() - 12 * 60 * 60 * 1000
  )

  if (lastUpdateTimestamp < Date.now() - 12 * 60 * 60 * 1000) {
    const result = await getExchangeInfo()

    if (result.error) {
      console.log('initBinanceSymbols error: ', result.error)
    } else if (Object.keys(result.data).length) {
      const promiseArray: Array<any> = ([] = [])

      Object.values(result.data).forEach((item) => {
        promiseArray.push(
          BinanceSymbolTsModel.replaceOne({ symbol: item.symbol }, item as any, {
            upsert: true,
            setDefaultsOnInsert: true
          })
        )
      })

      await Promise.all(promiseArray).then(
        (resp) => {
          console.log('Binance symbol database updated: ')
        },
        (error) => {
          console.log('initBinanceSymbols error: ', error)
        }
      )
    }
  }
}
