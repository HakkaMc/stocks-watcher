import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import classnames from 'classnames'
import { useMutation, useLazyQuery } from '@apollo/client'
import { Symbol as SymbolType } from '@sw/shared/src/graphql'
import { Input } from '../../form'
import styles from './styles.module.scss'
import { GET_USER_PROFILE, SYMBOL_LIST_QUERY, SAVE_SYMBOL_TO_DASHBOARD } from '../../gqls'

type FormValues = {
  symbol: string
}

export const Search = () => {
  const [getSymbols, { data, loading, error }] = useLazyQuery<{ findSymbols: Array<SymbolType> }>(SYMBOL_LIST_QUERY)
  const [
    saveSymbolToDashboard,
    { data: saveSymbolToDashboardData, loading: saveSymbolToDashboardLoading, error: saveSymbolToDashboardError }
  ] = useMutation(SAVE_SYMBOL_TO_DASHBOARD, {
    refetchQueries: [
      {
        query: GET_USER_PROFILE
      }
    ]
  })
  const [symbols, setSymbols] = useState<Array<SymbolType>>([])

  const form = useForm<FormValues>()

  useEffect(() => {
    if (!loading && !error && data && data.findSymbols) {
      setSymbols(data.findSymbols)
    }
  }, [data, loading, error])

  const selectSymbol = useCallback(
    (symbolObj: SymbolType) => () => {
      form.reset({
        symbol: ''
      })
      setSymbols([])
      saveSymbolToDashboard({ variables: { symbol: symbolObj.symbol } })
    },
    []
  )

  const onBlur = useCallback(() => {
    setTimeout(() => {
      form.reset({
        symbol: ''
      })
      setSymbols([])
    }, 300)
  }, [form])

  const onChange = useCallback(
    (event) => {
      if (event.target.value.toString().length > 1) {
        setSymbols([])
        getSymbols({
          variables: {
            search: event.target.value
          }
        })
      } else {
        setSymbols([])
      }
    },
    [setSymbols, setSymbols]
  )

  return (
    <div className={styles.container}>
      <form className={styles.form}>
        <Input form={form} name="symbol" onBlur={onBlur} onChange={onChange} placeholder="Search symbol"/>
        <div className={classnames(styles.loading, { [styles.show]: loading })}>loading</div>
      </form>
      <div className={styles.listStaticContainer}>
        {symbols.length > 0 && (
          <div className={styles.listFloatingContainer}>
            <table>
              <tbody>
                {symbols?.map((symbolObj) => {
                  return (
                    <tr key={symbolObj.symbol} className={styles.listItem} onClick={selectSymbol(symbolObj)}>
                      <td className={styles.symbol}>
                        [<b>{symbolObj.displaySymbol}</b>]
                      </td>
                      <td className={styles.description}>{symbolObj.description}</td>
                      <td className={styles.type}>{symbolObj.type}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
