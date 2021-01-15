import React, { FC } from 'react'
import { TextField, TextFieldProps } from '@material-ui/core'
import { Controller, UseFormMethods } from 'react-hook-form'

type Props = TextFieldProps & {
  form: UseFormMethods<any>
  name: string
}

export const Input: FC<Props> = ({ name, form, onBlur, onChange, ...rest }: Props) => (
  <Controller
    control={form.control}
    name={name || 'input'}
    render={({ onBlur: controlOnBlur, ref, onChange: controlOnChange, value }) => (
      <TextField
        {...rest}
        onBlur={(event: any) => {
          controlOnBlur()
          if (onBlur) {
            onBlur(event)
          }
        }}
        ref={ref}
        onChange={(e) => {
          controlOnChange(e.target.value)
          if (onChange) {
            onChange(e)
          }
        }}
        value={value}
      />
    )}
    defaultValue=""
  />
)
