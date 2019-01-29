import 'dotenv/config'

const env = []

env.push({
  "name": "PLATFORM_ENVIRONMENT",
  "value": process.env.PLATFORM_ENVIRONMENT
})

env.push({
  "name": "GATEWAY_ENDPOINT",
  "value": process.env.GATEWAY_ENDPOINT
})

env.push({
  "name": "STORAGE_BASE_URL",
  "value": process.env.STORAGE_BASE_URL
})

env.push({
  "name": "STORAGE_CONNECTION_STRING",
  "value": process.env.STORAGE_CONNECTION_STRING
})

env.push({
  "name": "AUTH_URL",
  "value": process.env.AUTH_URL
})

env.push({
  "name": "AUTH_CLIENT_ID",
  "value": process.env.AUTH_CLIENT_ID
})

env.push({
  "name": "AUTH_CLIENT_SECRET",
  "value": process.env.AUTH_CLIENT_SECRET
})

env.push({
  "name": "AUTH_AUDIENCE",
  "value": process.env.AUTH_AUDIENCE
})

export default env
