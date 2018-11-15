
/* This module imports */

require('dotenv/config')
import logger from './logger'
const globals = require('./globals')
const sessions = require('./sessions')
const express = require('express')
const graphqlHTTP = require('express-graphql')
const schema = require('./schema/schema')
const mongoose = require('mongoose')
const checkJwt = require('./auth/middleware/jwt')
const wrongPreshared = require('./errors/notAllowed.json')
const cors = require('cors')

require('dotenv').config()

const app = express()

try {
  // Checking preshared key
  app.post('/graphql', (req, res, next) => {
    if (req.headers.preshared === process.env.USERS_API_PRESHARED) {
      next()
    } else {
      logger.error('Wrong Pre-Shared Received', req.headers.preshared)
      res.send(wrongPreshared)
    }
  })

  // Allow crosss-origin requests
  app.use(cors())

  // Database Connection
  mongoose.connect(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_DOMAIN}`, { useNewUrlParser: true })

  mongoose.connection.once('open', () => {
    logger.info('Connected to the DB.')
  })

  /* Here we bind all requests to this endpoint to be procecced by the GraphQL Library. */

  app.get('/graphql', graphqlHTTP({
    schema,
    graphiql: true
  }))

  app.post('/graphql', graphqlHTTP(req => {
    return {
      schema,
      graphiql: false,
      context: {
        user: req.user,
        userId: req.headers.userid
      }
    }
  }))

  app.post('/graphql', checkJwt, (err, req, res, next) => {
    if (err) return res.status(401).send(`[Authenticate Token Error] ${err.message}`)
    next()
  })

  app.listen(4000, () => {
    logger.info('Now listening for requests on port 4000')
  })
} catch (err) {
  logger.error('Server Error', err)
}

