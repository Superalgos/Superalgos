/* Debugging */

global.INFO_LOG = true;
global.ERROR_LOG = true;

/* Callbacks default responses. */

global.DEFAULT_OK_RESPONSE = {
    result: "Ok",
    message: "Operation Succeeded"
};

global.DEFAULT_FAIL_RESPONSE = {
    result: "Fail",
    message: "Operation Failed"
};

global.DEFAULT_RETRY_RESPONSE = {
    result: "Retry",
    message: "Retry Later"
};

global.CUSTOM_OK_RESPONSE = {
    result: "Ok, but check Message",
    message: "Custom Message"
};

global.CUSTOM_FAIL_RESPONSE = {
    result: "Fail Because",
    message: "Custom Message"
};

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

app.get('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

app.post('/graphql', graphqlHTTP({
  schema,
  graphiql: false,
  context: req => ({ ...req })
}));

app.post('/graphql', checkJwt, (err, req, res, next) => {
    console.log(req);
    if (err) return res.status(401).send(`[Authenticate Token Error] ${err.message}`);
    next();
  }
);

app.post('/graphql', (req, res, done) => getUser(req, res, done));

app.listen(4000,() => {
  console.log('Now listening for requests on port 4000');
});
