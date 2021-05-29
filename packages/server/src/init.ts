import mongoose from 'mongoose'
import { SymbolTsModel } from './database/symbol/schema'
import { getSymbols } from './finnhub/finnhubClient'
import { UserTsModel } from './database/user/schema'
import { DashboardTsModel } from './database/dashboard/schema'
import { ServerSettingTsModel } from './database/serverSetting/schema'

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
