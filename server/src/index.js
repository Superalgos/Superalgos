import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { ApolloServer, ForbiddenError } from 'apollo-server-express'
import { mergeSchemas } from 'graphql-tools'
import jwt from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import axios from 'axios'

import { createTransformedRemoteSchema } from './createRemoteSchema'
import { teams, events } from './links'

import logger from './logger'

async function getUserId (authId) {
  try {
    if(authId === process.env.AACLOUD_ID){
      return authId
    }

    const userData = await axios({
      url: process.env.USERS_API_URL,
      method: 'post',
      headers: {
        preshared: process.env.USERS_API_PRESHARED
      },
      data: {
        query: `
        {
          userByAuthId(authId: "${authId}")
          {
            id
          }
        }
        `
      }
    })
    return userData.data.data.userByAuthId.id
  } catch (error) {
    return (error)
  }
}

async function run () {
  const transformedKeyVaultSchema = await createTransformedRemoteSchema(
    'keyVault_',
    process.env.KEYVAULT_API_URL,
    process.env.KEYVAULT_API_PRESHARED)
  const transformedTeamsSchema = await createTransformedRemoteSchema(
    'teams_',
    process.env.TEAMS_API_URL,
    process.env.TEAMS_API_PRESHARED)
  const transformedUsersSchema = await createTransformedRemoteSchema(
    'users_',
    process.env.USERS_API_URL,
    process.env.USERS_API_PRESHARED)
  const transformedEventsSchema = await createTransformedRemoteSchema(
    'events_',
    process.env.EVENTS_API_URL,
    process.env.EVENTS_API_PRESHARED)
  const transformedFinancialBeingsSchema = await createTransformedRemoteSchema(
    'financialBeings_',
    process.env.FINANCIAL_BEINGS_API_URL,
    process.env.FINANCIAL_BEINGS_API_PRESHARED)
  const transformedOperationsSchema = await createTransformedRemoteSchema(
    'operations_',
    process.env.OPERATIONS_API_URL,
    process.env.OPERATIONS_API_PRESHARED)
  const transformedNotificationsSchema = await createTransformedRemoteSchema(
    'notifications_',
    process.env.NOTIFICATIONS_API_URL,
    process.env.NOTIFICATIONS_API_PRESHARED)

  var schemas = []
  var resolvers = {}

  if (transformedTeamsSchema) {
    schemas.push(transformedTeamsSchema)
    if (transformedUsersSchema) {
      schemas.push(teams.linkSchemaDefs)
      resolvers = Object.assign(resolvers, teams.resolver(transformedUsersSchema))
    }
  }
  if (transformedUsersSchema) {
    schemas.push(transformedUsersSchema)
  }
  if (transformedEventsSchema) {
    schemas.push(transformedEventsSchema)
    if (transformedUsersSchema && transformedTeamsSchema) {
      schemas.push(events.linkSchemaDefs)
      resolvers = Object.assign(resolvers, events.resolver(transformedUsersSchema, transformedTeamsSchema))
    }
  }
  if (transformedKeyVaultSchema) {
    schemas.push(transformedKeyVaultSchema)
  }
  if (transformedFinancialBeingsSchema) {
    schemas.push(transformedFinancialBeingsSchema)
  }
  if (transformedOperationsSchema) {
    schemas.push(transformedOperationsSchema)
  }
  if (transformedNotificationsSchema) {
    schemas.push(transformedNotificationsSchema)
  }

  const schema = mergeSchemas({
    schemas,
    resolvers
  })

  const app = express()

  app.use('/graphql',
    jwt({
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 1,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
      }),
      credentialsRequired: false,
      audience: process.env.AUTH0_AUDIENCE,
      issuer: process.env.AUTH0_ISSUER,
      algorithms: [`RS256`]
    }),
    function (err, req, res, next) {
      if (err.code === 'invalid_token') {
        res.locals.error = err.message
      }
      return next()
    }
  )

  app.use('/graphql', (req, res, next) => {
    res.locals.userId = ''
    if (req.user) {
      getUserId(req.user.sub)
        .then(data => {
          res.locals.userId = data
          next()
        })
        .catch(err => {
          console.log(err)
          next()
        })
    } else {
      next()
    }
  })

  const context = ({ req, res }) => {
    if (res.locals.error) {
      throw new ForbiddenError(res.locals.error)
    }
    const response = {
      headers: Object.assign(
        res.locals.userId ? { userId: res.locals.userId } : {},
        req.headers.authorization ? { authorization: req.headers.authorization } : {}
      )
    }
    return response
  }

  const server = new ApolloServer({
    schema,
    context,
    formatError: error => {
      logger.error('An error ocurred inside a module: %s', error.message)
      return error.message
    },
    formatResponse: response => {
      logger.debug('Response from Apollo Server: ' + response)
      return response
    },
    playground: {
      settings: {
        'editor.theme': 'dark',
        'editor.cursorShape': 'line'
      }
    }
  })

  server.applyMiddleware({ app, cors: { origin: true, credentials: true, methods:'GET,PUT,POST,DELETE,OPTIONS'}})

  app.listen(4100)
  logger.info(`Server running. Open ${process.env.GRAPHQL_API_URL} to run queries.`)
}

try {
  run()
} catch (e) {
  logger.error(`An general error occured while running the app: ${e}, details: ${e.message}, stack: ${e.stack}`)
}
