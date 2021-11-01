import React, { useCallback, useEffect } from 'react'
import {
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  InputAdornment,
  Typography,
  FormControl
} from '@material-ui/core'
import { Controller, useForm } from 'react-hook-form'
import { FormattedNumber } from 'react-intl'
import { useMutation } from '@apollo/client'
import get from 'lodash/get'

import { parseNumber } from '../../../../utils/mix'
import { ErrorModal, Label } from '../../../../components'
import { Input } from '../../../../form'
import { PriceType, QuantityType } from '../../../../binanceTypes'
import { useModalLoader } from '../../../../hooks'
import { SymbolList } from '../SymbolList/SymbolList'
import { GET_BINANCE_ORDERS, GET_ORDERS, SET_ORDER } from '../../../../gqls'
import { orderTemplate } from '../../orderTemplate'
import {PriceTypeComponent} from "../PriceType/PriceType";
import {QuantityTypeComponent} from '../QuantityType/QuantityType'

import styles from '../../styles.module.scss'
import { SetOrder, SetOrderVariables } from '../../../../types/graphql/generated/SetOrder'
import { FormBase, PropsBase } from "../../types";

type Props = PropsBase

type FormValues = FormBase & {
  activateOnPrice: string
  percent: number
  priceType: PriceType
  quantityType: QuantityType
  quantity: string
  quoteOrderQty: string
}

export const BinanceMovingBuy = ({
  assetAmount,
  balances,
  dollars,
  lastPrice,
  baseAsset: predefinedBaseAsset = '',
  quoteAsset: predefinedQuoteAsset = '',
  setSymbol,
  setLoading,
  setError
}: Props) => {
  const form = useForm<FormValues>({
    defaultValues: {
      baseAsset: predefinedBaseAsset,
      quoteAsset: predefinedQuoteAsset,
      activateOnPrice: '',
      priceType: PriceType.Market,
      quantityType: QuantityType.QuoteOrderQty,
      percent: 5
    }
  })

  const formQuantity = form.watch('quantity')
  const quoteAsset = form.watch('quoteAsset')

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
    const quantity = parseNumber(values.quantity)
    const quoteOrderQty = parseNumber(values.quoteOrderQty)
    const percent = parseNumber(values.percent)

    if (!values.baseAsset || !values.quoteAsset) {
      console.log('Choose symbol!')
    } else if (!values.priceType) {
      // TODO
      console.log('Choose price type')
    } else if (!activateOnPrice || activateOnPrice < 0) {
      // TODO
      console.log('Invalid Activate on price')
    } else if (percent < 0 || percent > 10) {
      console.log('Invalid Percent value')
    } else {
      setOrder({
        variables: {
          record: {
            ...orderTemplate,
            symbol: `${values.baseAsset}${values.quoteAsset}`,
            activateOnPrice,
            priceType: values.priceType,
            quantityType: values.quantityType,
            quantity: quantity || -1,
            quoteOrderQty: quoteOrderQty || -1,
            percent,
            type: 'MOVING_BUY'
          }
        }
      })
    }
  }, [form, setOrder])

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
            <Label>Activate on price:</Label>
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
                      % (max. 10)
                    </Typography>
                  </InputAdornment>
                )
              }}
            />
          </td>
        </tr>

        <tr>
          <td>
            <Label size={42}>Buy price type:</Label>
          </td>
          <td>
            <PriceTypeComponent form={form} lastPrice={lastPrice} hidePriceInput/>
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
            {/*  defaultValue={QuantityType.All}*/}
            {/*  render={({ field: { onBlur, ref, onChange, value } }) => (*/}
            {/*    <RadioGroup onChange={(event, val) => onChange(val)} value={value}>*/}
            {/*      <Box>*/}
            {/*        <FormControlLabel value={QuantityType.Quantity} control={<Radio />} label="Base asset shares" />*/}
            {/*        {value === QuantityType.Quantity && (*/}
            {/*          <Box pl={4}>*/}
            {/*            <FormControl>*/}
            {/*              <Input*/}
            {/*                form={form}*/}
            {/*                name="quantity"*/}
            {/*                disabled={value !== QuantityType.Quantity}*/}
            {/*                InputProps={{*/}
            {/*                  endAdornment: (*/}
            {/*                    <InputAdornment position="end">*/}
            {/*                      <Typography variant="caption" color="textSecondary">*/}
            {/*                        (~&nbsp;*/}
            {/*                        <FormattedNumber*/}
            {/*                          value={(parseFloat(formQuantity) || 0) * (lastPrice?.ask || 0)}*/}
            {/*                          style="currency"*/}
            {/*                          currency="USD"*/}
            {/*                        />*/}
            {/*                        )*/}
            {/*                      </Typography>*/}
            {/*                    </InputAdornment>*/}
            {/*                  )*/}
            {/*                }}*/}
            {/*              />*/}
            {/*            </FormControl>*/}
            {/*          </Box>*/}
            {/*        )}*/}
            {/*      </Box>*/}
            {/*      <Box>*/}
            {/*        <FormControlLabel*/}
            {/*          value={QuantityType.QuoteOrderQty}*/}
            {/*          control={<Radio />}*/}
            {/*          label={*/}
            {/*            <>*/}
            {/*              <span>$ to spend</span>*/}
            {/*              <Typography variant="caption" color="textSecondary">*/}
            {/*                &nbsp;(*/}
            {/*                <FormattedNumber value={get(dollars, `${quoteAsset}.free`)||0} style="currency" currency="USD" /> free)*/}
            {/*              </Typography>*/}
            {/*            </>*/}
            {/*          }*/}
            {/*        />*/}
            {/*        {value === QuantityType.QuoteOrderQty && (*/}
            {/*          <Box pl={4}>*/}
            {/*            <Input*/}
            {/*              form={form}*/}
            {/*              name="quoteOrderQty"*/}
            {/*              disabled={value !== QuantityType.QuoteOrderQty}*/}
            {/*              InputProps={{*/}
            {/*                endAdornment: (*/}
            {/*                  <InputAdornment position="end">*/}
            {/*                    <Typography variant="caption" color="textSecondary">*/}
            {/*                      $*/}
            {/*                    </Typography>*/}
            {/*                  </InputAdornment>*/}
            {/*                )*/}
            {/*              }}*/}
            {/*            />*/}
            {/*          </Box>*/}
            {/*        )}*/}
            {/*      </Box>*/}
            {/*    </RadioGroup>*/}
            {/*  )}*/}
            {/*/>*/}
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
