import { AxiosError, AxiosResponse } from 'axios'
import { axiosInstance } from '../api/axios'
import { LOGOUT_ENDPOINT, REFRESH_AUTH_ENDPOINT } from '../constants'
import {store, actions} from "../redux";

let timerRef: ReturnType<typeof setTimeout>

type ResponseData = {
  accessToken: string
  accessTokenExpiration: number
}

export const refreshSession = () =>
  new Promise<void>((resolve, reject) => {
    const refreshToken = window?.sessionStorage?.getItem('refreshToken')

    if (refreshToken) {
      axiosInstance
        .post(REFRESH_AUTH_ENDPOINT, {
          refreshToken
        })
        .then(
          (response: AxiosResponse<ResponseData>) => {
            window.sessionStorage.setItem('accessToken', response.data.accessToken)
            window.sessionStorage.setItem('accessTokenExpiration', response.data.accessTokenExpiration.toString())
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
  const accessTokenExpiration = parseInt(window?.sessionStorage?.getItem('accessTokenExpiration') as string, 10)

  return accessTokenExpiration - Date.now() - 5 * 60 * 1000
}

export const restartSessionTimer = () => {
  clearTimeout(timerRef)

  let delay = getDelay()

  console.log('Refresh session in ', delay / 1000 / 60, ' minutes')

  timerRef = setTimeout(()=>{
      refreshSession().then(()=>{
          delay = getDelay()
          timerRef = setTimeout(restartSessionTimer, delay)
      }, ()=>{
          store.dispatch(actions.user.setAuthorized(false))
      })
  }, delay)
}

export const stopSessionTimer = () => clearTimeout(timerRef)

const clearStorage = () => {
  window.sessionStorage.removeItem('accessToken')
  window.sessionStorage.removeItem('refreshToken')
  window.sessionStorage.removeItem('accessTokenExpiration')
}

export const logout = () => {
  axiosInstance.get(LOGOUT_ENDPOINT)

  clearStorage()

  //  window.location.href = '/'

  window.location.reload()
}
