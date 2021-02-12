import axios from 'axios'

import { API_PREFIX } from '../constants'

export const axiosInstance = axios.create({
  baseURL: API_PREFIX,
  timeout: 10000,
  headers: {}
})

axiosInstance.interceptors.request.use((request) => {
  const accessToken = window.sessionStorage.getItem('accessToken')

  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`
  }

  return request
})
