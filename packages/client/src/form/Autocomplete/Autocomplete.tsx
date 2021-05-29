import React from 'react'
import { TextField } from '@material-ui/core'
import AutocompleteComponent from '@material-ui/lab/Autocomplete'
import { Controller, UseFormReturn } from 'react-hook-form'

type ListItem = {
  text: string
  value: string | number
}

type Props = {
  name: string
  form: UseFormReturn<any>
  list: Array<ListItem>
  onChange?: (value: string) => void
}

export const Autocomplete = ({ form, name, list = [], onChange }: Props) => (
  <Controller
    control={form.control}
    name={name || 'select'}
    render={({ field: { onBlur: controlOnBlur, ref, onChange: controlOnChange, value } }) => {
      return (
        <AutocompleteComponent
          ref={ref}
          options={list}
          getOptionLabel={(item: ListItem | undefined) => item?.text || ''}
          getOptionSelected={(item: ListItem | undefined, val: ListItem | undefined) => item?.value === val?.value}
          onChange={(event, item) => {
            controlOnChange(item?.value)
            if (onChange) {
              onChange(item?.value.toString() || '')
            }
          }}
          onBlur={() => {
            controlOnBlur()
          }}
          renderOption={(item: ListItem) => item.text}
          renderInput={(params: any) => {
            return <TextField {...params} />
          }}
          size="small"
          value={list.find((item) => item.value === value) || null}
        />
      )
    }}
  />
)
