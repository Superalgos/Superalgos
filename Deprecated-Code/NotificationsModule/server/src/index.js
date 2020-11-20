import '@babel/polyfill'
require('dotenv').config();
import express from 'express'
import createApolloServer from './ApolloServer'
import { formatError } from './errors'
import { makeExecutableSchema } from 'graphql-tools'
import { importSchema } from 'graphql-import'

import { resolvers } from './graphql/resolvers'

import logger from './logger'

import wrongPreshared from './errors/notAllowed.json'

const GRAPHQL_ENDPOINT = '/graphql'
const GRAPHQL_SUBSCRIPTIONS = '/graphql'
const PORT = process.env.PORT
const NODE_ENV = 'development'

const app = express()

app.post(GRAPHQL_ENDPOINT, (req, res, next) => {
  if (req.headers.preshared === process.env.PRESHARED_GATEWAY_KEY) {
    next();
  } else {
    res.send(wrongPreshared);
  }
});

app.post(GRAPHQL_ENDPOINT)

const corsOptions = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}

const options = {
  port: PORT,
  cors: corsOptions,
  endpoint: '/graphql',
  subscriptions: '/graphql'
}

let server
try {
  server = createApolloServer(app, {
    graphqlEndpoint: GRAPHQL_ENDPOINT,
    subscriptionsEndpoint: GRAPHQL_SUBSCRIPTIONS,
    apolloServerOptions: { formatError },
    typeDefs: importSchema('src/graphql/schema.graphql'),
    resolvers,
    resolverValidationOptions: { requireResolversForResolveType: false },
    context: req  => ({
      ...req ,
      token: req.headers ? req.headers : undefined,
      user: req.user ? req.user : undefined,
      userId: (req.headers && req.headers.userid) ? req.headers.userid : undefined
    })
  })
} catch (err) {
  logger.error('Create Apollo Server Error: ')
  logger.error(err)
}

server.listen({ port: PORT }, () => {
  logger.info(
    `🚀 GraphQL Server is running on http://localhost:${PORT}${GRAPHQL_ENDPOINT} in "${NODE_ENV}" mode\n`
  )
})
