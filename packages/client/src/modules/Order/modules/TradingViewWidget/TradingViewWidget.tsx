import React, { useCallback, useEffect, useRef } from 'react'
import { Box } from '@material-ui/core'

type Props = {
  symbol: string
}

const SCRIPT_ID = 'tradingview-widget-script'

export const TradingViewWidget = ({ symbol }: Props) => {
  const containerId = useRef(`tradingview_container_${Date.now()}_${Math.random().toString().replace('.', '')}`)

  const init = useCallback(() => {
    const config = {
      // autosize: true,
      width: 900,
      // "height": 610,
      symbol: symbol || 'TOTAL',
      interval: '5',
      timezone: "Europe/Berlin",
      theme: 'light',
      style: '1',
      locale: 'en',
      toolbar_bg: '#f1f3f6',
      enable_publishing: false,
      allow_symbol_change: false,
      container_id: containerId.current,
      "save_image": false,
      // "hide_legend": true,
      // studies: ['MASimple@tv-basicstudies']
    }

    // @ts-ignore
    if (window.TradingView?.widget) {
      // @ts-ignore
      const Widget = window.TradingView.widget

      const widgetRef = new Widget(config)
    }
  }, [containerId, symbol])

  useEffect(() => {
    // @ts-ignore
    if (typeof window.TradingView === 'undefined') {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.type = 'text/javascript'
      script.async = true
      script.src = 'https://s3.tradingview.com/tv.js'
      script.onload = () => {
        init()
      }
      document.getElementsByTagName('head')[0].appendChild(script)
    } else {
      init()
    }
  }, [init])

  return <div id={containerId.current} />
}
