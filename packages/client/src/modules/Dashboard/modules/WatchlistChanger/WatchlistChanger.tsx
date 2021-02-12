import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Checkbox, IconButton, Box } from '@material-ui/core'
import { Save as SaveIcon } from '@material-ui/icons'
import { useSubscription, useMutation, useQuery } from '@apollo/client'
import { Symbol as SymbolType, Dashboard } from '@sw/shared/src/graphql'
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck'
import { grey } from '@material-ui/core/colors'
import { SkullCrossbonesOutline as SkullIcon } from 'mdi-material-ui'

import { Input } from '../../../../form'
import styles from './styles.module.scss'
import {
  GET_DASHBOARD,
  REMOVE_SYMBOL_FROM_DASHBOARD,
  CHANGE_SYMBOL_WATCHLIST,
  CREATE_WATCHLIST
} from '../../../../gqls'

type FormValues = {
  newWatchlist: string
}

type Props = {
  symbolObj: SymbolType
}

export const WatchlistChanger = ({ symbolObj }: Props) => {
  const [changeSymbolFlag] = useMutation(CHANGE_SYMBOL_WATCHLIST, {
    refetchQueries: [
      {
        query: GET_DASHBOARD
      }
    ]
  })
  // const [] = useMutation(CREATE_WATCHLIST, {
  //   refetchQueries: [
  //     {
  //       query: GET_DASHBOARD
  //     }
  //   ]
  // })

  const [removeSymbol] = useMutation(REMOVE_SYMBOL_FROM_DASHBOARD, {
    refetchQueries: [
      {
        query: GET_DASHBOARD
      }
    ]
  })

  const { data, loading, error } = useQuery<{ getDashboard: Dashboard }>(GET_DASHBOARD)

  const containerRef = useRef(null);
  const [show, setShow] = useState(false)
  const form = useForm<FormValues>()

  const usedWatchlists = useMemo(() => {
    const set = new Set()

    if (data?.getDashboard?.watchlists?.length) {
      data.getDashboard.watchlists.forEach((wl) => {
        if (wl?.symbols?.includes(symbolObj.symbol)) {
          set.add(wl._id)
        }
      })
    }


    return set
  }, [data, symbolObj])

  const change = useCallback(
    (watchlist: string, add: boolean) => () => {
      changeSymbolFlag({
        variables: {
          symbol: symbolObj.symbol,
          watchlist,
          add
        }
      })
    },
    [symbolObj]
  )

  const toggleShow = useCallback(() => {
    setShow(!show)
  }, [show])

  const hide = useCallback(()=>{
    setShow(false)
  }, [setShow])

  useEffect(()=>{
    if(show){
      window.addEventListener("mousedown", hide)
    }
    else{
      window.removeEventListener("mousedown", hide)
    }
  }, [show, hide])

  const save = useCallback(() => {
    const { newWatchlist } = form.getValues()
    if (newWatchlist) {
      changeSymbolFlag({
        variables: {
          symbol: symbolObj.symbol,
          watchlist: newWatchlist,
          add: true
        }
      })
    }
    setShow(false)
  }, [form, symbolObj])

  const remove = useCallback(() => {
    removeSymbol({
      variables: {
        symbol: symbolObj.symbol
      }
    })
  }, [removeSymbol, symbolObj])

  const isChecked = useCallback((watchlistId: string) => usedWatchlists.has(watchlistId), [usedWatchlists])

  const containerClick = useCallback((event)=>{
    event.preventDefault()
    event.stopPropagation()
  },[])

  return (
    <div className={styles.flags}>
      <IconButton onClick={toggleShow}>
        <PlaylistAddCheckIcon style={{ color: grey[500] }} />
      </IconButton>
      {show && (
        <>
          <div className={styles.floatingContainer} ref={containerRef} onMouseDown={containerClick}>
            <Box p={3} border={1} borderColor={grey[300]}>
              <table>
                <tbody>
                  {data?.getDashboard?.watchlists?.map((wl) => (
                    <tr key={wl?.name}>
                      <td>{wl?.name}</td>
                      <td>
                        <Checkbox
                          checked={isChecked(wl?._id)}
                          name={wl?.name}
                          color="primary"
                          onChange={change(wl?.name || '', !isChecked(wl?._id))}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <Input form={form} name="newWatchlist" placeholder="New watchlist" />
                    </td>
                    <td>
                      <IconButton onClick={save}>
                        <SaveIcon color="primary" />
                      </IconButton>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span>Complete remove:</span>
                    </td>
                    <td>
                      <IconButton onClick={remove}>
                        <SkullIcon />
                      </IconButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </div>
        </>
      )}
    </div>
  )
}
