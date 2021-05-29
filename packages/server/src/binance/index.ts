//
// type ReportSymbol = {
//   symbol: string
//   amount: number
//   pricePerShare: number // Average purchase price
//   actualPricePerShare: number
//   price: number
//   actualPrice: number
//   realizedProfit: number
//   unrealizedProfit: number
//   unrealizedPercentageProfit: number
// }
//
// type Report = {
//   symbols: ReportSymbol[]
//   price: number
//   actualPrice: number
//   gain: number
//   percentageGain: number
// }

// export const getReport = async (): Promise<Report> => {
//   // const symbolsMap = await getExchangeInfo()
//   const priceMap: Record<string, number> = {}
//
//   const balances = await getAccountInfo()
//
//   const report: Report = {
//     symbols: [],
//     price: 0,
//     actualPrice: 0,
//     gain: 0,
//     percentageGain: 0
//   }
//   const reportSymbols: Record<string, ReportSymbol> = {}
//
//   const trades: Record<string, BinanceTrade[]> = {}
//
//   const tradesPromises: Promise<any>[] = []
//   const pricePromises: Promise<any>[] = []
//   let timeout = 0
//
//   Object.values(balances).forEach((balance) => {
//     const symbol = balance.asset
//     const amount = parseFloat(balance.free) + parseFloat(balance.locked)
//
//     if (amount > 0) {
//       const paySymbols: string[] = ['USDT', 'BUSD']
//
//       reportSymbols[symbol] = {
//         symbol,
//         amount: paySymbols.includes(symbol) ? amount : 0,
//         pricePerShare: paySymbols.includes(symbol) ? 1 : 0,
//         actualPricePerShare: paySymbols.includes(symbol) ? 1 : 0,
//         realizedProfit: 0,
//         unrealizedProfit: 0,
//         actualPrice: 0,
//         price: 0,
//         unrealizedPercentageProfit: 0
//       }
//
//       trades[symbol] = []
//
//       if (!paySymbols.includes(symbol)) {
//         paySymbols.forEach((suffix) => {
//           // timeout += 100
//
//           tradesPromises.push(
//             new Promise((resolve) => {
//               setTimeout(() => {
//                 getTrades(`${symbol}${suffix}`).then(({data}) => {
//                   data.forEach((trade:any) => trades[symbol].push(trade))
//
//                   return resolve(data)
//                 })
//               }, (timeout += 100))
//             })
//           )
//
//           if (suffix === 'BUSD') {
//             // timeout += 100
//
//             pricePromises.push(
//               new Promise((resolve) => {
//                 setTimeout(() => {
//                   getLastPrice(`${symbol}${suffix}`).then((price) => {
//                     priceMap[symbol] = price
//
//                     return resolve(price)
//                   })
//                 }, (timeout += 100))
//               })
//             )
//           }
//
//           // lastPriceSubscribe(`${symbol}${suffix}`)
//         })
//       }
//     }
//   })
//
//   await Promise.all(tradesPromises)
//   await Promise.all(pricePromises)
//
//   // console.log(trades)
//
//   Object.entries(trades).forEach(([symbol, tradeList]) => {
//     tradeList.sort((a, b) => a.time - b.time)
//
//     // if (symbolsMap[symbol]) {
//     //   const baseAsset = symbolsMap[symbol].baseAsset // buy symbol
//     //   const quoteAsset = symbolsMap[symbol].quoteAsset // pay symbol
//
//     const symbolReport = reportSymbols[symbol]
//
//     tradeList.forEach((trade) => {
//       const price = trade.price
//       const qty = trade.qty
//
//       if (trade.isBuyer) {
//         symbolReport.pricePerShare =
//           (symbolReport.pricePerShare * symbolReport.amount + price * qty) / (symbolReport.amount + qty)
//         symbolReport.amount += qty
//       } else {
//         symbolReport.amount -= qty
//         const bought = qty * symbolReport.pricePerShare
//         const sold = qty * price
//         symbolReport.realizedProfit += sold - bought
//       }
//     })
//
//     symbolReport.price = symbolReport.amount * symbolReport.pricePerShare
//
//     report.price += symbolReport.amount * symbolReport.pricePerShare
//
//     if (priceMap[symbol]) {
//       symbolReport.actualPricePerShare = priceMap[symbol]
//
//       symbolReport.actualPrice = symbolReport.amount * priceMap[symbol]
//
//       symbolReport.unrealizedProfit = symbolReport.actualPrice - symbolReport.price
//
//       symbolReport.unrealizedPercentageProfit = (100 / symbolReport.price) * symbolReport.actualPrice - 100
//
//       report.actualPrice += symbolReport.amount * priceMap[symbol]
//     } else {
//       report.actualPrice += symbolReport.amount
//       console.error(symbol, ' not found in symbols map')
//     }
//
//     report.symbols.push(symbolReport)
//   })
//
//   report.gain = report.actualPrice - report.price
//   report.percentageGain = (100 / report.price) * report.actualPrice - 100
//
//   return report
// }

// export const getTrades
