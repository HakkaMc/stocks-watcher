import React, { useMemo } from 'react'
import { Select as SelectComponent, MenuItem } from '@material-ui/core'
import { Controller, UseFormReturn } from 'react-hook-form'

import styles from './styles.module.scss'

type Props = {
  name: string
  form: UseFormReturn<any>
  list?: Array<{
    text: string
    value: string | number
  }>
  children?: any
}

export const Select = ({ form, name, list = [], children }: Props) => {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (Array.isArray(list) && list.length) {
      return list.map((item) => (
        <MenuItem key={item.value} value={item.value}>
          {item.text}
        </MenuItem>
      ))
    }

    return null
  }, [children, list])

  return (
    <Controller
      control={form.control}
      name={name || 'select'}
      render={({ field: { onBlur: controlOnBlur, ref, onChange: controlOnChange, value } }) => (
        <SelectComponent ref={ref} value={value} onChange={controlOnChange} onBlur={controlOnBlur}>
          {content}
        </SelectComponent>
      )}
    />
  )
}
