import { useCallback, useEffect, useState } from 'react'
import { BehaviorSubject } from 'rxjs'

type State = {
  actualPrice: number
  boughtPrice: number
  gain: number
  percentageGain: number
  overallGain: number
  overallPercentageGain: number
}

// const deposit = 2833 + 4000 + 960 + 1115 + 119 + 1039 + 1148 + 1151 + 11397 + 4408
let deposit = Number.NaN

const actualPrices: Record<string, number> = {}
const boughtPrices: Record<string, number> = {}

const actualPricesSubject = new BehaviorSubject(actualPrices)
const boughtPricesSubject = new BehaviorSubject(boughtPrices)

let timeoutRef1: any = -1
let timeoutRef2: any = -1

export const updateActualPrice = (symbol: string, price: number) => {
  actualPrices[symbol] = price
  clearTimeout(timeoutRef1)
  timeoutRef1 = setTimeout(() => {
    actualPricesSubject.next(actualPrices)
  }, 200)
}

export const updateBoughtPrice = (symbol: string, price: number) => {
  boughtPrices[symbol] = price
  clearTimeout(timeoutRef2)
  timeoutRef2 = setTimeout(() => {
    boughtPricesSubject.next(boughtPrices)
  }, 200)
}

export const updateDeposit = (value: number) => {
  // deposit = value + 119
  deposit = 118 + 715 +100 +900 + 1000 + 4000 + 960 + 1115 + 119 + 1039 + 1148 + 1151 + 11397 + 4408
}

export const useStore = (): State & { deposit: number } => {
  const [state, setState] = useState<State>({
    actualPrice: 0,
    boughtPrice: 0,
    gain: 0,
    percentageGain: 0,
    overallGain: 0,
    overallPercentageGain: 0
  })

  const compute = useCallback(() => {
    const ret = {
      actualPrice: 0,
      boughtPrice: 0,
      gain: 0,
      percentageGain: 0,
      overallGain: 0,
      overallPercentageGain: 0
    }

    Object.entries(actualPrices).forEach(([symbol, value]) => {
      ret.actualPrice += value
    })
    Object.entries(boughtPrices).forEach(([symbol, value]) => {
      ret.boughtPrice += value
    })

    ret.gain = ret.actualPrice - ret.boughtPrice
    ret.percentageGain = (100 / ret.boughtPrice) * ret.actualPrice - 100
    if(!Number.isNaN(deposit)) {
      ret.overallGain = ret.actualPrice - deposit
      ret.overallPercentageGain = (100 / deposit) * ret.actualPrice - 100
    }

    setState(ret)
  }, [setState])

  useEffect(() => {
    const subscription1 = actualPricesSubject.subscribe((value) => {
      compute()
    })

    const subscription2 = boughtPricesSubject.subscribe((value) => {
      compute()
    })

    return () => {
      subscription1.unsubscribe()
      subscription2.unsubscribe()
    }
  }, [compute])

  return {
    deposit: deposit||0,
    ...state
  }
}
