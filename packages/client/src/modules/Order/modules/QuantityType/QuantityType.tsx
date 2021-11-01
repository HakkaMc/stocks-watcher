import React from 'react'
import classNames from 'classnames'
import { Box, FormControl, FormControlLabel, InputAdornment, Radio, RadioGroup, Typography } from "@material-ui/core";

import { FormattedNumber } from "react-intl";
import get from "lodash/get";
import { Controller, UseFormReturn } from "react-hook-form";
import { AssetAmount, Dollars } from "../../types";
import { QuantityType } from "../../../../binanceTypes";
import { Input } from "../../../../form";

const TYPE = {
  BUY: 'BUY',
  SELL: 'SELL',
  BOTH: 'BOTH'
}

type Props = {
  assetAmount: AssetAmount
  form: UseFormReturn<any>
  dollars: Dollars
  lastPrice?: number
  type: 'BUY' | 'SELL' | 'BOTH'
}

export const QuantityTypeComponent = ({form, dollars, lastPrice=0, assetAmount = {free:0,locked:0}, type}: Props) => {
  const baseAsset = form.watch('baseAsset')
  const quoteAsset = form.watch('quoteAsset')
  const quantity = form.watch('quantity')

  return <Controller
    control={form.control}
    name="quantityType"
    defaultValue={QuantityType.All}
    render={({ field: { onBlur, ref, onChange, value } }) => (
      <RadioGroup onChange={(event, val) => onChange(val)} value={value}>
        {[TYPE.SELL, TYPE.BOTH].includes(type) && <Box>
          <FormControlLabel value={QuantityType.All} control={<Radio />} label={
            <>
              <span>All</span>
              <Typography variant="caption" color="textSecondary">
                &nbsp;(
                <FormattedNumber value={assetAmount.free}/> free ;
                {' '}
                <FormattedNumber value={assetAmount.free * lastPrice} style="currency" currency="USD" />)
              </Typography>
            </>
          } />
        </Box>}

        <Box>
          <FormControlLabel value={QuantityType.Quantity} control={<Radio />}
                            label={
                              <>
                                <span>Amount of {baseAsset} shares</span>
                                {[TYPE.SELL, TYPE.BOTH].includes(type) &&<Typography variant="caption" color="textSecondary">
                                  &nbsp;(
                                  <FormattedNumber value={assetAmount.free}/> free)
                                </Typography>}
                              </>
                            }
          />
          {value === QuantityType.Quantity && (
            <Box pl={4}>
              <FormControl>
                <Input
                  form={form}
                  name="quantity"
                  disabled={value !== QuantityType.Quantity}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption" color="textSecondary">
                          (~&nbsp;
                          <FormattedNumber
                            value={(parseFloat(quantity) || 0) * (lastPrice)}
                            style="currency"
                            currency="USD"
                          />
                          )
                        </Typography>
                      </InputAdornment>
                    )
                  }}
                />
              </FormControl>
            </Box>
          )}
        </Box>

        <Box>
          <FormControlLabel
            value={QuantityType.QuoteOrderQty}
            control={<Radio />}
            label={
              <>
                <span>Amount of {quoteAsset}</span>
                {[TYPE.BUY, TYPE.BOTH].includes(type) && <Typography variant="caption" color="textSecondary">
                  &nbsp;(
                  <FormattedNumber value={get(dollars, `${quoteAsset}.free`)||0} style="currency" currency="USD" /> free)
                </Typography>}
              </>
            }
          />
          {value === QuantityType.QuoteOrderQty && (
            <Box pl={4}>
              <Input
                form={form}
                name="quoteOrderQty"
                disabled={value !== QuantityType.QuoteOrderQty}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="caption" color="textSecondary">
                        $
                      </Typography>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          )}
        </Box>
      </RadioGroup>
    )}
  />
}
