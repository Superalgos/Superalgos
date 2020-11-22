/* eslint-disable no-console */
import * as Sentry from '@sentry/node';
import db from './db';
import app from './app';

// Bind server success and error to sentry
db.on('error', (err) => {
  Sentry.configureScope((scope) => {
    scope.setLevel('error');
  });
  Sentry.captureException(err);
});
db.once('open', () => {
  Sentry.configureScope((scope) => {
    scope.setLevel('info');
  });
  Sentry.captureMessage('Connected to the DB.');
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
