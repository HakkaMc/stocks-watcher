import React, { FC } from 'react'
import { TextField, TextFieldProps } from '@material-ui/core'
import { Controller, UseFormReturn } from 'react-hook-form'
import classNames from 'classnames'

import styles from './styles.module.scss'

type Props = TextFieldProps & {
  form: UseFormReturn<any>
  name: string
  className?: string
  type?: 'date' | 'datetime-local' | 'time' | 'text'
}

export const Input: FC<Props> = ({ className, name, form, onBlur, onChange, type = 'text', ...rest }: Props) => (
  <Controller
    control={form.control}
    name={name || 'input'}
    render={({ field: { onBlur: controlOnBlur, ref, onChange: controlOnChange, value } }) => (
      <TextField
        {...rest}
        name={name}
        className={classNames(styles.input, className)}
        type={type}
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
