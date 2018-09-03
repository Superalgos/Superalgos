const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Allow crosss-origin requests
app.use(cors());

// Connect to the daabase
mongoose.connect('mongodb://users-module-graphql-server:dsadTRYUtrsgg34@ds141952.mlab.com:41952/users', { useNewUrlParser: true });
mongoose.connection.once('open', () => {
  console.log('Connected to database');
})

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

app.listen(4000,() => {
  console.log('Now listening for requests on port 4000');
});
