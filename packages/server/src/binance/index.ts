import mongoose from 'mongoose'
import { BinanceBalance, BinanceProfileCountedBalance, BinanceTrade } from "@sw/shared/src/graphql";
import crypto from 'crypto'

import { BinanceTradeTsModel } from '../database/binanceTrade/schema'
import { ReturnPromise } from '../types'
import { getAccountInformation, getExchangeInfo } from './queries'
import { BinanceProfileTsModel, BinanceProfileTsType } from '../database/binanceProfile/schema'
import { syncTrades } from './trades'
import { pubSub } from '../pubSub'
import { dollarAssets, isDollarAsset } from '@sw/shared/src'

const inProgressMap: Record<string, boolean> = {}

const processAsset = async (userId: string, asset: string, quantity: number, recursion?: boolean):Promise<any> => {
  const BNBfees: Record<number, number> = {} // <timestamp, quantity>
  let lastTradeTimestamp = -1

  const profile: BinanceProfileTsType | null = await BinanceProfileTsModel.findOne({ user: userId })

  const lastBalanceAssetData = profile?.lastBalanceData?.find((item: BinanceProfileTsType['lastBalanceData']) => item.asset === asset)
  let lastBalanceAssetQuantity = -1
  if (lastBalanceAssetData) {
    lastBalanceAssetQuantity = lastBalanceAssetData.free + lastBalanceAssetData.locked
  }

  let countedAssetData = await profile?.countedBalance?.find((item) => item.asset === asset)

  // if (!countedAssetData || asset === 'SHIB') {
  if (!countedAssetData) {
    countedAssetData = {
      asset,
      quantity: 0,
      amount: 0,
      averagePurchasePrice: 0,
      realizedProfit: 0,
      lastTradeTimestamp: -1
    }

    await BinanceProfileTsModel.updateOne({ user: userId }, { $push: { countedBalance: countedAssetData } })

    lastTradeTimestamp = -1
  } else {
    lastTradeTimestamp = countedAssetData.lastTradeTimestamp

    // if (lastBalanceAssetQuantity > -1) {
    //   const diff = Math.abs(lastBalanceAssetQuantity - countedAssetData.quantity)
    //   if(diff>0) {
    //     const ref = Math.max(lastBalanceAssetQuantity, countedAssetData.quantity)
    //     const percentDiff = (100 / ref) * diff
    //     console.log(asset, ' percent diff before: ', percentDiff, '%', lastBalanceAssetQuantity, countedAssetData.quantity)
    //   }
    // }
  }

  const trades = await BinanceTradeTsModel.find(
    { user: userId, baseAsset: asset, time: { $gt: lastTradeTimestamp } },
    null,
    {
      sort: {
        time: 1
      }
    }
  )

  // TODO
  // Load deposits and withdrawals and put it to the timeline of trades
  // ------------

  const rep = {
    quantity: countedAssetData.quantity,
    averagePurchasePrice: countedAssetData.averagePurchasePrice, // Average bought price per share
    realizedProfit: countedAssetData.realizedProfit,
    amount: countedAssetData.amount, // Amount bought in BUSD
    lastTradeTimestamp: countedAssetData.lastTradeTimestamp
  }

  const hashBefore = crypto.createHmac('sha256', 'BINANCE_ASSET_BALANCE').update(JSON.stringify(rep)).digest('hex')

  if(asset==='XTZ'){
    console.log('XTZ trades length: ', trades.length, 'timestamp: ', new Date(rep.lastTradeTimestamp).toLocaleString())
  }

  if (trades.length) {
    trades.forEach(({ price, qty, isBuyer, commission, commissionAsset, time, tradeId }: BinanceTrade) => {
      rep.lastTradeTimestamp = time

      if (isBuyer) {
        if (isDollarAsset(commissionAsset.toUpperCase())) {
          rep.averagePurchasePrice = (rep.quantity * rep.averagePurchasePrice + qty * price) / (rep.quantity+qty)
          rep.realizedProfit -= commission
          rep.quantity += qty
          // rep.amount += price * qty
        } else if (commissionAsset.toUpperCase() === asset) {
          rep.averagePurchasePrice = (rep.quantity * rep.averagePurchasePrice + qty * price) / (rep.quantity+qty)
          rep.realizedProfit -= commission * price
          rep.quantity += qty
          // rep.amount += price * qty
        }
        // Commission is BNB
        else {
          rep.averagePurchasePrice = (rep.quantity * rep.averagePurchasePrice + qty * price) / (rep.quantity+qty)
          rep.quantity += qty
          // rep.amount += price * qty

          // TODO - add commission to realized profit

          if(commissionAsset.toUpperCase() === 'BNB' && commission>0) {
            BNBfees[time] = commission
          }
        }

        // rep.amount = rep.quantity * rep.averagePurchasePrice
        // rep.averagePurchasePrice = rep.amount / rep.quantity
      } else {
        if (isDollarAsset(commissionAsset.toUpperCase())) {
          rep.realizedProfit -= commission
          rep.quantity -= qty
          rep.realizedProfit += price * qty - rep.averagePurchasePrice * qty
        } else if (commissionAsset.toUpperCase() === asset) {
          rep.realizedProfit -= commission*rep.averagePurchasePrice
          rep.quantity -= qty
          rep.realizedProfit += price * qty - rep.averagePurchasePrice * qty
        }
        // Commission is BNB
        else {
          rep.quantity -= qty
          rep.realizedProfit += price * qty - rep.averagePurchasePrice * qty

          // TODO - add commission to realized profit
          if(commissionAsset.toUpperCase() === 'BNB' && commission>0) {
            BNBfees[time] = commission
          }
        }

        // rep.amount = rep.averagePurchasePrice * rep.quantity
      }

      // if(asset === 'BNB') {
      //   console.log(price, qty, isBuyer, rep.realizedProfit)
      // }
    })

    rep.quantity = quantity
    rep.amount = rep.averagePurchasePrice * quantity

    if(Object.keys(BNBfees).length) {
      console.log(asset, 'BNB fees: ', BNBfees, Object.values(BNBfees).reduce((previousValue, currentValue) => previousValue + currentValue))
    }
  }



  // TODO
  // Counted and returned quantity is different, so it's necessary to count the bought price using the
  // quantity return from binance.
  // Call Fees EP !!! and mix it with trade list
  if (lastBalanceAssetQuantity > -1) {
    const diff = Math.abs(lastBalanceAssetQuantity - rep.quantity)
    if (diff > 0) {
      const ref = Math.max(lastBalanceAssetQuantity, rep.quantity)
      const percentDiff = (100 / ref) * diff
      console.log(asset, ' percent diff: ', percentDiff, '%', diff, lastBalanceAssetQuantity, rep.quantity)

      // Recount balance completely
      if(!recursion){
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
              'countedBalance.$.quantity': 0,
              'countedBalance.$.amount': 0,
              'countedBalance.$.averagePurchasePrice': 0,
              'countedBalance.$.realizedProfit': 0,
              'countedBalance.$.lastTradeTimestamp': -1
            }
          }
        )

        return processAsset(userId,asset,quantity,true)
      }
    }
  }

  // const hashAfter = crypto.createHmac('sha256', 'BINANCE_ASSET_BALANCE').update(JSON.stringify(rep)).digest('hex')

  // if (hashBefore !== hashAfter) {
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
          'countedBalance.$.lastTradeTimestamp': rep.lastTradeTimestamp
        }
      }
    )
  // }
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

