import React, { useEffect, useState } from 'react'
import HighchartsStock from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import { useSubscription, useMutation, useQuery } from '@apollo/client'
import { GetPrices } from '@sw/shared/src/graphql'
import { GET_PRICES } from '../../../../gqls'

type Props = {
  previousClose?: number
  lastPrice?: number
  openPrice?: number
  symbol: string
  lastPriceTimestamp?: number
}

const tmpTto = new Date()
tmpTto.setDate(tmpTto.getDate() + 1)
tmpTto.setHours(0)
tmpTto.setMinutes(0)
tmpTto.setSeconds(0)

const tmpTFrom = new Date(tmpTto)
tmpTFrom.setDate(tmpTto.getDate() - 1)
tmpTFrom.setHours(tmpTFrom.getHours() - 4)

const stockStartTime = new Date()
stockStartTime.setHours(15)
stockStartTime.setMinutes(30)
stockStartTime.setSeconds(0)
stockStartTime.setMilliseconds(0)

const stockEndTime = new Date(stockStartTime)
stockEndTime.setHours(22)
stockEndTime.setMinutes(0)

const stockPreviousEndTime = new Date(stockEndTime)
stockPreviousEndTime.setDate(stockPreviousEndTime.getDate() - 1)

const midnight = new Date()
midnight.setHours(0)
midnight.setMinutes(0)
midnight.setSeconds(0)
midnight.setMilliseconds(0)
// console.log(midnight)

const nextMidnigh = new Date(midnight)
nextMidnigh.setDate(nextMidnigh.getDate() + 1)

const aftermarketStopTime = new Date(midnight)
aftermarketStopTime.setHours(1)
aftermarketStopTime.setMinutes(45)

const premarketStartTime = new Date(midnight)
premarketStartTime.setHours(10)
premarketStartTime.setMinutes(0)

const options = {
  chart: {
    height: 50,
    margin: 0
  },
  time: {
    timezoneOffset: tmpTFrom.getTimezoneOffset(),
    useUTC: true
  },
  plotOptions: {
    series: {
      enableMouseTracking: false,
      marker: {
        enabled: false
      }
    },
    line: {
      marker: {
        states: {
          hover: {
            marker: {
              enabled: false
            }
          }
        },
        hover: {
          marker: {
            enabled: false
          }
        }
      }
    }
  },
  series: [
    {
      lineWidth: 1,
      type: 'spline',
      data: [],
      allowPointSelect: false,
      description: undefined,
      name: undefined,
      selected: false,
      showInLegend: false,
      showInNavigator: false,
      skipKeyboardNavigation: true,
      line: {
        marker: {
          enabled: false
        }
      }
    }
  ],
  navigator: {
    enabled: false
  },
  title: {
    text: undefined
  },
  legend: {
    enabled: false
  },
  tooltip: {
    enabled: false
  },
  xAxis: {
    type: 'datetime',
    visible: true,
    range: 24 * 60 * 60 * 1000,
    max: nextMidnigh.getTime(),
    plotLines: [
      {
        value: midnight.getTime(),
        color: 'black',
        dashStyle: 'shortdash',
        width: 1,
        zIndex: 1
      },
      {
        value: stockPreviousEndTime.getTime(),
        color: 'red',
        dashStyle: 'shortdash',
        width: 1,
        zIndex: 1
      },
      {
        value: aftermarketStopTime.getTime(),
        color: 'orange',
        dashStyle: 'shortdash',
        width: 1,
        zIndex: 1
      },
      {
        value: premarketStartTime.getTime(),
        color: 'orange',
        dashStyle: 'shortdash',
        width: 1,
        zIndex: 1
      },
      {
        value: stockStartTime.getTime(),
        color: 'blue',
        dashStyle: 'shortdash',
        width: 1,
        zIndex: 1
      },
      {
        value: stockEndTime.getTime(),
        color: 'red',
        dashStyle: 'shortdash',
        width: 1,
        zIndex: 1
      }
    ]
  },
  yAxis: {
    visible: false
  }
}

let lastPriceCache = {
  timestamp: -1,
  price: -1
}

export const QuickChart = ({ lastPrice, previousClose, openPrice, symbol, lastPriceTimestamp }: Props) => {
  const [chart, setChart] = useState<any>()
  // const [initDataSet, setInitDataSet] = useState(false)
  const { data, loading, error } = useQuery<{ getPrices: GetPrices }>(GET_PRICES, {
    variables: { symbol, range: '30', timestampFrom: tmpTFrom.getTime(), timestampTo: tmpTto.getTime() }
  })

  // useEffect(()=>{
  //     if(chart && previousClose && lastPrice && openPrice) {
  // const serie: any = chart?.series[0]
  //
  // if(!initDataSet){
  //     setInitDataSet(true)
  //     serie?.addPoint(previousClose)
  //     serie?.addPoint(openPrice)
  // }
  //
  // serie?.addPoint(lastPrice)
  // }
  // },[chart, previousClose, lastPrice, initDataSet, openPrice])

  useEffect(() => {
    if (!loading && data && !error && chart) {
      const newData = data.getPrices?.priceArray?.map((priceObj) => [priceObj?.timestamp, priceObj?.price])

      // console.log(newData)

      if (newData) {
        chart.series[0].setData(newData, true, false, false)
      }
    }
  }, [data, loading, error, chart])

  // useEffect(()=>{
  //     if(chart && lastPrice && lastPriceTimestamp){
  //         chart.series[0].addPoint([lastPriceTimestamp, lastPrice])
  //     }
  // }, [chart, lastPrice, lastPriceTimestamp])

  useEffect(() => {
    const intervalRef = setInterval(() => {
      if (chart && lastPriceCache.timestamp !== -1) {
        chart.series[0].addPoint([lastPriceCache.timestamp, lastPriceCache.price])
        lastPriceCache = {
          timestamp: -1,
          price: -1
        }
      }
    }, 1000)

    return () => {
      clearInterval(intervalRef)
    }
  }, [])

  lastPriceCache = {
    timestamp: lastPriceTimestamp || -1,
    price: lastPrice || -1
  }

  return (
    <>
      <HighchartsReact highcharts={HighchartsStock} options={options} callback={setChart} />
    </>
  )
}
