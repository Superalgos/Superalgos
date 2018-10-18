import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import graphqlHTTP from 'express-graphql'
import 'dotenv/config'
import expressPlayground from 'graphql-playground-middleware-express'

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
