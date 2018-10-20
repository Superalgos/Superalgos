import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import mongoose from 'mongoose'
import graphqlHTTP from 'express-graphql'
import expressPlayground from 'graphql-playground-middleware-express'
import jwt from 'express-jwt'
import jwksRsa from 'jwks-rsa'

import schema from './schema'

// Initialise express
const app = express()

// Allow cross origing request
app.use(cors())
/* -------------------------------------------------
---------------- Database setup --------------------
------------------------------------------------- */
// Database Connection
mongoose.connect(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_DOMAIN}`, { useNewUrlParser: true })

// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise

// Get the default connection
var db = mongoose.connection

// bind error and success to console log
db.on('error', () => { console.error.bind(console, 'MongoDB connection error:') })
db.once('open', () => { console.log('Connected to the DB.') })

/* -------------------------------------------------
------------- Authentification setup ---------------
------------------------------------------------- */

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
  function (req, res, next) {
    return next()
  }
)

/* -------------------------------------------------
----------------- Graphql setup --------------------
------------------------------------------------- */
app.use('/graphql', graphqlHTTP(req => {
  return {
    schema: schema,
    context: { user: req.user }
  }
}))
app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`)
})
