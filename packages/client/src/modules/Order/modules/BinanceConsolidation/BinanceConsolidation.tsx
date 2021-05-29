import React, { useCallback, useEffect } from 'react'
import { Box, Button, Radio, RadioGroup, FormControlLabel } from '@material-ui/core'
import { Controller, useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'

import { parseNumber } from '../../../../utils/mix'
import { PriceType, QuantityType } from '../../../../binanceTypes'
import { Input } from '../../../../form'
import { GET_BINANCE_ORDERS, GET_ORDERS, SET_ORDER } from '../../../../gqls'
import { SymbolList } from '../SymbolList/SymbolList'
import { Label } from '../../../../components'
import { SetOrder, SetOrderVariables } from '../../../../types/graphql/generated/SetOrder'
import { BinanceAccountInformation_getBinanceAccountInformation_balances as Balance } from '../../../../types/graphql/generated/BinanceAccountInformation'
import { BinanceLastPriceSubscription_binanceLastPrice as BinanceLastPrice } from '../../../../types/graphql/generated/BinanceLastPriceSubscription'
import { orderTemplate } from '../../orderTemplate'

import styles from '../../styles.module.scss'

type Props = {
  assetAmount: number
  balances: Array<Balance>
  lastPrice?: BinanceLastPrice
  setError: (error: any) => void
  setLoading: (value: boolean) => void
  setSymbol: (symbol: string) => void
  symbol: string
}

type FormValues = {
  activateOnPrice: string
  priceType: PriceType
  quantityType: QuantityType
  quantity: string
  quoteOrderQty: string
  sellOnPrice: string
  step: string
  symbol: string
}

export const BinanceConsolidation = ({
  balances,
  assetAmount,
  lastPrice,
  symbol: predefinedSymbol,
  setSymbol,
  setLoading,
  setError
}: Props) => {
  const form = useForm<FormValues>({
    defaultValues: {
      activateOnPrice: '',
      priceType: PriceType.Market,
      quantityType: QuantityType.Quantity,
      sellOnPrice: '',
      step: 'BUY',
      symbol: predefinedSymbol
    }
  })

  const [setOrder, response] = useMutation<SetOrder, SetOrderVariables>(SET_ORDER, {
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
      setOrder({
        variables: {
          record: {
            ...orderTemplate,
            exchange: 'BINANCE',
            symbol: values.symbol,
            activateOnPrice,
            sellOnPrice,
            priceType: values.priceType,
            quantityType: values.quantityType,
            quantity: quantity || -1,
            quoteOrderQty: quoteOrderQty || -1,
            type: 'CONSOLIDATION',
            meta: {
              step: values.step,
              orderId: -1,
              locked: false
            }
          }
        }
      })
    }
  }, [form, setOrder])

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
            <Label>Buy on Price:</Label>
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
            <Label size={42}>Buy/sell type:</Label>
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
                </RadioGroup>
              )}
            />
          </td>
        </tr>
        <tr>
          <td>
            <Label size={42}>Start order with:</Label>
          </td>
          <td>
            <Controller
              control={form.control}
              name="step"
              render={({ field: { onBlur, ref, onChange, value } }) => (
                <RadioGroup onChange={(event, val) => onChange(val)} value={value}>
                  <Box>
                    <FormControlLabel value="BUY" control={<Radio />} label="Buy" />
                  </Box>
                  <Box>
                    <FormControlLabel value="SELL" control={<Radio />} label="Sell" />
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
                    {value === QuantityType.Quantity && (
                      <Input form={form} name="quantity" disabled={value !== QuantityType.Quantity} />
                    )}
                  </Box>
                  <Box>
                    <FormControlLabel
                      value={QuantityType.QuoteOrderQty}
                      control={<Radio />}
                      label="Quantity of the BUSD to buy/sell"
                    />
                    {value === QuantityType.QuoteOrderQty && (
                      <Input form={form} name="quoteOrderQty" disabled={value !== QuantityType.QuoteOrderQty} />
                    )}
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
              Place order
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
