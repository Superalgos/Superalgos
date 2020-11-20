import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import * as Sentry from '@sentry/node';
import schema from './schema';
import wrongPreshared from './errors/notAllowed.json';

const app = express();

// Initialising sentry
Sentry.init({ dsn: process.env.SENTRY_DNS });
app.use(Sentry.Handlers.requestHandler());

app.post('/graphql', (req, res, next) => {
  if (req.headers.preshared === process.env.PRESHARED_GATEWAY_KEY) {
    next();
  } else {
    res.send(wrongPreshared);
  }
});


// Starting the graphql server
const server = new ApolloServer({
  schema,
  playground: {
    settings: {
      'editor.theme': 'dark',
      'editor.cursorShape': 'line',
    },
  },
  context: ({ req }) => ({
    userId: req.headers.userid,
    authorization: req.headers.authorization,
  }),
  formatError: error => ({
    code: error.extensions.exception.code,
    message: error.message,
    path: error.path,
  }),
  introspection: true,
});

server.applyMiddleware({
  app,
  cors: true,
});

// Sentry error handling middleware if anything pass through
app.use(Sentry.Handlers.errorHandler());

export default app;