export const countBalance = async (userId: string, force?: boolean): ReturnPromise =>
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



        //
        // const sameHash = await BinanceProfileTsModel.exists({ user: userId, lastBalanceHash: freshBalanceHash })

        // if(sameHash){
        //   const binanceProfile = await BinanceProfileTsModel.findOne(
        //     { user: userId },
        //     { lastBalanceData: 1, countedBalance: 1 }
        //   )


        // }

        // if (force || !sameHash) {
        if(true){
          console.log('balance hash changed')

          const binanceProfile = await BinanceProfileTsModel.findOne(
            { user: userId },
            { lastBalanceData: 1, countedBalance: 1 }
          )

          const freshBalancesData: Array<BinanceBalance> = accountInfo.data?.balances || []
          const freshBalancesMap:Record<string, number> = {}
          const savedBalances: Array<BinanceBalance> = binanceProfile?.lastBalanceData || []
          const savedBalancesMap: Record<string, number> = {}
          const countedBalance: Array<BinanceProfileCountedBalance> = binanceProfile?.countedBalance || []
          const countedBalanceMap: Record<string, number> = {}
          const assetsToRefresh = new Set<string>()
          const allAssets = new Set<string>()
          const portfolioBalancesMap = new Map<string, BinanceBalance>()

          // Transform array to map
          savedBalances.forEach((balance) => {
            savedBalancesMap[balance.asset] = balance.locked+balance.free
            allAssets.add(balance.asset)
          })

          // Transform array to map
          freshBalancesData.forEach((balance) => {
            freshBalancesMap[balance.asset] = balance.locked+balance.free
            allAssets.add(balance.asset)
          })

          // Transform array to map
          countedBalance.forEach((balance) => {
            countedBalanceMap[balance.asset] = balance.quantity
            allAssets.add(balance.asset)
          })

          // Compare quantity
          allAssets.forEach((asset)=>{
            const savedQuantity = savedBalancesMap[asset]
            const freshQuantity = freshBalancesMap[asset]
            const countedQuantity = countedBalanceMap[asset]

            // if(Math.max(savedQuantity, freshQuantity, countedQuantity) > 0) {
            //   console.log(asset, freshQuantity, countedQuantity, savedQuantity)
            // }

            if(savedQuantity!==freshQuantity || savedQuantity!==countedQuantity || freshQuantity!==countedQuantity){
              assetsToRefresh.add(asset)
            }
          })


          const freshBalanceHash = crypto
            .createHmac('sha256', 'BINANCE_BALANCE')
            .update(JSON.stringify(freshBalancesData))
            .digest('hex')



          // Check assets for counted balance
          // if (force) {
          //
          //   countedBalance.forEach((balance) => {
          //     if (
          //       !isDollarAsset(balance.asset) &&
          //       (balance.amount > 0 ||
          //         balance.quantity > 0 ||
          //         balance.averagePurchasePrice > 0 ||
          //         balance.realizedProfit !== 0)
          //     ) {
          //       assetsToRefresh.add(balance.asset)
          //     }
          //   })
          // }

          // ----
          // Compare saved and fresh balances
          // ----





          // Compare fresh vs saved balances
          // freshBalancesData.forEach((balance) => {
          //   portfolioBalancesMap.set(balance.asset, balance)
          //
          //   if (
          //     !savedBalancesMap[balance.asset] ||
          //     savedBalancesMap[balance.asset].free !== balance.free ||
          //     savedBalancesMap[balance.asset].locked !== balance.locked
          //   ) {
          //     assetsToRefresh.add(balance.asset)
          //   }
          // })
          //
          // // Check if a saved balance is missing in the fresh balances (e.g. Binance removed an asset)
          // savedBalances.forEach((balance) => {
          //   if (!portfolioBalancesMap.has(balance.asset)) {
          //     portfolioBalancesMap.set(balance.asset, balance)
          //     assetsToRefresh.add(balance.asset)
          //   }
          // })

          // ---- ----

          console.log('countBalance - assetsToRefresh: ', Array.from(assetsToRefresh))

          if (assetsToRefresh.size) {
            await syncTrades(userId, Array.from(assetsToRefresh))
            //TODO - sync deposits and withdraws
          }

          // TODO - update with version compare
          await BinanceProfileTsModel.updateOne(
            { user: userId },
            { lastBalanceHash: freshBalanceHash, lastBalanceData: freshBalancesData }
          )




          if(assetsToRefresh.size) {
            console.log('countBalance - count balances')

            const assetsToRefreshKeys = Array.from(assetsToRefresh.keys())
            // assetsToRefreshKeys.push('SHIB')

            // for (let i = 0; i < assetsToRefreshKeys.length; i++) {
            //   const asset = assetsToRefreshKeys[i]
            //   const balance = portfolioBalancesMap.get(asset) as BinanceBalance
            //   const quantity = balance.free + balance.locked
            //
            //   if (isDollarAsset(asset)) {
            //     await processDollar(userId, asset, quantity)
            //     //} else if (quantity >0 ) {
            //   } else if (assetsToRefresh.has(asset) || quantity > 0 || force) {
            //     await processAsset(userId, asset, quantity)
            //   }
            // }

            for (let i = 0; i < assetsToRefreshKeys.length; i++) {
              const asset = assetsToRefreshKeys[i]
              const quantity = freshBalancesMap[asset] || 0

              if (isDollarAsset(asset)) {
                await processDollar(userId, asset, quantity)
              } else {
                await processAsset(userId, asset, quantity)
              }
            }

            // const portfolioBalancesKeys = Array.from(portfolioBalancesMap.keys())
            // for (let i = 0; i < portfolioBalancesKeys.length; i++) {
            //   const asset = portfolioBalancesKeys[i]
            //   // const balance = portfolioBalancesMap.get(asset) as BinanceBalance
            //   // const quantity = balance.free + balance.locked
            //
            //   if (isDollarAsset(asset)) {
            //     await processDollar(userId, asset, freshBalancesMap[asset] || 0)
            //     // } else if (assetsToRefresh.has(asset) || quantity > 0 || force) {
            //   }
            //   else{
            //     await processAsset(userId, asset, freshBalancesMap[asset] || 0)
            //   }
            // }

            pubSub.publish(`BINANCE_BALANCE_UPDATE`, { timestamp: Date.now() })
          }
        } else {
          console.log('countBalance - hash is the same')
        }

        console.log('countBalance done')
        inProgressMap[userId] = false

        return resolve({
          error: '',
          errorData: '',
          data: ''
        })
      } else {
        console.log('countBalance accountInfo error: ', accountInfo.error)
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
