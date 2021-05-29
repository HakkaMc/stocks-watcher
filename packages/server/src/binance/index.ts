import mongoose from 'mongoose'
import { BinanceBalance, BinanceTrade } from '@sw/shared/src/graphql'
import crypto from 'crypto'

import { BinanceTradeTsModel } from '../database/binanceTrade/schema'
import { ReturnPromise } from '../types'
import { getAccountInformation } from './queries'
import { BinanceProfileTsModel, BinanceProfileTsType } from '../database/binanceProfile/schema'
import { syncTrades } from './trades'
import { pubSub } from '../pubSub'

const inProgressMap: Record<string, boolean> = {}

const processAsset = async (userId: string, asset: string, quantity: number) => {
  const profile: BinanceProfileTsType | null = await BinanceProfileTsModel.findOne({ user: userId })

  let assetData = await profile?.countedBalance?.find((item) => item.asset === asset)

  if (!assetData) {
    assetData = {
      asset,
      quantity: 0,
      amount: 0,
      averagePurchasePrice: -1,
      realizedProfit: 0,
      lastTradeTimestamp: -1
    }

    await BinanceProfileTsModel.updateOne({ user: userId }, { $push: { countedBalance: assetData } })
  }

  const trades = await BinanceTradeTsModel.find(
    { user: userId, baseAsset: asset, time: { $gt: assetData.lastTradeTimestamp } },
    null,
    {
      sort: {
        time: 1
      }
    }
  )

  if (trades.length) {
    const rep = {
      quantity: assetData.quantity,
      averagePurchasePrice: assetData.averagePurchasePrice, // Average bought price per share
      realizedProfit: assetData.realizedProfit,
      amount: assetData.amount // Amount bought in BUSD
    }
    let lastTradeTimestamp = 0

    trades.forEach(({ price, qty, isBuyer, commission, commissionAsset, time, tradeId }: BinanceTrade) => {
      lastTradeTimestamp = time

      if (isBuyer) {
        if (['BUSD', 'USDT'].includes(commissionAsset.toUpperCase())) {
          rep.realizedProfit -= commission
          rep.quantity += qty
          rep.amount += price * qty
        } else if (commissionAsset.toUpperCase() === asset) {
          rep.quantity += qty - commission
          rep.amount += price * (qty - commission)
        }
        // Commission is BNB
        else {
          // TODO -
          rep.quantity += qty
          rep.amount += price * qty
        }

        rep.averagePurchasePrice = rep.amount / rep.quantity
      } else {
        if (['BUSD', 'USDT'].includes(commissionAsset.toUpperCase())) {
          rep.realizedProfit -= commission
          rep.quantity -= qty
          rep.realizedProfit += price * qty - rep.averagePurchasePrice * qty
        } else if (commissionAsset.toUpperCase() === asset) {
          rep.quantity -= qty + commission
          rep.realizedProfit += price * (qty - commission) - rep.averagePurchasePrice * (qty - commission)
        }
        // Commission is BNB
        else {
          // TODO -
          rep.quantity -= qty
          rep.realizedProfit += price * qty - rep.averagePurchasePrice * qty
        }

        rep.amount = rep.averagePurchasePrice * rep.quantity
      }

      // if(asset === 'BNB') {
      //   console.log(price, qty, isBuyer, rep.realizedProfit)
      // }
    })

    // Counted and returned quantity is different, so it's necessary to count the bought price using the
    // quantity return from binance.
    rep.quantity = quantity
    rep.amount = rep.averagePurchasePrice * quantity

    await BinanceProfileTsModel.updateMany(
      // { user: userId, 'countedBalance.asset': asset },
      {
        user: userId,
        countedBalance: {
          $elemMatch: {
            asset
          }
        }
      },
      {
        $set: {
          'countedBalance.$.quantity': rep.quantity,
          'countedBalance.$.amount': rep.amount,
          'countedBalance.$.averagePurchasePrice': rep.averagePurchasePrice,
          'countedBalance.$.realizedProfit': rep.realizedProfit,
          'countedBalance.$.lastTradeTimestamp': lastTradeTimestamp
        }
      }
    )
  }
}

