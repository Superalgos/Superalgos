/* eslint-disable no-console */
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import mongoose from 'mongoose';
import graphqlHTTP from 'express-graphql';
import expressPlayground from 'graphql-playground-middleware-express';
import * as Sentry from '@sentry/node';

import schema from './schema';

// Initialise express
const app = express();

// Initialising sentry
Sentry.init({ dsn: process.env.SENTRY_DNS });
app.use(Sentry.Handlers.requestHandler());

// Allow cross origing request
app.use(cors());
/* -------------------------------------------------
---------------- Database setup --------------------
------------------------------------------------- */
// Database Connection
mongoose.connect(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_DOMAIN}`, { useNewUrlParser: true });

// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;

// Get the default connection
const db = mongoose.connection;

// bind error and success to console log
db.on('error', () => { console.error.bind(console, 'MongoDB connection error:'); });
db.once('open', () => { console.log('Connected to the DB.'); });

/* -------------------------------------------------
----------------- Graphql setup --------------------
------------------------------------------------- */
app.use('/graphql', graphqlHTTP(req => ({
  schema,
  context: {
    userId: req.headers.userid,
    authorization: req.headers.authorization,
  },
})));
app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

// Sentry error handling middleware
app.use(Sentry.Handlers.errorHandler());

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
