import React from 'react'
import { Box, Typography } from '@material-ui/core'
import { FormattedNumber } from 'react-intl'
import { BinanceLastPriceSubscription_binanceLastPrice as LastPrice } from '../../../../types/graphql/generated/BinanceLastPriceSubscription'
import { AssetAmount, Dollars } from "../../types";
import { getPrecision } from "../../../../utils/mix";

type Props = {
  dollars: Dollars
  lastPrice?: LastPrice
  assetAmount: AssetAmount
}

export const Info = ({ assetAmount, dollars, lastPrice}: Props) => {
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
                maximumFractionDigits={getPrecision(lastPrice?.ask)}
              />
            </Box>
            <Box>
              Middle:{' '}
              <FormattedNumber
                value={lastPrice?.middle || Number.NaN}
                style="currency"
                currency="USD"
                maximumFractionDigits={getPrecision(lastPrice?.middle)}
              />
            </Box>
            <Box>
              Bid:{' '}
              <FormattedNumber
                value={lastPrice?.bid || Number.NaN}
                style="currency"
                currency="USD"
                maximumFractionDigits={getPrecision(lastPrice?.bid)}
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
            <Box>
            Free: <FormattedNumber value={assetAmount.free} minimumFractionDigits={getPrecision(assetAmount.free)} />
            </Box>
            <Box>
            Locked: <FormattedNumber value={assetAmount.locked} minimumFractionDigits={getPrecision(assetAmount.locked)} />
            </Box>
            <Box>
            Sum: <FormattedNumber value={assetAmount.free+assetAmount.locked} minimumFractionDigits={getPrecision(assetAmount.free+assetAmount.locked)} />
            </Box>
          </Typography>
        </Box>
      </Box>

      <Box pt={2}>
        <Typography color="textSecondary" variant="h6">
          Your deposit
        </Typography>
        <Box pl={2}>
          <Typography color="textSecondary">
            <table>
              <thead>
              <tr>
                <th>&nbsp;</th>
                <th>Free</th>
                <th>Locked</th>
                <th>Sum</th>
              </tr>
              </thead>
              <tbody>
              {Object.entries(dollars).map(([asset, data])=><tr key={asset}>
                <td>{asset}</td>
                <td><FormattedNumber value={data.free} style="currency" currency="USD" /></td>
                <td><FormattedNumber value={data.locked} style="currency" currency="USD" /></td>
                <td><FormattedNumber value={data.free + data.locked} style="currency" currency="USD" /></td>
              </tr>)}
              </tbody>
            </table>
          </Typography>
        </Box>
      </Box>
    </>
  )
}
