import React, { useEffect } from 'react'
import { parse } from 'query-string'
import { Box } from '@material-ui/core'

export const LoginDone = () => {
  useEffect(() => {
    if (window.opener) {
      const params = parse(window.location.search)

      window.opener.postMessage(
        {
          name: 'LOGIN_DONE',
          accessToken: params.accessToken,
          refreshToken: params.refreshToken,
          accessTokenExpiration: params.accessTokenExpiration
        },
        '*'
      )
    }
    window.close()
  }, [])

  return <Box p={5}>Login successfull. Loding app....</Box>
}
