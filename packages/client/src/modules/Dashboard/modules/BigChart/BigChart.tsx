import React, { useEffect, useState } from 'react'
import HighchartsStock from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import { useSubscription, useMutation, useQuery } from '@apollo/client'
import { GetPrices, LastPrice } from '@sw/shared/src/graphql'
import { GET_PRICES, LAST_PRICE_SUBSCRIPTION } from '../../../../gqls'

import styles from './styles.module.scss'

type Props = {
  symbol: string
}

const tmpTto = new Date()
tmpTto.setDate(tmpTto.getDate() + 1)
tmpTto.setHours(0)
tmpTto.setMinutes(0)
tmpTto.setSeconds(0)
tmpTto.setMilliseconds(0)

const tmpTFrom = new Date(tmpTto)
tmpTFrom.setDate(tmpTto.getDate() - 1)
tmpTFrom.setHours(-4)

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

const aftermarketStopTime = new Date(midnight)
aftermarketStopTime.setHours(2)
aftermarketStopTime.setMinutes(0)

const premarketStartTime = new Date(midnight)
premarketStartTime.setHours(10)
premarketStartTime.setMinutes(0)

const options = {
  chart: {
    // width: '100%'
  },
  title: {
    text: `${tmpTFrom.toLocaleString()} - ${tmpTto.toLocaleString()}`
  },
  time: {
    // timezone: 'Europe/Oslo'
    timezoneOffset: tmpTFrom.getTimezoneOffset(),
    useUTC: true
  },
  // plotOptions:{
  //     series: {
  //         enableMouseTracking: false,
  //         marker: {
  //             enabled: false,
  //         }
  //     },
  //     line: {
  //         marker: {
  //             states: {
  //                 hover: {
  //                     marker: {
  //                         enabled: false
  //                     }
  //                 }
  //             },
  //             hover: {
  //                 marker: {
  //                     enabled: false
  //                 }
  //             }
  //         }
  //     }
  // },
  series: [
    {
      lineWidth: 1,
      type: 'spline',
      data: []
      // allowPointSelect: false,
      // description: undefined,
      // name: undefined,
      // selected: false,
      // showInLegend: false,
      // showInNavigator: false,
      // skipKeyboardNavigation: true,
      // line: {
      //     marker:{
      //         enabled: false
      //     }
      // }
    }
  ],
  // navigator: {
  //     enabled: false
  // },
  // title: {
  //     text: undefined
  // },
  // legend: {
  //     enabled: false
  // },
  // tooltip: {
  //     enabled: false
  // },
  xAxis: {
    //     visible: false
    type: 'datetime',
    // tickmarkPlacement: {
    //     pointStart: tmpTFrom.getTime()
    // },
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
  }
  // yAxis: {
  //     visible: false
  // },
}

let lastPriceCache = {
  timestamp: -1,
  price: -1
}

export const BigChart = ({ symbol }: Props) => {
  const [chart, setChart] = useState<any>()
  const [initDataSet, setInitDataSet] = useState(false)
  const { data, loading, error } = useQuery<{ getPrices: GetPrices }>(GET_PRICES, {
    variables: { symbol, range: '5', timestampFrom: tmpTFrom.getTime(), timestampTo: tmpTto.getTime() },
    fetchPolicy: 'no-cache'
  })
  const { data: lastPriceData, loading: lastPriceLoading, error: lastPriceError } = useSubscription<{
    lastPrice: LastPrice
  }>(LAST_PRICE_SUBSCRIPTION, { variables: { symbol } })

  useEffect(() => {
    const intervalRef = setInterval(() => {
      if (chart?.series?.length && lastPriceCache.timestamp !== -1) {
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

  useEffect(() => {
    if (!loading && data && !error && chart) {
      const newData = data.getPrices?.priceArray?.map((priceObj) => {
        // console.log(new Date(priceObj?.timestamp || 0).toLocaleString())
        return [priceObj?.timestamp, priceObj?.price]
      })

      if (newData) {
        chart.series[0].setData(newData, true, false, false)
        setInitDataSet(true)
      }
    }
  }, [data, loading, error, chart])

  useEffect(() => {
    lastPriceCache = {
      timestamp: lastPriceData?.lastPrice.timestamp || -1,
      price: lastPriceData?.lastPrice.price || 0
    }

    // if (chart && lastPriceData) {
    //   chart.series[0].addPoint([lastPriceData.lastPrice.timestamp, lastPriceData.lastPrice.price])
    // }
  }, [chart, lastPriceData])

  return (
    <div className={styles.container}>
      {loading && <div>Loading chart...</div>}
      {!error && !loading && data && (
        <HighchartsReact highcharts={HighchartsStock} options={options} callback={setChart} />
      )}
    </div>
  )
}
