import React, { useCallback, useEffect } from 'react'
import { Box, Button, Radio, RadioGroup, FormControlLabel } from '@material-ui/core'
import { Controller, useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'

import { PriceType, QuantityType } from '../../../../binanceTypes'
import { Input } from '../../../../form'
import { GET_BINANCE_ORDERS, GET_ORDERS, SET_BINANCE_BUY_ORDER } from '../../../../gqls'
import styles from '../../styles.module.scss'
import { parseNumber } from '../../../../utils/mix'
import { SymbolList } from '../SymbolList/SymbolList'
import { Label } from '../../../../components'
import { BinanceAccountInformation_getBinanceAccountInformation_balances as Balance } from '../../../../types/graphql/generated/BinanceAccountInformation'
import { BinanceBuyOrder, BinanceBuyOrderVariables } from '../../../../types/graphql/generated/BinanceBuyOrder'
import { FormBase, PropsBase } from "../../types";
import { PriceTypeComponent } from "../PriceType/PriceType";
import { QuantityTypeComponent } from "../QuantityType/QuantityType";

type Props = PropsBase

type FormValues = FormBase & {
  priceType: PriceType
  price: string
  quantityType: QuantityType
  quantity: string
  quoteOrderQty: string
}

export const BinanceDirectBuy = ({ balances, baseAsset: predefinedBaseAsset = '',
  assetAmount,
  dollars,
  lastPrice,
                                   quoteAsset: predefinedQuoteAsset = '', setError, setLoading, setSymbol }: Props) => {
  const form = useForm<FormValues>({
    defaultValues: {
      baseAsset: predefinedBaseAsset,
      quoteAsset: predefinedQuoteAsset,
      priceType: PriceType.Middle,
      quantityType: QuantityType.QuoteOrderQty
    }
  })

  const [setOrder, response] = useMutation<BinanceBuyOrder, BinanceBuyOrderVariables>(SET_BINANCE_BUY_ORDER, {
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
    const { priceType, price, quantity, quantityType, quoteOrderQty, baseAsset, quoteAsset } = form.getValues()

    const numericPrice = parseNumber(price)

    if (!baseAsset || !quoteAsset) {
      console.log('Choose symbol!')
    }
    else if (!priceType) {
      // TODO
      console.log('Choose price type')
    } else if (priceType === PriceType.Price && (Number.isNaN(numericPrice) || numericPrice < 0)) {
      // TODO
      console.log('Invalid price')
    } else {
      setOrder({
        variables: {
          symbol: `${baseAsset}${quoteAsset}`,
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
    <table className={styles.table}>
      <tbody>
        <tr>
          <td>
            <Label>Symbol:</Label>
          </td>
          <td>
            <SymbolList form={form} balances={balances} setSymbol={setSymbol} />
          </td>
        </tr>
        <tr>
          <td>
            <Label size={42}>Buy on:</Label>
          </td>
          <td>
            <PriceTypeComponent form={form} lastPrice={lastPrice}/>
          </td>
        </tr>
        <tr>
          <td>
            <Label size={42}>Quantity:</Label>
          </td>
          <td>
            <QuantityTypeComponent type="BUY" assetAmount={assetAmount} dollars={dollars} form={form} lastPrice={lastPrice?.bid}/>

            {/*<Controller*/}
            {/*  control={form.control}*/}
            {/*  name="quantityType"*/}
            {/*  render={({ field: { onBlur, ref, onChange, value } }) => (*/}
            {/*    <RadioGroup onChange={(event, val) => onChange(val)} value={value}>*/}
            {/*      <Box>*/}
            {/*        <FormControlLabel*/}
            {/*          value={QuantityType.Quantity}*/}
            {/*          control={<Radio />}*/}
            {/*          label="Quantity of the base Asset"*/}
            {/*        />*/}
            {/*        <Input form={form} name="quantity" disabled={value !== QuantityType.Quantity} />*/}
            {/*      </Box>*/}
            {/*      <Box>*/}
            {/*        <FormControlLabel*/}
            {/*          value={QuantityType.QuoteOrderQty}*/}
            {/*          control={<Radio />}*/}
            {/*          label="Quantity of the BUSD to buy"*/}
            {/*        />*/}
            {/*        <Input form={form} name="quoteOrderQty" disabled={value !== QuantityType.QuoteOrderQty} />*/}
            {/*      </Box>*/}
            {/*    </RadioGroup>*/}
            {/*  )}*/}
            {/*/>*/}
          </td>
        </tr>
        <tr>
          <td />
          <td>
            <Button color="primary" onClick={form.handleSubmit(save)} variant="contained">
              Place buy order
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
