
/* This module imports */

import 'dotenv/config'
import './globals'
import logger from './logger'
import express from 'express'
import graphqlHTTP from 'express-graphql'
import schema from './schema/schema'
import mongoose from 'mongoose'
import checkJwt from './auth/jwt'
import wrongPreshared from './errors/notAllowed.json'
import cors from 'cors'

require('dotenv').config()

const app = express()

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
  mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true })

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

