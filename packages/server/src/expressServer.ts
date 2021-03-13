import express from 'express'
import expressSession from 'express-session'
import bodyParser from 'body-parser'
import connectMongo from 'connect-mongo'
import mongoose from 'mongoose'
import cors from 'cors'
import { createServer as createHttpServer } from 'http'
import { DashboardTsModel } from './database/dashboard/schema'
import { UserTsModel } from './database/user/schema'
import { getGoogleAuthURL, getRefreshedToken, getUserInfo } from './googleAuth'

const MongoStore = connectMongo(expressSession)

export const expressServer = express()
export const httpServer = createHttpServer(expressServer)

export const session = expressSession({
  name: 'API_SESSION_ID',
  secret: 'stocks-watcher', // TODO - better secret code
  resave: true,
  saveUninitialized: false,
  cookie: {
    path: '/',
    secure: false,
    sameSite: false,
    httpOnly: false,
    maxAge: undefined
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
})

console.log('Init expressSession')
expressServer.use(session)

expressServer.use('/graphql', bodyParser.json())
// expressServer.use('/graphql', bodyParser.json())
expressServer.use('/auth/refresh', bodyParser.json())

// expressServer.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

// expressServer.use(function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*')
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
//     next()
// })
// expressServer.use(cors({
//     origin: "https://localhost:4001",
//     credentials: true
// }))

expressServer.get('/auth/google/login', (req, res) => {
  console.log('login session id: ', req.session.id)
  res.redirect(getGoogleAuthURL())
})

expressServer.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query
  const userInfo = await getUserInfo(code as string)

  console.log('callback session id: ', req.session.id)

  const userData = {
    email: userInfo.email,
    accessToken: userInfo.accessToken,
    refreshToken: userInfo.refreshToken,
    accessTokenExpiration: userInfo.accessTokenExpiration
  }

  const user = await UserTsModel.findOne({ email: userInfo.email })
  if (!user) {
    const newUser = new UserTsModel({
      name: userInfo.email,
      ...userData
    })
    await newUser.save()

    const flagId = mongoose.Types.ObjectId()

    await new DashboardTsModel({
      user: newUser._id,
      watchedSymbols: [],
      flags: [{ name: 'Default', _id: flagId }]
    }).save()

    req.session.userId = newUser._id
  } else {
    await UserTsModel.updateOne({ _id: user._id }, userData)
    req.session.userId = user._id
  }



  req.session.cookie.expires = new Date(userInfo.accessTokenExpiration)
  req.session.cookie.maxAge = userInfo.accessTokenExpiration - Date.now()

  console.log('userId ', req.session.userId, ' saved', req.session.cookie.expires, req.session.cookie.maxAge)

  res.redirect(
    `https://localhost:4001/auth/success?accessToken=${userInfo.accessToken}&refreshToken=${userInfo.refreshToken}&accessTokenExpiration=${userInfo.accessTokenExpiration}`
  )
})

expressServer.post('/auth/refresh', async (req, res) => {
  const accessToken = (req.headers.authorization||'').replace('Bearer ', '')
  const { refreshToken } = req.body
  const { userId } = req.session

  console.log('============================================')
  console.log('refresh: ', refreshToken, accessToken, userId)

  if(!userId || !accessToken || !refreshToken){
    console.log('Refresh session failed')

    if(!userId) console.log('Missing userId')
    if(!accessToken) console.log('Missing accessToken')
    if(!refreshToken) console.log('Missing refreshToken')

    res.status(401).send()
  }
  else {
    const user = await UserTsModel.findOne({_id: userId, accessToken, refreshToken})

    if (user) {
      // Prevent nonsense token refresh
      if ((user.accessTokenExpiration || 0) - Date.now() > 30 * 60 * 1000) {
        res.status(200).send({
          accessToken,
          accessTokenExpiration: user.accessTokenExpiration
        })
      } else {
        const token = await getRefreshedToken(refreshToken)

        await UserTsModel.updateOne(
            {_id: user._id},
            {accessToken: token.accessToken, accessTokenExpiration: token.accessTokenExpiration}
        )

        req.session.cookie.expires = new Date(token.accessTokenExpiration)
        req.session.cookie.maxAge = token.accessTokenExpiration - Date.now()

        res.status(200).send({
          accessToken: token.accessToken,
          accessTokenExpiration: token.accessTokenExpiration
        })
      }
    } else {
      res.status(401).send()
    }
  }
})

expressServer.get('/auth/check', (req, res) => {
  console.log('check: ', req.session.id, req.session.userId)
  res.send()
})

expressServer.get('/auth/logout', async (req, res) => {
  // console.log('logout: ', req.session.userId)

  await UserTsModel.updateOne(
    { _id: req.session.userId },
    { resfreshToken: '', accessToken: '', accessTokenExpiration: 0 }
  )
  req.session.destroy()
  res.clearCookie('API_SESSION_ID')
  res.send()
})
