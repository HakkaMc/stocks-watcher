import { AxiosError, AxiosResponse } from 'axios'
import { axiosInstance } from '../api/axios'
import { LOGOUT_ENDPOINT, REFRESH_AUTH_ENDPOINT } from '../constants'
import { store, actions } from '../redux'

let timerRef: ReturnType<typeof setTimeout>

type ResponseData = {
  accessToken: string
  accessTokenExpiration: number
}

export const refreshSession = () =>
  new Promise<void>((resolve, reject) => {
    const refreshToken = window?.localStorage?.getItem('refreshToken')

    if (refreshToken) {
      axiosInstance
        .post(REFRESH_AUTH_ENDPOINT, {
          refreshToken
        })
        .then(
          (response: AxiosResponse<ResponseData>) => {
            window.localStorage.setItem('accessToken', response.data.accessToken)
            window.localStorage.setItem('accessTokenExpiration', response.data.accessTokenExpiration.toString())
            resolve()
          },
          (error: AxiosError) => {
            if (error.response?.status === 401) {
              // TODO - do it better
              console.log('Unathorized')

              return reject(new Error('UNAUTHORIZED'))
            }

            return reject(new Error('ERROR'))
          }
        )
    } else {
      reject()
    }
  })

const getDelay = () => {
  const accessTokenExpiration = parseInt(window?.localStorage?.getItem('accessTokenExpiration') as string, 10)

  const delay = accessTokenExpiration - Date.now() - 5 * 60 * 1000

  // TODO - debugging session refresh
  return delay / 2
}

export const restartSessionTimer = () => {
  clearTimeout(timerRef)

  let delay = getDelay()

  console.log('Refresh session in ', delay / 1000 / 60, ' minutes')

  timerRef = setTimeout(() => {
    refreshSession().then(
      () => {
        delay = getDelay()
        timerRef = setTimeout(restartSessionTimer, delay)
      },
      () => {
        store.dispatch(actions.user.setAuthorized(false))
      }
    )
  }, delay)
}

export const stopSessionTimer = () => clearTimeout(timerRef)

const clearStorage = () => {
  window.localStorage.removeItem('accessToken')
  window.localStorage.removeItem('refreshToken')
  window.localStorage.removeItem('accessTokenExpiration')
}

export const logout = () => {
  axiosInstance.get(LOGOUT_ENDPOINT)

  clearStorage()

  //  window.location.href = '/'

  window.location.reload()
}
