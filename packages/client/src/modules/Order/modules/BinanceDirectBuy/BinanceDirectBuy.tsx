import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Radio, RadioGroup, FormControlLabel, Paper, IconButton, MenuItem } from '@material-ui/core'
import { Controller, useForm } from 'react-hook-form'
import { useSubscription, useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { BinanceBalance, BinanceLastPrice } from '@sw/shared/src/graphql'

import { PriceType, QuantityType } from '../../../../binanceTypes'
import { Input, Select, Autocomplete } from '../../../../form'
import { SET_BINANCE_BUY_ORDER } from '../../../../gqls'
import styles from '../../styles.module.scss'
import { round, parseNumber } from '../../../../utils/mix'
import { SymbolList } from '../SymbolList/SymbolList'
import { Label } from '../../../../components'

type Props = {
  balances: Array<BinanceBalance>
  symbol: string
  setSymbol: (symbol: string) => void
  lastPrice?: BinanceLastPrice
}

type FormValues = {
  priceType: PriceType
  price: string
  quantityType: QuantityType
  quantity: string
  quoteOrderQty: string
  symbol: string
}

export const BinanceDirectBuy = ({ balances, lastPrice, symbol: predefinedSymbol, setSymbol }: Props) => {
  const form = useForm<FormValues>({
    defaultValues: {
      symbol: predefinedSymbol || '',
      priceType: PriceType.Middle,
      quantityType: QuantityType.QuoteOrderQty
    }
  })

  const symbol = form.watch('symbol')

  useEffect(() => {
    setSymbol(symbol)
  }, [symbol])

  const [setBinanceSellOrder, response] = useLazyQuery<{ setBinanceBuyOrder: string }>(SET_BINANCE_BUY_ORDER, {
    fetchPolicy: 'network-only'
  })

  const save = useCallback(() => {
    const { priceType, price, quantity, quantityType, quoteOrderQty, symbol: symb } = form.getValues()

    const numericPrice = parseNumber(price)

    if (!priceType) {
      // TODO
      console.log('Choose price type')
    } else if (priceType === PriceType.Price && (Number.isNaN(numericPrice) || numericPrice < 0)) {
      // TODO
      console.log('Invalid price')
    } else {
      setBinanceSellOrder({
        variables: {
          symbol: symb,
          priceType,
          price: parseFloat(price) || 0,
          quantityType,
          quantity: parseFloat(quantity) || 0,
          quoteOrderQty: parseFloat(quoteOrderQty) || 0
        }
      })
    }
  }, [form, setBinanceSellOrder])

  console.log(response.error)

  return (
    <table className={styles.table}>
      <tbody>
        <tr>
          <td>
            <Label>Symbol:</Label>
          </td>
          <td>
            <SymbolList form={form} balances={balances} />
          </td>
        </tr>
        <tr>
          <td>
            <Label size={42}>Buy on:</Label>
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
                    <FormControlLabel value={PriceType.Middle} control={<Radio />} label="Middle" />
                  </Box>
                  <Box>
                    <FormControlLabel value={PriceType.Price} control={<Radio />} label="Price" />
                    <Input form={form} name="price" disabled={value !== PriceType.Price} />
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
              render={({ field: { onBlur, ref, onChange, value } }) => (
                <RadioGroup onChange={(event, val) => onChange(val)} value={value}>
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
                      label="Quantity of the BUSD to buy"
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
              Place buy order
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
