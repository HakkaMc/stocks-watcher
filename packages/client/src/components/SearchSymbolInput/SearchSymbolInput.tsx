import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import classnames from 'classnames'
import { Autorenew as AutorenewIcon } from '@material-ui/icons'
import { useMutation, useLazyQuery, useQuery } from '@apollo/client'
import { Symbol as SymbolType } from '@sw/shared/src/graphql'
import { Input } from '../../form'
import styles from './styles.module.scss'
import { GET_DASHBOARD, SYMBOL_LIST_QUERY, SAVE_SYMBOL_TO_DASHBOARD } from '../../gqls'

// type FormValues = {
//   symbol: string
// }

type Props = {
  save: (symbol: string) => void
  white?: boolean
}

export const SearchSymbolInput = ({ save, white }: Props) => {
  const [inputName] = useState(`${Math.random()}_${Date.now()}`)

  const [getSymbols, { data, loading, error }] = useLazyQuery<{ findSymbols: Array<SymbolType> }>(SYMBOL_LIST_QUERY)

  const [symbols, setSymbols] = useState<Array<SymbolType>>([])

  const form = useForm()

  useEffect(() => {
    if (!loading && !error && data && data.findSymbols) {
      setSymbols(data.findSymbols)
    }
  }, [data, loading, error])

  const selectSymbol = useCallback(
    (symbolObj: SymbolType) => () => {
      form.reset({
        [inputName]: ''
      })
      setSymbols([])
      save(symbolObj.symbol)
    },
    []
  )

  const onBlur = useCallback(() => {
    setTimeout(() => {
      form.reset({
        [inputName]: ''
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
    [setSymbols]
  )

  const clearSymbols = useCallback(() => {
    setSymbols([])
  }, [setSymbols])

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <Input
          autoComplete="new-password"
          form={form}
          name={inputName}
          onBlur={onBlur}
          onChange={onChange}
          placeholder="Search symbol"
          className={classnames(styles.symbolInput, { [styles.white]: white })}
        />
        <div className={classnames(styles.loading, { [styles.show]: loading })}>
          <AutorenewIcon />
        </div>
      </div>
      <div className={styles.listStaticContainer}>
        {symbols.length > 0 && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
