import mongoose from 'mongoose'
import { SymbolTsModel } from './database/symbol/schema'
import { getSymbols } from './finnhub/finnhubClient'
import { UserTsModel } from './database/user/schema'
import { DashboardTsModel } from './database/dashboard/schema'

// Init symbols DB
export const initSymbols = async () => {
  console.log('initSymbols')
  const symbol = await SymbolTsModel.findOne({})
  if (!symbol || (symbol && new Date(symbol.updatedAt).getTime() + 60 * 60 * 1000 < Date.now())) {
    const symbols = await getSymbols()
    const promiseArray: Array<any> = []
    symbols.forEach((symbolObj) => {
      promiseArray.push(SymbolTsModel.replaceOne({ symbol: symbolObj.symbol }, symbolObj, { upsert: true }))
    })
    Promise.all(promiseArray).then(() => {
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
