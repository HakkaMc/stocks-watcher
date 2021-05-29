import React from 'react'
import { Box, Typography } from '@material-ui/core'
import { FormattedNumber } from 'react-intl'
import { BinanceLastPriceSubscription_binanceLastPrice as LastPrice } from '../../../../types/graphql/generated/BinanceLastPriceSubscription'

type Props = {
  busdAmount: {
    free: number
    locked: number
  }
  lastPrice?: LastPrice
  assetAmount: number
}

export const Info = ({ assetAmount, busdAmount, lastPrice }: Props) => {
  return (
    <>
      <Box>
        <Typography color="textSecondary" variant="h6">
          Symbol actual price
        </Typography>
        <Box pl={2}>
          <Typography color="textSecondary">
            <Box>
              Ask:{' '}
              <FormattedNumber
                value={lastPrice?.ask || Number.NaN}
                style="currency"
                currency="USD"
                maximumFractionDigits={4}
              />
            </Box>
            <Box>
              Middle:{' '}
              <FormattedNumber
                value={lastPrice?.middle || Number.NaN}
                style="currency"
                currency="USD"
                maximumFractionDigits={4}
              />
            </Box>
            <Box>
              Bid:{' '}
              <FormattedNumber
                value={lastPrice?.bid || Number.NaN}
                style="currency"
                currency="USD"
                maximumFractionDigits={4}
              />
            </Box>
            <Box>
              Ask vs. Bid:{' '}
              <FormattedNumber
                value={(lastPrice?.diffPercentage || Number.NaN) / 100}
                style="percent"
                currency="USD"
                maximumFractionDigits={2}
              />
            </Box>
          </Typography>
        </Box>
      </Box>

      <Box pt={2}>
        <Typography color="textSecondary" variant="h6">
          Your asset amount
        </Typography>
        <Box pl={2}>
          <Typography color="textSecondary">
            <FormattedNumber value={assetAmount} minimumFractionDigits={4} />
          </Typography>
        </Box>
      </Box>

      <Box pt={2}>
        <Typography color="textSecondary" variant="h6">
          Your deposit
        </Typography>
        <Box pl={2}>
          <Typography color="textSecondary">
            <Box>
              Free: <FormattedNumber value={busdAmount.free} style="currency" currency="USD" />
            </Box>
            <Box>
              Locked: <FormattedNumber value={busdAmount.locked} style="currency" currency="USD" />
            </Box>
            <Box>
              Sum: <FormattedNumber value={busdAmount.free + busdAmount.locked} style="currency" currency="USD" />
            </Box>
          </Typography>
        </Box>
      </Box>
    </>
  )
}
