import React, { useCallback, useEffect, useState } from 'react'
import { GetPrices, LastPrice } from '@sw/shared/src/graphql'
import { useSubscription, useMutation, useQuery } from '@apollo/client'
import HighchartsStock from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import { Close as CloseIcon } from '@material-ui/icons'
import { IconButton } from '@material-ui/core'
import { GET_CHART_GROUP, GET_PRICES, LAST_PRICE_SUBSCRIPTION, REMOVE_CHART_FROM_CHART_GROUP } from '../../../../gqls'
import styles from './styles.module.scss'

type Props = {
  symbol: string
  layout: any
  range: string
  removeChart: () => void
  chartsCount: number
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
    renderTo: 'container',
    // zoomType: 'xy',
    // zoomKey: 'shift',
    panning: {
      enabled: true,
      type: 'xy'
    }
    // panKey: 'ctrl',
  },
  mapNavigation: {
    enabled: true,
    enableMouseWheelZoom: true
  },
  // title: {
  //   text: `${tmpTFrom.toLocaleString()} - ${tmpTto.toLocaleString()}`
  // },
  time: {
    // timezone: 'Europe/Oslo'
    timezoneOffset: tmpTFrom.getTimezoneOffset(),
    useUTC: true
  },
  plotOptions: {
    // pointStart:  tmpTFrom.getTime(),
    // pointStart: {
    //   x: tmpTFrom.getTime(),
    //   y: 0
    // }
    // pointStart: Date.UTC(2020, 0, 1),
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
  },
  series: [
    {
      lineWidth: 1,
      type: 'spline',
      data: [],
      dragDrop: {
        draggableY: false,
        draggableX: false
      },
      softThreshold: false
      // pointStart: [
      //   tmpTFrom.getTime(),
      //   0
      // ]
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
    // {
    //   data: [
    //     {
    //       x: new Date('2016-01-01 00:00:00').getTime(),
    //       y: 0
    //     }
    //   ]
    // },
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
    // softMin: new Date('2016-01-01 00:00:00').getTime(),
    // min: new Date('2016-01-01 00:00:00').getTime(),
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
    ],
    resize: {
      enabled: true
    },
    endOnTick: false,
    startOnTick: false
  },
  yAxis: {
    // visible: false
    // min: 0,
    resize: {
      enabled: true
    },
    endOnTick: false,
    startOnTick: false
  }
}

// let lastPriceCache = {
//   timestamp: -1,
//   price: -1
// }


export const Chart = ({ symbol, layout, range = '1', removeChart, chartsCount }: Props) => {
  let wheelEventInitialized = false

  const [chart, setChart] = useState<any>()
  // const [initDataSet, setInitDataSet] = useState(false)

  const { data, loading, error } = useQuery<{ getPrices: GetPrices }>(GET_PRICES, {
    variables: { symbol, range, timestampFrom: tmpTFrom.getTime(), timestampTo: tmpTto.getTime() },
    fetchPolicy: 'no-cache'
  })
  const lastPriceResponse = useSubscription<{
    lastPrice: LastPrice
  }>(LAST_PRICE_SUBSCRIPTION, { variables: { symbol } })

  useEffect(() => {
    if (chart) {
      // chart.container.addEventListener('mousemove', (event: any) => {
      //
      // })

      // console.log(chart.container.querySelector('svg').querySelector('rec'))

      // const ref:any = setInterval(()=>{
      // const rectangles = chart.container.querySelectorAll('.highcharts-plot-background')
      //
      // const svgObject = chart.container.querySelector('svg')
      // const layer = svgObject.getElementsByTagName('rect')
      // // const layer = svgObject.querySelector('rect')
      //
      // // console.log(svgObject)
      //
      // if (layer && layer.length) {
      //   // const rectanglesArray = Array.from(rectangles)
      //   console.log(rectangles.item(0))
      //   rectangles.item(0).addEventListener(
      //     'mousedown',
      //     () => {
      //       console.log('mouse down')
      //     },
      //     false
      //   )
      //
      //   // clearInterval(ref)
      //   console.log('Nasel sem: ', layer[1])
      //
      //   layer[1].addEventListener(
      //     'mousedown',
      //     (event: any) => {
      //       console.log('mouse down')
      //     },
      //     false
      //   )
      //
      //   // console.log(chart.container)
      // }
      // console.log('did mount ', symbol, wheelEventInitialized)

      if (!wheelEventInitialized) {
        wheelEventInitialized = true
        // console.log('init zoom ', symbol)
        chart.container.addEventListener('wheel', (event: any) => {
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

            // chart.redraw(false)
          }

          // console.log('wheel: ', delta)
        })
      }
      // }, 500)

      // const layer = svgObject.querySelector('rec')
      // console.log(svgObject)

      // console.log(layer)

      // const layer = chart.container.querySelector('svg').querySelector('rec')
    }
  }, [chart?.container])

  // useEffect(() => {
  //   const intervalRef = setInterval(() => {
  //     if (chart && lastPriceCache.timestamp !== -1) {
  //       chart.series[0].addPoint([lastPriceCache.timestamp, lastPriceCache.price])
  //       lastPriceCache = {
  //         timestamp: -1,
  //         price: -1
  //       }
  //     }
  //   }, 1000)
  //
  //   return () => {
  //     clearInterval(intervalRef)
  //   }
  // }, [])

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

  useEffect(() => {
    if (chart) {
      chart.reflow()
    }
  }, [chart, layout, chartsCount])

  useEffect(() => {
    if (chart) {
      chart.setTitle({ text: symbol })
    }
  }, [chart, symbol])

  useEffect(() => {
    if (!loading && data && !error && chart) {
      const newData = data.getPrices?.priceArray?.map((priceObj) => {
        // console.log(new Date(priceObj?.timestamp || 0).toLocaleString())
        return [priceObj?.timestamp, priceObj?.price]
      })

      if (newData) {
        chart.series[0].setData(newData, true, false, true)
        // chart.xAxis[0].setExtremes(newData[0][0], newData[newData.length-1][0])

        // chart.series[0].setStartPoint({x: newData[0][0]})
        // chart.series[0].update({
        //   pointStart: {x:newData[0][0]}
        // })
        // chart.series[1].update({
        //   pointStart: {x:newData[0][0]}
        // })
        // setInitDataSet(true)
      }
    }
  }, [data, loading, error, chart])

  const removeChartWrapper = useCallback(() => {
    removeChart()
  }, [removeChart])

  return (
    <div className={styles.container}>
      {loading && <div>Loading chart...</div>}
      {!error && !loading && data && (
        <div className={styles.chartWrapper}>
          <IconButton onClick={removeChartWrapper}>
            <CloseIcon />
          </IconButton>
          <HighchartsReact highcharts={HighchartsStock} options={options} callback={setChart} />
        </div>
      )}
    </div>
  )
}
