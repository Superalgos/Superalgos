const MODULE_NAME = "schema";

const graphql = require('graphql');
const _ = require('lodash');
const User = require('../models/user');

const tokenDecoder = require('../auth/TokenDecoder');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} = graphql; // Destructuring this variables from inside the package.

let roles = [
  {id: '1', name: 'Not Defined'},
  {id: '2', name: 'Developer'},
  {id: '3', name: 'Trader'},
  {id: '4', name: 'Data Analyst'}
];

// Types

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID},
    authId: { type: GraphQLString},
    alias: {type: GraphQLString},
    firstName: {type: GraphQLString},
    middleName: {type: GraphQLString},
    lastName: {type: GraphQLString},
    email: {type: GraphQLString},
    emailVerified: {type: GraphQLInt},
    isDeveloper: {type: GraphQLInt},
    isTrader: {type: GraphQLInt},
    isDataAnalyst: {type: GraphQLInt},
    role: {
      type: RoleType,
      resolve(parent, args) {
        return _.find(roles, {id: parent.roleId});
      }
    }
  })
});

const RoleType = new GraphQLObjectType({
  name: 'Role',
  fields: () => ({
    id: { type: GraphQLID},
    name: {type: GraphQLString},
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return User.find({roleId: parent.id});
      }
    }
  })
});

// RootQueries

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
      user: {
        type: UserType,
        args: {id: {type: GraphQLID}},
        resolve(parent,args) {
          // Code to get data from data source.
          return User.findById(args.id);
        }
      },
      userByAuthId: {
        type: UserType,
        args: {authId: {type: GraphQLString}},
        resolve(parent,args) {
          // Code to get data from data source.

          if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> RootQuery -> userByAuthId -> resolve -> Entering function."); }

          return new Promise((resolve, reject) => {

            if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> RootQuery -> userByAuthId -> resolve -> Promise -> Entering function."); }

            if (args.authId === null || args.authId === undefined) {

              if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> RootQuery -> userByAuthId -> resolve -> Promise -> User requested not specified."); }
              if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> RootQuery -> userByAuthId -> resolve -> Promise -> args.authId = " + args.authId); }

              reject({ error: "No user specified" });
              return;
            }

            User.findOne({authId: args.authId}, onUserReceived)

            function onUserReceived(err, user) {
              if(err) {
                if (ERROR_LOG === true) { console.log("[ERROR] " + MODULE_NAME + " -> RootQuery -> userByAuthId -> resolve -> Promise -> onUserReceived -> Database Error."); }
                if (ERROR_LOG === true) { console.log("[ERROR] " + MODULE_NAME + " -> RootQuery -> userByAuthId -> resolve -> Promise -> onUserReceived -> err = " + err); }
                reject(err);
              }
              else{

                if (user === null) {

                  if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> RootQuery -> userByAuthId -> resolve -> Promise -> onUserReceived -> User not found at Database."); }
                  if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> RootQuery -> userByAuthId -> resolve -> Promise -> onUserReceived -> args.authId = " + args.authId); }

                  resolve({});
                  return;
                }

                if (user.authId === args.authId && user.authId !== undefined) {

                  if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> RootQuery -> userByAuthId -> resolve -> Promise -> onUserReceived -> User found at Database."); }
                  if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> RootQuery -> userByAuthId -> resolve -> Promise -> onUserReceived -> args.authId = " + args.authId); }

                  resolve(user);
                  return;

                } else {

                  if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> RootQuery -> userByAuthId -> resolve -> Promise -> onUserReceived -> User found at Database is not the user requested."); }
                  if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> RootQuery -> userByAuthId -> resolve -> Promise -> onUserReceived -> args.authId = " + args.authId); }
                  if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> RootQuery -> userByAuthId -> resolve -> Promise -> onUserReceived -> user.authId = " + user.authId); }

                  resolve({});
                  return;
                }
              }
            }
        })

        }
      },
      role: {
        type: RoleType,
        args: {id: {type: GraphQLID}},
        resolve(parent,args) {
          // Code to get data from data source.
          return _.find(roles, {id: args.id});
        }
      },
      users: {
        type: new GraphQLList(UserType),
        resolve(parent, args){
          return User.find({});
        }
      },
      roles: {
        type: new GraphQLList(RoleType),
        resolve(parent, args){
          return roles;
        }
      }
  }
})

