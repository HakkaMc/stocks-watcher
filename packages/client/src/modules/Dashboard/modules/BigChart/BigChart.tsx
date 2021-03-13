import React, {useCallback, useEffect, useMemo, useState} from 'react'
import HighchartsStock from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import { useSubscription, useMutation, useQuery, useLazyQuery } from '@apollo/client'
import { GetPrices, LastPrice } from '@sw/shared/src/graphql'
import { GET_PRICES, LAST_PRICE_SUBSCRIPTION } from '../../../../gqls'
// import {getDayPoints} from '@sw/shared/src/time'

import styles from './styles.module.scss'

type Props = {
  symbol: string
}

export const BigChart = ({ symbol }: Props) => {
  let wheelEventInitialized = false
  const [chartOptions, setChartOptions] = useState<any>(undefined)
  const [chart, setChart] = useState<any>()
  const [initDataSet, setInitDataSet] = useState(false)
  const [loadData, { data, loading, error }] = useLazyQuery<{ getPrices: GetPrices }>(GET_PRICES, {
    fetchPolicy: 'no-cache'
  })
  const lastPriceResponse = useSubscription<{
    lastPrice: LastPrice
  }>(LAST_PRICE_SUBSCRIPTION, { variables: { symbol } })

  const loadChartData = useCallback(()=>{
    // const dayPoints = getDayPoints()
    //
    // const tmpFrom = dayPoints.midnightToday
    // tmpFrom.setHours(tmpFrom.getHours()-4)
    //
    // const tmpTo = dayPoints.aftermarketEnd
    // tmpTo.setHours(tmpTo.getHours()+2)

    const tmpTto = new Date()
    tmpTto.setDate(tmpTto.getDate() + 1)
    tmpTto.setHours(0)
    tmpTto.setMinutes(0)
    tmpTto.setSeconds(0)
    tmpTto.setMilliseconds(0)

    const tmpTFrom = new Date(tmpTto)
    tmpTFrom.setDate(tmpTto.getDate() - 1)
    tmpTFrom.setHours(-4)

    loadData({
      variables: {
        symbol, range: '5', timestampFrom: tmpTFrom.getTime(), timestampTo: tmpTto.getTime()
      }
    })
  }, [loadData, symbol])

  useEffect(()=>{
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
        renderTo: 'container',
        panning: {
          enabled: true,
          type: 'xy'
        }
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

    setChartOptions(options)

    loadChartData()
  }, [])

  useEffect(() => {
    if (chart) {
      if (!wheelEventInitialized) {
        wheelEventInitialized = true
        // console.log('init zoom ', symbol)
        chart.container.addEventListener('wheel', (event: any) => {
          event.stopPropagation()
          event.preventDefault()
          // layer[1].addEventListener('wheel', (event: any) => {
          chart.showResetZoom()

          const containerBounds = event.target.getBoundingClientRect()
          const { width } = containerBounds
          const mouseX = event.clientX
          const mousePercentage = (100 / width) * mouseX

          // console.log(event.target.getBoundingClientRect())

          // console.log(event.clientX, event.clientY)

          const delta = Math.sign(event.deltaY)

          // console.log(delta)

          const xExtremes = chart.xAxis[0].getExtremes()
          const yExtremes = chart.yAxis[0].getExtremes()

          const xPercent = ((xExtremes.max - xExtremes.min) / 100) * 20

          // console.log(xExtremes.min, xExtremes.min)

          if (delta < 0) {
            const right = (xPercent / 100) * (100 - mousePercentage)
            const left = (xPercent / 100) * mousePercentage

            let from = xExtremes.min + left
            let to = xExtremes.max - right

            from = Math.max(from, xExtremes.dataMin - (xExtremes.dataMax - xExtremes.dataMin) / 2)
            to = Math.min(to, xExtremes.dataMax + (xExtremes.dataMax - xExtremes.dataMin) / 2)

            chart.xAxis[0].setExtremes(from, to)
          } else {
            let from = xExtremes.min - xPercent
            let to = xExtremes.max + xPercent

            from = Math.max(from, xExtremes.dataMin - (xExtremes.dataMax - xExtremes.dataMin) / 2)
            to = Math.min(to, xExtremes.dataMax + (xExtremes.dataMax - xExtremes.dataMin) / 2)

            chart.xAxis[0].setExtremes(from, to)

            if (yExtremes) {
              const yBuffer = ((yExtremes.dataMax - yExtremes.dataMin) / 100) * 10

              chart.yAxis[0].setExtremes(yExtremes.dataMin - yBuffer, yExtremes.dataMax + yBuffer)
            }
          }
        })
      }
    }
  }, [chart?.container])

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
    if (chart && lastPriceResponse.data?.lastPrice) {
      const timestamp = Math.floor(lastPriceResponse.data?.lastPrice.timestamp / 1000 / 60) * 60 * 1000

      let updated = false

      const rawData = chart.series[0]?.options?.data||[]

      if(Array.isArray(rawData) && rawData.length) {
        const lastPoint = rawData[rawData.length-1]
        if(lastPoint[0]===timestamp){
          lastPoint[1] = lastPriceResponse.data?.lastPrice.price
          updated = true
        }
      }

      if (!updated) {
        rawData.push([timestamp, lastPriceResponse.data?.lastPrice.price])
        updated = true
      }

      if(updated){
        chart.series[0].setData([...rawData], true, false, true)
      }
    }
  }, [chart, lastPriceResponse.data])

  return (
    <div className={styles.container}>
      {loading && <div>Loading chart...</div>}
      {!error && !loading && data && (
        <HighchartsReact highcharts={HighchartsStock} options={chartOptions} callback={setChart} />
      )}
    </div>
  )
}
