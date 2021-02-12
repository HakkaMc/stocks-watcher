import React, { useCallback, useEffect, useState } from 'react'
import { Symbol as SymbolType } from '@sw/shared/src/graphql'
import { Box, Button } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { DailyChangeIndicator } from './modules/DailyChangeIndicator/DailyChangeIndicator'

import { BigChart } from '../BigChart/BigChart'

type Props = {
  symbolObj: SymbolType
  shown: boolean
}

export const SymbolDetail = ({ symbolObj, shown }: Props) => {
  const [showChart, setShowChart] = useState(false)

  const onShowChartClick = useCallback(() => {
    setShowChart(true)
  }, [showChart, setShowChart])

  useEffect(() => {
    if (!shown && showChart) {
      setShowChart(false)
    }
  }, [shown, showChart])

  return (
    <>
      {shown && (
        <Box p={1} bgcolor={grey[50]}>
          <DailyChangeIndicator symbolObj={symbolObj} shown={shown} />
          <Box mt={2}>
            {!showChart && (
              <Button color="primary" onClick={onShowChartClick}>
                Show chart
              </Button>
            )}
            {showChart && <BigChart symbol={symbolObj.symbol} />}
          </Box>
        </Box>
      )}
    </>
  )
}
