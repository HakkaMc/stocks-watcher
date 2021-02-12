import { AxiosResponse } from 'axios'
import { axiosInstance } from '../api/axios'
import {LOGOUT_ENDPOINT, REFRESH_AUTH_ENDPOINT} from '../constants'

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
          () => {
            reject()
          }
        )
    } else {
      reject()
    }
  })

export const restartSessionTimer = () => {
  clearTimeout(timerRef)

  const accessTokenExpiration = parseInt(window?.sessionStorage?.getItem('accessTokenExpiration') as string, 10)

  const delay = accessTokenExpiration - Date.now()

  timerRef = setTimeout(refreshSession, delay)
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
