import React, { useCallback, useEffect, useState } from 'react'
import { Box, Paper, Button, Typography } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'

import styles from './styles.module.scss'
import { appLazyPreload, chartGroupViewPreload } from '../lazy'
import { API_PREFIX, LOGIN_ENDPOINT } from '../../constants'
import { refreshSession, restartSessionTimer } from '../../utils/session'
import { ScreenLoader } from '../../components'

let windowReference: any

type Props = {
  setAuthorized: (authorized: boolean) => void
}

export const Login = ({ setAuthorized }: Props) => {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check the user is still logged-in
    refreshSession().then(
      () => {
        setAuthorized(true)
        restartSessionTimer()
      },
      () => {
        setChecking(false)
      }
    )
  }, [])

  const messageReceived = useCallback(
    (event) => {
      if (event.data?.name === 'LOGIN_DONE') {
        window.removeEventListener('message', messageReceived)

        const accessToken = event.data?.accessToken
        const refreshToken = event.data?.refreshToken
        const accessTokenExpiration = event.data?.accessTokenExpiration

        window.sessionStorage.setItem('accessToken', accessToken)
        window.sessionStorage.setItem('refreshToken', refreshToken)
        window.sessionStorage.setItem('accessTokenExpiration', accessTokenExpiration)

        setAuthorized(true)
        restartSessionTimer()
      }
    },
    [setAuthorized]
  )

  const loginWithGoogle = useCallback(() => {
    window.addEventListener('message', messageReceived, false)

    windowReference = window.open(
      `${API_PREFIX}${LOGIN_ENDPOINT}`,
      'Google login',
      'toolbar=no, menubar=no, width=600, height=700, top=100, left=100'
    )
    windowReference.focus()

    appLazyPreload()
    chartGroupViewPreload()

    return () => {
      window.removeEventListener('message', messageReceived)
    }
  }, [])

  return (
    <>
      {checking && <ScreenLoader />}
      <Box className={styles.container} bgcolor={grey}>
        <Box m={2} p={3}>
          <Paper elevation={3} className={styles.paper}>
            <Box p={3}>
              {!checking && (
                <div>
                  <Box p={3}>
                    <Typography variant="h4">Login</Typography>
                  </Box>
                  <Button onClick={loginWithGoogle}>Login with Google</Button>
                </div>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  )
}
