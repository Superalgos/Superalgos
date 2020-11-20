export const AUTH_CONFIG = {
  api_audience: process.env.AUTH0_AUDIENCE,
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENTID,
  callbackUrl: process.env.AUTH0_CALLBACK_URL,
  logoutUrl: process.env.AUTH0_LOGOUT_URL
}
