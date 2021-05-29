import React, { useCallback, useEffect, useMemo } from 'react'
import { Box, Button, Radio, RadioGroup, FormControlLabel, InputAdornment, Typography } from '@material-ui/core'
import { Controller, useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { FormattedNumber } from 'react-intl'

import { parseNumber } from '../../../../utils/mix'
import { PriceType, QuantityType } from '../../../../binanceTypes'
import { Input } from '../../../../form'
import { GET_BINANCE_ORDERS, GET_ORDERS, SET_ORDER } from '../../../../gqls'
import { SymbolList } from '../SymbolList/SymbolList'
import styles from '../../styles.module.scss'
import { Label } from '../../../../components'
import { SetOrder, SetOrderVariables } from '../../../../types/graphql/generated/SetOrder'
import { BinanceAccountInformation_getBinanceAccountInformation_balances as Balance } from '../../../../types/graphql/generated/BinanceAccountInformation'
import { BinanceLastPriceSubscription_binanceLastPrice as BinanceLastPrice } from '../../../../types/graphql/generated/BinanceLastPriceSubscription'
import { orderTemplate } from '../../orderTemplate'

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
  percent: number
  priceType: PriceType
  quantityType: QuantityType
  quantity: string
  quoteOrderQty: string
  symbol: string
}

export const BinanceMovingTrailingStop = ({
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
      symbol: predefinedSymbol,
      activateOnPrice: '',
      percent: 5,
      priceType: PriceType.Market,
      quantityType: QuantityType.All
    }
  })

  const percent = form.watch('percent')
  const activateOnPrice = form.watch('activateOnPrice')

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

    const activateOnPriceTmp = parseNumber(values.activateOnPrice)
    const percentTmp = parseNumber(values.percent)
    const quantity = parseNumber(values.quantity)
    const quoteOrderQty = parseNumber(values.quoteOrderQty)

    if (!values.priceType) {
      // TODO
      console.log('Choose price type')
    } else if (!activateOnPriceTmp || activateOnPriceTmp < 0) {
      // TODO
      console.log('Invalid Activate on price')
    } else if (percentTmp < 0 || percentTmp > 10) {
      console.log('Invalid Percent value')
    } else {
      setOrder({
        variables: {
          record: {
            ...orderTemplate,
            exchange: 'BINANCE',
            symbol: values.symbol,
            activateOnPrice: activateOnPriceTmp,
            percent: percentTmp,
            priceType: values.priceType,
            quantityType: values.quantityType,
            quantity: quantity || -1,
            quoteOrderQty: quoteOrderQty || -1,
            type: 'MOVING_TRAILING_STOP'
          }
        }
      })
    }
  }, [form, setOrder])

  const lowestPrice = useMemo(() => {
    const activateOnPriceTmp = parseNumber(activateOnPrice)
    const percentTmp = parseNumber(percent)

    if (activateOnPriceTmp && percentTmp) {
      return activateOnPriceTmp * ((100 - percentTmp) / 100)
    }

    return Number.NaN
  }, [activateOnPrice, percent])

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
            <Label>Percent:</Label>
          </td>
          <td>
            <Input
              form={form}
              name="percent"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="textSecondary">
                      % (max. 10) [<FormattedNumber value={lowestPrice} style="currency" currency="USD" />]
                    </Typography>
                  </InputAdornment>
                )
              }}
            />
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
                    <FormattedNumber value={assetAmount} minimumFractionDigits={4} /> (
                    <FormattedNumber value={assetAmount * (lastPrice?.middle || 0)} style="currency" currency="USD" />)
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
