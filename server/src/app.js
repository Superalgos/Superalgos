import express from 'express'
import 'dotenv/config'
import graphqlHTTP from 'express-graphql'
import schema from './schema'
import mongoose from 'mongoose'
import cors from 'cors'
import logger from './config/logger'
import wrongPreshared from './errors/notAllowed.json'

const app = express()

app.post('/graphql', (req, res, next) => {
  if (req.headers.preshared === process.env.OPERATIONS_API_PRESHARED) {
    next()
  } else {
    res.send(wrongPreshared)
  }
})

// Allow cross origing request
app.use(cors())

// Database Connection
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true })

mongoose.connection.once('open', () => {
  logger.info('Connected to the DB.')
})

app.use('/graphql', graphqlHTTP(req => {
  return {
    schema: schema,
    context: {
      userId: req.headers.userid,
      authorization: req.headers.authorization
    },
    graphiql: true
  }
}))

app.listen(process.env.PORT, () => {
  logger.info(`Listening on port ${process.env.PORT}.`)
})
