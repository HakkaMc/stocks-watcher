import React, { FC } from 'react'
import { Radio as RadioUI, RadioProps } from '@material-ui/core'
import { Controller, UseFormReturn } from 'react-hook-form'
import classNames from 'classnames'

import styles from './styles.module.scss'

type Props = {
  form: UseFormReturn<any>
  name: string
  className?: string
  value: any
  onChange?: any
}

export const Radio = ({ className, name, form, onChange, ...rest }: Props) => (
  <Controller
    control={form.control}
    name={name || 'radio'}
    render={({ field: { onBlur: controlOnBlur, ref, onChange: controlOnChange, value } }) => (
      <RadioUI
        {...rest}
        className={classNames(styles.input, className)}
        ref={ref}
        onChange={(e) => {
          controlOnChange(e.target.value)
          if (onChange) {
            onChange(e, e.target.value)
          }
        }}
        value={rest.value}
      />
    )}
    defaultValue=""
  />
)
