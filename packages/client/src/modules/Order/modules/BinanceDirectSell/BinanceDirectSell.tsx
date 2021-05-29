import React, { useCallback } from 'react'
import { Box, Button, Radio, RadioGroup, FormControlLabel } from '@material-ui/core'
import { Controller, useForm } from 'react-hook-form'
import { useLazyQuery } from '@apollo/client'
import { BinanceBalance, BinanceLastPrice } from '@sw/shared/src/graphql'
import { round, parseNumber } from '../../../../utils/mix'
import { PriceType, QuantityType } from '../../../../binanceTypes'
import { Input } from '../../../../form'
import { SET_BINANCE_SELL_ORDER } from '../../../../gqls'
import { SymbolList } from '../SymbolList/SymbolList'
import styles from '../../styles.module.scss'

type Props = {
  assetAmount: number
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

export const BinanceDirectSell = ({ assetAmount, balances, lastPrice, symbol: predefinedSymbol, setSymbol }: Props) => {
  const form = useForm<FormValues>({
    defaultValues: {
      symbol: predefinedSymbol,
      priceType: PriceType.Middle,
      quantityType: QuantityType.All
    }
  })

  const [setBinanceSellOrder, response] = useLazyQuery<{ setBinanceSellOrder: string }>(SET_BINANCE_SELL_ORDER, {
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
          <td>Symbol:</td>
          <td>
            <SymbolList form={form} balances={balances} onChange={setSymbol} />
          </td>
        </tr>
        <tr>
          <td>Sell on:</td>
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
          <td>Quantity:</td>
          <td>
            <Controller
              control={form.control}
              name="quantityType"
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
              Place sell order
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
