import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import graphqlHTTP from 'express-graphql';
import expressPlayground from 'graphql-playground-middleware-express';
import * as Sentry from '@sentry/node';
import schema from './schema';

const app = express();

// Initialising sentry
Sentry.init({ dsn: process.env.SENTRY_DNS });
app.use(Sentry.Handlers.requestHandler());

// authorising CORS
app.use(cors());

// Starting the graphql server
app.use('/graphql', graphqlHTTP(req => ({
  schema,
  context: {
    userId: req.headers.userid,
    authorization: req.headers.authorization,
  },
  formatError(err) {
    return {
      message: err.message,
      code: err.originalError && err.originalError.code,
      path: err.path,
    };
  },
})));

// Starting the graphql server
app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

// Sentry error handling middleware if anything pass through
app.use(Sentry.Handlers.errorHandler());

export default app;
