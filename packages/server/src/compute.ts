import {pubSub} from "./pubSub";
import SendMail from 'sendmail'

const sendMail = SendMail({})

import {Symbol as SymbolType } from '@sw/shared/src/graphql'

import {getStockPrices} from "./finnhub/finnhubClient";
import {UserTsModel} from './database/user/schema'

const compute = async () => {
    const to = new Date()
    const from = new Date(to)
    from.setMinutes(from.getMinutes()-10)

    const user = await UserTsModel.findOne({name: 'admin'}).populate('dashboard.watchedSymbols')
    // @ts-ignore
    const watchedSymbols: Array<SymbolType> = user?.dashboard?.watchedSymbols || []

    for(let i=0;i<watchedSymbols.length;i++) {
        const symbol = watchedSymbols[i]
        // console.log(symbol)
        const prices = await getStockPrices(symbol.symbol, parseInt((from.getTime() / 1000).toString()), parseInt((to.getTime() / 1000).toString()))

        if(prices && prices.length){
            const startPriceObj = prices[0]
            const endPriceObj = prices[prices.length-1]

            // console.log(startPriceObj, endPriceObj)
            // console.log(new Date(startPriceObj.timestamp*1000).toLocaleString(), new Date(endPriceObj.timestamp*1000).toLocaleString())

            const gain = (100/startPriceObj.price)*endPriceObj.price-100

            // console.log('gain: ', symbol.symbol, gain)
            // console.log('length: ', prices.length)

            if(gain>5 || gain < -5 ){
                // TODO - push notification
                sendMail({
                    from: 'HakkaMc@gmail.com',
                    to: 'HakkaMc@gmail.com',
                    subject: `Rapid stock raise/fall: ${symbol.symbol} ${gain}`
                }, (error:any, reply: any)=>{
                    console.log(error && error.stack);
                    // console.dir(reply);
                })
            }
        }
        // return
    }
}

export const startComputing = async () => {
    await compute()
    setInterval(compute, 10*60*1000)
}
