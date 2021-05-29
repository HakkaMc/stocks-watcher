import { google } from 'googleapis'

import axios from 'axios'
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from './constants'

type GoogleUser = {
  id: string
  email: string
  verified_email: boolean
  picture: string
}

type UserInfo = {
  email: string
  accessToken: string
  refreshToken: string
  accessTokenExpiration: number
}

type RefreshedToken = {
  accessToken: string
  accessTokenExpiration: number
}

class MyOauthClient extends google.auth.OAuth2 {
  constructor() {
    super(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, `http://localhost:${process.env.port}/auth/google/callback`)
  }

  getGoogleAuthURL = () => {
    const scopes = ['https://www.googleapis.com/auth/userinfo.email']

    return this.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes // If you only need one scope you can pass it as string
    })
  }

  // TODO - implement exception state
  getUserInfo = async (code: string): Promise<UserInfo> => {
    const { tokens } = await this.getToken(code)

    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.id_token}`
        }
      }
    )

    const user: GoogleUser = response?.data || {}

    return {
      email: user.email,
      accessToken: tokens.access_token || '',
      refreshToken: tokens.refresh_token || '',
      accessTokenExpiration: tokens.expiry_date || 0
    }
  }

  // TODO - implement exception state
  getRefreshedToken = async (refreshToken: string): Promise<RefreshedToken> => {
    const { tokens, res } = await this.refreshTokenNoCache(refreshToken)
    // console.log('resfreshed tokens: ', tokens)

    return {
      accessToken: tokens.access_token || '',
      accessTokenExpiration: tokens.expiry_date || 0
    }
  }
}

const oAuth2Client = new MyOauthClient()

export const { getGoogleAuthURL } = oAuth2Client
export const { getUserInfo } = oAuth2Client
export const { getRefreshedToken } = oAuth2Client
