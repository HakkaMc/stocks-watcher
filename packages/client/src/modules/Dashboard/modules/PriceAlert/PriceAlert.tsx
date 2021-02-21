import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, IconButton } from '@material-ui/core'
import { useForm } from 'react-hook-form'
import { grey } from '@material-ui/core/colors'
import { useMutation, useLazyQuery } from '@apollo/client'
import {PriceAlert as PriceAlertType} from '@sw/shared/src/graphql'
import { NotificationsIcon, CloseIcon, SaveIcon } from '../../../../utils/icons'
import styles from './styles.module.scss'
import { Input } from '../../../../form'
import {GET_PRICE_ALERTS, SET_PRICE_ALERT, REMOVE_PRICE_ALERT} from '../../../../gqls'

type FormValues = {
    targetPrice: string
}

type Props = {
    symbol: string
}

export const PriceAlert = ({symbol}: Props) => {
  const containerRef = useRef(null)
  const [show, setShow] = useState(false)
  const form = useForm<FormValues>()

    const [getPriceAlerts, priceAlertsResponse] = useLazyQuery<{getPriceAlerts: Array<PriceAlertType>}>(GET_PRICE_ALERTS)
    const [savePriceAlert] = useMutation(SET_PRICE_ALERT, {
        refetchQueries: [
            {
                query: GET_PRICE_ALERTS,
                variables: {
                    symbol
                }
            }
        ]
    })
    const [removePriceAlert] = useMutation(REMOVE_PRICE_ALERT, {
        refetchQueries: [
            {
                query: GET_PRICE_ALERTS,
                variables: {
                    symbol
                }
            }
        ]
    })

    useEffect(()=>{
        if(show){
            getPriceAlerts({variables:{
                    symbol
                }})
        }
    }, [show, getPriceAlerts])

  const toggleShow = useCallback(() => {
    setShow(!show)
  }, [show])

  const hide = useCallback(() => {
    setShow(false)
  }, [setShow])

  useEffect(() => {
    if (show) {
      window.addEventListener('mousedown', hide)
    } else {
      window.removeEventListener('mousedown', hide)
    }
  }, [show, hide])

  const preventClick = useCallback((event) => {
    event.stopPropagation()
  }, [])

  const save = useCallback(() => {
      const { targetPrice } = form.getValues()

      if(targetPrice) {
          hide()
          savePriceAlert({
              variables: {
                  symbol,
                  targetPrice: parseFloat(targetPrice)
              }
          })
      }
  }, [savePriceAlert, hide])

  const remove = useCallback((priceAlertId: string) => () => {
      if(priceAlertId){
          hide()
          removePriceAlert({variables: {id: priceAlertId}})
      }
  }, [removePriceAlert])

  return (
    <div className={styles.flags}>
      <IconButton onClick={toggleShow}>
        <NotificationsIcon style={{ color: grey[500] }} />
      </IconButton>
      {show && (
        <>
          <div className={styles.floatingContainer} ref={containerRef} onMouseDown={preventClick}>
            <Box p={3} border={1} borderColor={grey[300]}>
              <table>
                <tbody>
                  {priceAlertsResponse.data?.getPriceAlerts.map((pa) => (
                    <tr key={`${pa.actualPrice}_${pa.targetPrice}`}>
                      <td>{pa?.targetPrice}</td>
                      <td>
                        <IconButton onClick={remove(pa?._id)}>
                          <CloseIcon color="primary" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <Input form={form} name="targetPrice" placeholder="Target price"/>
                    </td>
                    <td>
                      <IconButton onClick={save}>
                        <SaveIcon color="primary" />
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
