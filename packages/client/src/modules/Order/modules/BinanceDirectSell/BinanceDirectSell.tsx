import React, { useCallback, useEffect } from 'react'
import { Box, Button, Radio, RadioGroup, FormControlLabel } from '@material-ui/core'
import { Controller, useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { parseNumber } from '../../../../utils/mix'
import { PriceType, QuantityType } from '../../../../binanceTypes'
import { Input } from '../../../../form'
import { GET_BINANCE_ORDERS, GET_ORDERS, SET_BINANCE_SELL_ORDER } from '../../../../gqls'
import { SymbolList } from '../SymbolList/SymbolList'
import { ErrorModal, Label } from '../../../../components'
import { BinanceLastPriceSubscription_binanceLastPrice as LastPrice } from '../../../../types/graphql/generated/BinanceLastPriceSubscription'
import { BinanceAccountInformation_getBinanceAccountInformation_balances as Balance } from '../../../../types/graphql/generated/BinanceAccountInformation'

import styles from '../../styles.module.scss'
import { BinanceSellOrder, BinanceSellOrderVariables } from '../../../../types/graphql/generated/BinanceSellOrder'

type Props = {
  assetAmount: number
  balances: Array<Balance>
  lastPrice?: LastPrice
  setError: (error: any) => void
  setLoading: (value: boolean) => void
  setSymbol: (symbol: string) => void
  symbol: string
}

type FormValues = {
  priceType: PriceType
  price: string
  quantityType: QuantityType
  quantity: string
  quoteOrderQty: string
  symbol: string
}

export const BinanceDirectSell = ({
  assetAmount,
  balances,
  lastPrice,
  symbol: predefinedSymbol,
  setSymbol,
  setLoading,
  setError
}: Props) => {
  const form = useForm<FormValues>({
    defaultValues: {
      symbol: predefinedSymbol,
      priceType: PriceType.Middle,
      quantityType: QuantityType.All
    }
  })

  const [setOrder, response] = useMutation<BinanceSellOrder, BinanceSellOrderVariables>(SET_BINANCE_SELL_ORDER, {
    fetchPolicy: 'no-cache',
    refetchQueries: [
      {
        query: GET_ORDERS
      },
      {
        query: GET_BINANCE_ORDERS
      }
    ]
  })

  useEffect(() => {
    setLoading(response.loading)
  }, [response.loading])

  useEffect(() => {
    if (response.error) {
      setError(response.error)
    }
  }, [response.error])

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
      setOrder({
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
  }, [form, setOrder])

  console.log(response.error)

  return (
    <>
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
      <ErrorModal error={response.loading ? '' : response.error} />
    </>
  )
}
