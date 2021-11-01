import React from 'react'
import { Box, FormControlLabel, Radio, RadioGroup } from "@material-ui/core";
import { Controller, UseFormReturn } from 'react-hook-form'

import { Input } from "../../../../form";
import { PriceType } from "../../../../binanceTypes";
import { PropsBase } from "../../types";

type Props = {
  form: UseFormReturn<any>
  hidePriceInput?: boolean
  lastPrice: PropsBase['lastPrice']
}

export const PriceTypeComponent = ({form, hidePriceInput, lastPrice}: Props) => {
  const {setValue: setFormValue} = form

  const setPrice = () => {
    if(!hidePriceInput && lastPrice){
      setFormValue('price', lastPrice.middle)
    }
  }

  return <Controller
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
        {!hidePriceInput && <Box>
          <FormControlLabel value={PriceType.Price} control={<Radio />} label="Price" onClick={setPrice}/>
          <Input form={form} name="price" disabled={value !== PriceType.Price} />
        </Box>}
      </RadioGroup>
    )}
  />
}
