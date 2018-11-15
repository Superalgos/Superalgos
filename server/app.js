
/* This module imports */

require('dotenv/config')
import logger from './config/logger'
const globals = require('./globals')
const sessions = require('./sessions')
const express = require('express')
const graphqlHTTP = require('express-graphql')
const schema = require('./schema/schema')
const mongoose = require('mongoose')
const mongodbConfig = require('./models/MongoDB')
const checkJwt = require('./auth/middleware/jwt')

const cors = require('cors')

const app = express()

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

app.post('/graphql', graphqlHTTP({
  schema,
  graphiql: false,
  context: req => ({ ...req })
}))

app.post('/graphql', checkJwt, (err, req, res, next) => {
  console.log(req)
  if (err) return res.status(401).send(`[Authenticate Token Error] ${err.message}`)
  next()
})

app.listen(4000, () => {
  console.log('Now listening for requests on port 4000')
})
