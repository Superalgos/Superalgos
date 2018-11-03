
/* This module imports */

const globals = require('./globals')
const sessions = require('./sessions')
const express = require('express')
const graphqlHTTP = require('express-graphql')
const schema = require('./schema/schema')
const mongoose = require('mongoose')
const mongodbConfig = require('./models/MongoDB')
const checkJwt = require('./auth/middleware/jwt')
const logger = require('./utils/logger')
const wrongPreshared = require('./errors/notAllowed.json')
const cors = require('cors')

require('dotenv').config()

const app = express()

// Checking preshared key
app.post('/graphql', (req, res, next) => {
  if (req.headers.preshared === process.env.PRESHARED_GATEWAY_KEY) {
    next()
  } else {
    res.send(wrongPreshared)
  }
})

// Allow crosss-origin requests
app.use(cors())

// Connect to the database
mongoose.connect(mongodbConfig.connectionString, { useNewUrlParser: true })
mongoose.connection.once('open', () => {
  logger.info('Connected to Mongo')
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
