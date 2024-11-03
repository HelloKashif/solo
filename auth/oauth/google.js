import axios from 'axios'
import { OAuth2Client } from 'google-auth-library'
import queryString from 'query-string'
import cfg from '../config/index.js'

function getGoogleLoginUrl(redirectUri, restrictDomain = null) {
  const payload = {
    client_id: cfg.auth.google.clientId,
    redirect_uri: redirectUri,
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '), // space seperated string
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  }
  if (restrictDomain) payload.hd = restrictDomain

  const stringifiedParams = queryString.stringify(payload)

  const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
  return googleLoginUrl
}

async function getGoogleUser(accessToken, idToken) {
  const payload = {
    method: 'GET',
    url: `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
    headers: { Authorization: `Bearer ${idToken}` },
  }
  const { data } = await axios(payload)
  return data
}

async function getAccessTokenFromCode(code, redirectUri) {
  const payload = {
    url: `https://oauth2.googleapis.com/token`,
    method: 'post',
    data: {
      client_id: cfg.auth.google.clientId,
      client_secret: cfg.auth.google.clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code,
    },
  }
  const { data } = await axios(payload)
  return data
}

async function verifyIdToken(idToken) {
  const client = new OAuth2Client(
    cfg.auth.google.clientId,
    cfg.auth.google.clientSecret,
  )
  const ticket = await client.verifyIdToken({
    idToken,
    audience: cfg.auth.google.clientId,
  })
  return ticket.getPayload()
}

export {
  verifyIdToken,
  getAccessTokenFromCode,
  getGoogleLoginUrl,
  getGoogleUser,
}