const processDollar = async (userId: string, asset: string, quantity: number) => {
  const profile: BinanceProfileTsType | null = await BinanceProfileTsModel.findOne({ user: userId })

  let assetData = await profile?.countedBalance?.find((item) => item.asset === asset)

  if (!assetData) {
    assetData = {
      asset,
      quantity,
      amount: quantity,
      averagePurchasePrice: 1,
      realizedProfit: 0,
      lastTradeTimestamp: 0
    }

    await BinanceProfileTsModel.updateOne({ user: userId }, { $push: { countedBalance: assetData } })
  } else {
    await BinanceProfileTsModel.updateMany(
      {
        user: userId,
        countedBalance: {
          $elemMatch: {
            asset
          }
        }
      },
      {
        $set: {
          'countedBalance.$.quantity': quantity,
          'countedBalance.$.amount': quantity,
          'countedBalance.$.averagePurchasePrice': 1,
          'countedBalance.$.realizedProfit': 0,
          'countedBalance.$.lastTradeTimestamp': 0
        }
      }
    )
  }
}

export const countBalance = async (userId: string): ReturnPromise =>
  new Promise(async (resolve) => {
    console.log('countBalance')

    if (!inProgressMap[userId]) {
      inProgressMap[userId] = true

      const accountExists = await BinanceProfileTsModel.exists({ user: userId })

      if (!accountExists) {
        await new BinanceProfileTsModel({
          user: mongoose.Types.ObjectId(userId),
          lastBalanceHash: '',
          countedBalance: []
        }).save()
      }

      const accountInfo = await getAccountInformation()

      if (!accountInfo.error) {
        const balances = accountInfo.data?.balances || []

        const lastBalanceHash = crypto
          .createHmac('sha256', 'BINANCE_BALANCE')
          .update(JSON.stringify(balances))
          .digest('hex')

        const sameHash = await BinanceProfileTsModel.exists({ user: userId, lastBalanceHash })
        // const sameHash = false

        if (!sameHash) {
          console.log('hash changed')

          const binanceProfile = await BinanceProfileTsModel.findOne({ user: userId }, { lastBalanceData: 1 })
          const cachedBalances: Array<BinanceBalance> = binanceProfile?.lastBalanceData || []
          const cachedBalancesMap: Record<string, BinanceBalance> = {}
          cachedBalances.forEach((balance) => {
            cachedBalancesMap[balance.asset] = balance
          })

          const portfolioAssets = new Set<string>()
          const assetsToRefresh: Array<string> = []

          balances.forEach((balance) => {
            portfolioAssets.add(balance.asset)
            if (
              !cachedBalancesMap[balance.asset] ||
              cachedBalancesMap[balance.asset].free !== balance.free ||
              cachedBalancesMap[balance.asset].locked !== balance.locked
            ) {
              assetsToRefresh.push(balance.asset)
            }
          })

          cachedBalances.forEach((balance) => {
            if (!portfolioAssets.has(balance.asset)) {
              assetsToRefresh.push(balance.asset)
            }
          })

          if (assetsToRefresh.length) {
            await syncTrades(userId, assetsToRefresh)
          }

          for (let i = 0; i < balances.length; i++) {
            const asset = balances[i].asset.toUpperCase()
            const quantity = balances[i].free + balances[i].locked

            if (['USDT', 'BUSD'].includes(asset)) {
              await processDollar(userId, asset, quantity)
            } else if (quantity > 0) {
              await processAsset(userId, asset, quantity)
            }
          }

          await BinanceProfileTsModel.updateOne({ user: userId }, { lastBalanceHash, lastBalanceData: balances })

          pubSub.publish(`BINANCE_BALANCE_UPDATE`, undefined)
        }

        console.log('countBalance done')
        inProgressMap[userId] = false

        return resolve({
          error: '',
          errorData: '',
          data: ''
        })
      }

      console.log('countBalance done')
      inProgressMap[userId] = false

      return resolve({
        error: 'COUNT_BINANCE_BALANCE_FAILED',
        errorData: accountInfo.error,
        data: ''
      })
    }

    console.log('countBalance done without processing')
    inProgressMap[userId] = false

    return resolve({
      error: '',
      errorData: '',
      data: ''
    })
  })
