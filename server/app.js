
/* This module imports */

const globals = require('./globals');
const sessions = require('./sessions');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');

const checkJwt = require('./auth/middleware/jwt');
const getUser = require('./auth/middleware/get-user');

const cors = require('cors');

const app = express();

// Allow crosss-origin requests
app.use(cors());

// Connect to the database
mongoose.connect('mongodb://users-module-graphql-server:dsadTRYUtrsgg34@ds141952.mlab.com:41952/users', { useNewUrlParser: true });
mongoose.connection.once('open', () => {
  console.log('Connected to database');
})

/* Here we bind all requests to this endpoint to be procecced by the GraphQL Library. */

app.post('/graphql', checkJwt, (err, req, res, next) => {
    console.log('checkJwt middleware req.user: ', req.user);
    if (err) return res.status(401).send({error: `[Authenticate Token Error] ${err.message}`});
    next();
  }
);

app.get('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

app.post('/graphql', graphqlHTTP(req => ({
  schema,
  graphiql: false,
  context: { user: req.user }
  })
));

app.post('/graphql', (err, req, res, done) => getUser(req, res, done));

app.listen(4000,() => {
  console.log('Now listening for requests on port 4000');
});