// Mutations

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    authenticate: {
      type: UserType,
      args: {
        idToken: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve(parent, args) {

        if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> Mutation -> authenticate -> resolve -> Entering function."); }

        /* In order to be able to wait for asyc calls to the database, and authorization authority, we need to return a promise to GraphQL. */

        const promiseToGraphQL = new Promise((resolve, reject) => {

          if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> Mutation -> authenticate -> resolve -> Promise -> Entering function."); }
          authenticate(args.idToken, onAuthenticated);

          function onAuthenticated(err, responseToGraphQL) {

            if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> Mutation -> authenticate -> resolve -> Promise -> onAuthenticated -> Entering function."); }
            if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> Mutation -> authenticate -> resolve -> Promise -> onAuthenticated -> responseToGraphQL = " + JSON.stringify(responseToGraphQL)); }

            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
              if (global.ERROR_LOG === true) { console.log("[ERROR] " + MODULE_NAME + " -> authenticate -> onValidated -> err.message = " + err.message); }
              reject (responseToGraphQL);
            } else {
              resolve (responseToGraphQL);
            }
          }
        });

        return promiseToGraphQL;
      }
    },
    updateUser:{
      type: UserType,
      args: {
        id: {type: new GraphQLNonNull(GraphQLID)},
        firstName: {type: GraphQLString},
        middleName: {type: GraphQLString},
        lastName: {type: GraphQLString},
        email: {type: GraphQLString},
        emailVerified: {type: GraphQLInt},
        isDeveloper: {type: GraphQLInt},
        isTrader: {type: GraphQLInt},
        isDataAnalyst: {type: GraphQLInt},
        roleId: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve(parent, args) {

        let key = {
          _id: args.id
        };

        let updatedUser = {
          firstName: args.firstName,
          middleName: args.middleName,
          lastName: args.lastName,
          email: args.email,
          emailVerified: args.emailVerified,
          isDeveloper: args.isDeveloper,
          isTrader: args.isTrader,
          isDataAnalyst: args.isDataAnalyst,
          roleId: args.roleId
        };

        return User.update(key, updatedUser);
      }
    }
  }
})

function authenticate(encodedToken, callBackFunction) {

try {

    if (INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> authenticate -> Entering function."); }

    let authId = "";
    let alias = "";
    let email = "";
    let emailVerified = false;

    tokenDecoder(encodedToken, onValidated);

    function onValidated(err, decodedToken) {

      if (global.INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> authenticate -> onValidated -> Entering function."); }

      if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
        if (global.ERROR_LOG === true) { console.log("[ERROR] " + MODULE_NAME + " -> authenticate -> onValidated -> err.message = " + err.message); }
        callBackFunction(global.DEFAULT_FAIL_RESPONSE, { error: err });
        return;
      }

      authId = decodedToken.sub;
      alias = decodedToken.nickname;
      email = decodedToken.email;
      emailVerified = decodedToken.email_verified;

      /* The authenticated user is NOT at our module database. We need to add him. */

       let newUser = new User({
         alias: alias,
         authId: authId,
         email: email,
         emailVerified: emailVerified,
         roleId: "1"
       });

       if (global.INFO_LOG === true) { console.log("[INFO] " + MODULE_NAME + " -> authenticate -> onValidated -> " + alias + " being added to the database"); }

       newUser.save();

       callBackFunction(global.DEFAULT_OK_RESPONSE, { authId, alias });

    }
  } catch(err) {

    if (global.ERROR_LOG === true) { console.log("[ERROR] " + MODULE_NAME + " -> authenticate -> err.message = " + err.message); }
    callBackFunction(global.DEFAULT_FAIL_RESPONSE, { error: err });

  }
}

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
