import React, { useCallback, useEffect } from 'react'
import { Box, Button, Radio, RadioGroup, FormControlLabel, Typography } from '@material-ui/core'
import { Controller, useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { BinanceBalance, BinanceLastPrice } from '@sw/shared/src/graphql'

import { round, parseNumber } from '../../../../utils/mix'
import { PriceType, QuantityType } from '../../../../binanceTypes'
import { Input } from '../../../../form'
import { SET_TRAILING_STOP_ORDER } from '../../../../gqls'
import { SymbolList } from '../SymbolList/SymbolList'
import styles from '../../styles.module.scss'
import { Label } from '../../../../components'

type Props = {
  assetAmount: number
  balances: Array<BinanceBalance>
  symbol: string
  setSymbol: (symbol: string) => void
  lastPrice?: BinanceLastPrice
}

type FormValues = {
  activateOnPrice: string
  sellOnPrice: string
  symbol: string
  priceType: PriceType
  quantityType: QuantityType
  quantity: string
  quoteOrderQty: string
}

export const BinanceFixedTrailingStop = ({
  balances,
  assetAmount,
  lastPrice,
  symbol: predefinedSymbol,
  setSymbol
}: Props) => {
  const form = useForm<FormValues>({
    defaultValues: {
      symbol: predefinedSymbol,
      activateOnPrice: '',
      sellOnPrice: '',
      priceType: PriceType.Market,
      quantityType: QuantityType.All
    }
  })

  const [setTrailingStopOrder, response] = useMutation<{ setTrailingStopOrder: string }>(SET_TRAILING_STOP_ORDER, {
    fetchPolicy: 'no-cache'
  })

  const save = useCallback(() => {
    const values = form.getValues()

    const activateOnPrice = parseNumber(values.activateOnPrice)
    const sellOnPrice = parseNumber(values.sellOnPrice)
    const quantity = parseNumber(values.quantity)
    const quoteOrderQty = parseNumber(values.quoteOrderQty)

    if (!values.priceType) {
      // TODO
      console.log('Choose price type')
    } else if (!activateOnPrice || activateOnPrice < 0) {
      // TODO
      console.log('Invalid Activate on price')
    } else if (!sellOnPrice || sellOnPrice < 0) {
      // TODO
      console.log('Invalid Sell on Price')
    } else {
      setTrailingStopOrder({
        variables: {
          symbol: values.symbol,
          activateOnPrice,
          sellOnPrice,
          priceType: values.priceType,
          quantityType: values.quantityType,
          quantity: quantity || -1,
          quoteOrderQty: quoteOrderQty || -1
        }
      })
    }
  }, [form, setTrailingStopOrder])

  console.log(response.error)

  return (
    <table className={styles.table}>
      <tbody>
        <tr>
          <td>
            <Label>Symbol:</Label>
          </td>
          <td>
            <SymbolList form={form} balances={balances} onChange={setSymbol} />
          </td>
        </tr>
        <tr>
          <td>
            <Label>Activate on Price:</Label>
          </td>
          <td>
            <Input form={form} name="activateOnPrice" />
          </td>
        </tr>
        <tr>
          <td>
            <Label>Sell on Price:</Label>
          </td>
          <td>
            <Input form={form} name="sellOnPrice" />
          </td>
        </tr>
        <tr>
          <td>
            <Label size={42}>Sell on:</Label>
          </td>
          <td>
            <Controller
              control={form.control}
              name="priceType"
              render={({ field: { onBlur, ref, onChange, value } }) => (
                <RadioGroup onChange={(event, val) => onChange(val)} value={value}>
                  <Box>
                    <FormControlLabel value={PriceType.Market} control={<Radio />} label="Market" />
                  </Box>
                  <Box>
                    <FormControlLabel value={PriceType.Price} control={<Radio />} label={'Same as "Sell on Price"'} />
                  </Box>
                </RadioGroup>
              )}
            />
          </td>
        </tr>
        <tr>
          <td>
            <Label size={42}>Quantity:</Label>
          </td>
          <td>
            <Controller
              control={form.control}
              name="quantityType"
              defaultValue={QuantityType.All}
              render={({ field: { onBlur, ref, onChange, value } }) => (
                <RadioGroup onChange={(event, val) => onChange(val)} value={value}>
                  <Box>
                    <FormControlLabel value={QuantityType.All} control={<Radio />} label="All" />
                    {assetAmount} ({assetAmount * (lastPrice?.middle || 0)} $)
                  </Box>
                  <Box>
                    <FormControlLabel
                      value={QuantityType.Quantity}
                      control={<Radio />}
                      label="Quantity of the base Asset"
                    />
                    <Input form={form} name="quantity" disabled={value !== QuantityType.Quantity} />
                  </Box>
                  <Box>
                    <FormControlLabel
                      value={QuantityType.QuoteOrderQty}
                      control={<Radio />}
                      label="Quantity of the BUSD to sell"
                    />
                    <Input form={form} name="quoteOrderQty" disabled={value !== QuantityType.QuoteOrderQty} />
                  </Box>
                </RadioGroup>
              )}
            />
          </td>
        </tr>
        <tr>
          <td />
          <td>
            <Button color="primary" onClick={save} variant="contained">
              Place stop order
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
