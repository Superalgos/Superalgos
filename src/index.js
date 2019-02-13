/* eslint-disable no-console */
import db from './db';
import app from './app';

db.on('error', (err) => {
  console.log(err);
});
db.once('open', () => {
  console.log('Connected to the DB.');
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
