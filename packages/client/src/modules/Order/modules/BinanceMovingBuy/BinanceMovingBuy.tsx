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
import { BinanceBalance, BinanceLastPrice } from '@sw/shared/src/graphql'
import { useMutation } from '@apollo/client'

import { parseNumber } from '../../../../utils/mix'
import { ErrorModal, Label } from '../../../../components'
import { Input } from '../../../../form'
import { PriceType, QuantityType } from '../../../../binanceTypes'
import { useModalLoader } from '../../../../hooks'
import { SymbolList } from '../SymbolList/SymbolList'
import { GET_ORDERS, SET_MOVING_BUY_ORDER } from '../../../../gqls'

import styles from '../../styles.module.scss'

type Props = {
  balances: Array<BinanceBalance>
  symbol: string
  setSymbol: (symbol: string) => void
  busdAmount: {
    free: number
    locked: number
  }
  lastPrice?: BinanceLastPrice
}

type FormValues = {
  activateOnPrice: string
  symbol: string
  percent: number
  priceType: PriceType
  quantityType: QuantityType
  quantity: string
  quoteOrderQty: string
}

export const BinanceMovingBuy = ({ balances, busdAmount, lastPrice, symbol: predefinedSymbol, setSymbol }: Props) => {
  const { showLoader, hideLoader } = useModalLoader()

  const form = useForm<FormValues>({
    defaultValues: {
      symbol: predefinedSymbol,
      activateOnPrice: '',
      priceType: PriceType.Market,
      quantityType: QuantityType.QuoteOrderQty,
      percent: 5
    }
  })

  const formQuantity = form.watch('quantity')

  const [setOrder, response] = useMutation<{ setMovingBuyOrder: string }>(SET_MOVING_BUY_ORDER, {
    fetchPolicy: 'no-cache',
    refetchQueries: [
      {
        query: GET_ORDERS
      }
    ]
  })

  const save = useCallback(() => {
    const values = form.getValues()

    const activateOnPrice = parseNumber(values.activateOnPrice)
    const quantity = parseNumber(values.quantity)
    const quoteOrderQty = parseNumber(values.quoteOrderQty)
    const percent = parseNumber(values.percent)

    if (!values.symbol) {
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
      showLoader()

      setOrder({
        variables: {
          symbol: values.symbol,
          activateOnPrice,
          priceType: values.priceType,
          quantityType: values.quantityType,
          quantity: quantity || -1,
          quoteOrderQty: quoteOrderQty || -1,
          percent
        }
      })
    }
  }, [form, setOrder])

  return (
    <form>
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
                      <FormControlLabel value={QuantityType.Quantity} control={<Radio />} label="Base asset shares" />
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
                                        value={(parseFloat(formQuantity) || 0) * (lastPrice?.ask || 0)}
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
                            <span>$ to spend</span>
                            <Typography variant="caption" color="textSecondary">
                              &nbsp;(
                              <FormattedNumber value={busdAmount.free} style="currency" currency="USD" /> free)
                            </Typography>
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
      <ErrorModal error={response.loading ? '' : response.error} />
    </form>
  )
}
