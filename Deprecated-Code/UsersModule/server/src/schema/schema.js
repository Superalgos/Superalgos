const MODULE_NAME = 'schema'

import logger from '../logger'
import _ from 'lodash'
import User from '../models/user'
import tokenDecoder from '../auth/token-decoder'

const graphql = require('graphql')

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} = graphql // Destructuring this variables from inside the package.

let roles = [
  {id: '1', name: 'Not Defined'},
  {id: '2', name: 'Developer'},
  {id: '3', name: 'Trader'},
  {id: '4', name: 'Data Analyst'}
]

// Types

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID},
    authId: { type: GraphQLString},
    referrerId: {type: GraphQLString},
    alias: {type: GraphQLString},
    firstName: {type: GraphQLString},
    middleName: {type: GraphQLString},
    lastName: {type: GraphQLString},
    bio: {type: GraphQLString},
    email: {type: GraphQLString},
    emailVerified: {type: GraphQLInt},
    isDeveloper: {type: GraphQLInt},
    isTrader: {type: GraphQLInt},
    isDataAnalyst: {type: GraphQLInt},
    avatarHandle: {type: GraphQLString},
    avatarChangeDate: {type: GraphQLString},
    sessionToken: {type: GraphQLString},
    role: {
      type: RoleType,
      resolve (parent, args) {
        return _.find(roles, {id: parent.roleId})
      }
    }
  })
})

const DescendentType = new GraphQLObjectType({
  name: 'Descendent',
  fields: () => ({
    id: { type: GraphQLID},
    referrerId: {type: GraphQLString},
    alias: {type: GraphQLString},
    firstName: {type: GraphQLString},
    middleName: {type: GraphQLString},
    lastName: {type: GraphQLString},
    descendents: {
      type: new GraphQLList(DescendentType),
      resolve (parent, args) {
        return User.find({referrerId: parent.id})
      }
    }
  })
})

const RoleType = new GraphQLObjectType({
  name: 'Role',
  fields: () => ({
    id: { type: GraphQLID},
    name: {type: GraphQLString},
    users: {
      type: new GraphQLList(UserType),
      resolve (parent, args) {
        return User.find({roleId: parent.id})
      }
    }
  })
})

// RootQueries

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: {id: {type: GraphQLID}},
      resolve (parent, args) {
          // Code to get data from data source.
        return User.findById(args.id)
      }
    },
    userByAuthId: {
      type: UserType,
      args: {authId: {type: GraphQLString}},
      resolve (parent, args) {
          // Code to get data from data source.

        if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> RootQuery -> userByAuthId -> resolve -> Entering function.') }

          /* In order to be able to wait for asyc calls to the database, we need to return a promise to GraphQL. */

        const promiseToGraphQL = new Promise((resolve, reject) => {
          if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> RootQuery -> userByAuthId -> resolve -> Promise -> Entering function.') }
          if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> RootQuery -> userByAuthId -> resolve -> Promise -> args.authId = ' + args.authId) }

          findUserByAuthId(args.authId, onUserFound)

          function onUserFound (err, responseToGraphQL) {
            if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> RootQuery -> userByAuthId -> resolve -> Promise -> onUserFound -> Entering function.') }
            if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> RootQuery -> userByAuthId -> resolve -> Promise -> onUserFound -> responseToGraphQL = ' + JSON.stringify(responseToGraphQL)) }

            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
              if (process.env.ERROR_LOG === true) { logger.error('[ERROR] ' + MODULE_NAME + ' -> RootQuery -> userByAuthId -> resolve -> Promise -> onUserFound -> err.message = ' + err.message) }
              reject(responseToGraphQL)
            } else {
              resolve(responseToGraphQL)
            }
          }
        })

        return promiseToGraphQL
      }
    },
    role: {
      type: RoleType,
      args: {id: {type: GraphQLID}},
      resolve (parent, args) {
          // Code to get data from data source.
        return _.find(roles, {id: args.id})
      }
    },
    users: {
      type: new GraphQLList(UserType),
      resolve (parent, args) {
        return User.find({})
      }
    },
    roles: {
      type: new GraphQLList(RoleType),
      resolve (parent, args) {
        return roles
      }
    },
    usersSearch: {
      type: new GraphQLList(UserType),
      args: {alias: {type: GraphQLString}, firstName: {type: GraphQLString}, middleName: {type: GraphQLString}, lastName: {type: GraphQLString}},
      resolve (parent, args) {
        if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> RootQuery -> usersSearch -> resolve -> Entering function.') }

        let mongoQuery = { $or: [] }

        if (args.alias !== null && args.alias !== '') { mongoQuery.$or.push({alias: args.alias}) }
        if (args.firstName !== null && args.firstName !== '') { mongoQuery.$or.push({firstName: args.firstName}) }
        if (args.middleName !== null && args.middleName !== '') { mongoQuery.$or.push({middleName: args.middleName}) }
        if (args.lastName !== null && args.lastName !== '') { mongoQuery.$or.push({lastName: args.lastName}) }

        if (mongoQuery.$or.length === 0) { mongoQuery = {} }

        return User.find(mongoQuery)
      }
    },
    descendents: {
      type: new GraphQLList(DescendentType),
      args: {id: {type: GraphQLString}},
      resolve (parent, args) {
        if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> RootQuery -> descendents -> resolve -> Entering function.') }

        return User.find({referrerId: args.id})
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
      resolve (parent, args) {
        if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> Mutation -> authenticate -> resolve -> Entering function.') }

        /* In order to be able to wait for asyc calls to the database, and authorization authority, we need to return a promise to GraphQL. */

        const promiseToGraphQL = new Promise((resolve, reject) => {
          if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> Mutation -> authenticate -> resolve -> Promise -> Entering function.') }
          authenticate(args.idToken, onAuthenticated)

          function onAuthenticated (err, responseToGraphQL) {
            if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> Mutation -> authenticate -> resolve -> Promise -> onAuthenticated -> Entering function.') }
            if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> Mutation -> authenticate -> resolve -> Promise -> onAuthenticated -> responseToGraphQL = ' + JSON.stringify(responseToGraphQL)) }

            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
              if (process.env.ERROR_LOG === true) { logger.error('[ERROR] ' + MODULE_NAME + ' -> Mutation -> authenticate -> resolve -> Promise -> onAuthenticated -> err.message = ' + err.message) }
              reject(responseToGraphQL)
            } else {
              resolve(responseToGraphQL)
            }
          }
        })

        return promiseToGraphQL
      }
    },
    updateUser: {
      type: UserType,
      args: {
        firstName: {type: GraphQLString},
        middleName: {type: GraphQLString},
        lastName: {type: GraphQLString},
        bio: {type: GraphQLString},
        isDeveloper: {type: GraphQLInt},
        isTrader: {type: GraphQLInt},
        isDataAnalyst: {type: GraphQLInt},
        roleId: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve (parent, args, context) {
        let key = {
          _id: context.userId
        }

        let updatedUser = {
          firstName: args.firstName,
          middleName: args.middleName,
          lastName: args.lastName,
          bio: args.bio,
          isDeveloper: args.isDeveloper,
          isTrader: args.isTrader,
          isDataAnalyst: args.isDataAnalyst,
          roleId: args.roleId
        }

        return User.update(key, updatedUser)
      }
    },
    updateUserReferrer: {
      type: UserType,
      args: {
        referrerId: {type: GraphQLString}
      },
      resolve (parent, args, context) {
        let key = {
          _id: context.userId,
          referrerId: null
        }

        let updatedUser = {
          referrerId: args.referrerId
        }

        return User.update(key, updatedUser)
      }
    },
    updateSessionToken: {
      type: UserType,
      args: {
        userId: {type: GraphQLString},
        sessionToken: {type: GraphQLString}
      },
      resolve (parent, args) {
        let key = {
          _id: decodeURI(args.userId)
        }

        let updatedUser = {
          sessionToken: args.sessionToken
        }

        return User.update(key, updatedUser)
      }
    }
  }
})

function findUserByAuthId (authId, callBackFunction) {
  try {
    if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> findUserByAuthId -> Entering function.') }
    if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> findUserByAuthId -> authId = ' + authId) }

    if (authId === null || authId === undefined) {
      if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> findUserByAuthId -> User requested not specified.') }
      if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> findUserByAuthId -> args.authId = ' + authId) }

      callBackFunction(global.DEFAULT_FAIL_RESPONSE, { error: 'Bad Request' })
      return
    }

    User.findOne({authId: authId}, onUserReceived)

    function onUserReceived (err, user) {
      if (err) {
        if (ERROR_LOG === true) { logger.error('[ERROR] ' + MODULE_NAME + ' -> findUserByAuthId -> onUserReceived -> Database Error.') }
        if (ERROR_LOG === true) { logger.error('[ERROR] ' + MODULE_NAME + ' -> findUserByAuthId -> onUserReceived -> err = ' + err) }
        callBackFunction(global.DEFAULT_FAIL_RESPONSE, { error: err })
      } else {
        if (user === null) {
          if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> findUserByAuthId -> onUserReceived -> User not found at Database.') }
          if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> findUserByAuthId -> onUserReceived -> args.authId = ' + authId) }

          let customResponse = {
            result: global.CUSTOM_OK_RESPONSE.result,
            message: 'User Not Found'
          }

          callBackFunction(customResponse, { error: customResponse.message })
          return
        }

        if (user.authId === authId && user.authId !== undefined) {
          if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> findUserByAuthId -> onUserReceived -> User found at Database.') }
          if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> findUserByAuthId -> onUserReceived -> args.authId = ' + authId) }

          callBackFunction(global.DEFAULT_OK_RESPONSE, user)
          return
        } else {
          if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> findUserByAuthId -> onUserReceived -> User found at Database is not the user requested.') }
          if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> findUserByAuthId -> onUserReceived -> args.authId = ' + authId) }
          if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> findUserByAuthId -> onUserReceived -> user.authId = ' + user.authId) }

          callBackFunction(global.DEFAULT_FAIL_RESPONSE, { error: err })
          return
        }
      }
    }
  } catch (err) {
    if (process.env.ERROR_LOG === true) { logger.error('[ERROR] ' + MODULE_NAME + ' -> findUserByAuthId -> err.message = ' + err.message) }
    callBackFunction(global.DEFAULT_FAIL_RESPONSE, { error: err })
  }
}

function authenticate (encodedToken, callBackFunction) {
  try {
    if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> authenticate -> Entering function.') }

    let authId = ''
    let alias = ''
    let email = ''
    let emailVerified = false

    tokenDecoder(encodedToken, onValidated)

    function onValidated (err, decodedToken) {
      if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> authenticate -> onValidated -> Entering function.') }

      if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
        if (process.env.ERROR_LOG === true) { logger.error('[ERROR] ' + MODULE_NAME + ' -> authenticate -> onValidated -> err.message = ' + err.message) }
        callBackFunction(global.DEFAULT_FAIL_RESPONSE, { error: err })
        return
      }

      /*

      Ok, the user was correctly authenticated. Next we need to know if this logged in user
      has already been added to this module's database or not yet.

      */

      authId = decodedToken.sub
      alias = decodedToken.nickname
      email = decodedToken.email
      emailVerified = decodedToken.email_verified

      findUserByAuthId(authId, onUserFound)

      function onUserFound (err, user) {
        if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> authenticate -> onValidated -> onUserFound -> Entering function.') }

        if (err.result === global.DEFAULT_FAIL_RESPONSE.result) {
          if (process.env.ERROR_LOG === true) { logger.error('[ERROR] ' + MODULE_NAME + ' -> authenticate -> onValidated -> onUserFound -> err.message = ' + err.message) }
          callBackFunction(global.DEFAULT_FAIL_RESPONSE, { error: err })
          return
        }

        if (err.result === global.DEFAULT_OK_RESPONSE.result) {
          if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> authenticate -> onValidated -> onUserFound -> User already exists at database') }

          if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> authenticate -> onValidated -> onUserFound -> Existing User: ' + JSON.stringify(user)) }

          callBackFunction(global.DEFAULT_OK_RESPONSE, { authId: authId, alias: user.alias })
          return
        }

        if (
          err.result === global.CUSTOM_OK_RESPONSE.result &&
          err.message === 'User Not Found'
        ) {
          if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> authenticate -> onValidated -> onUserFound -> User does not exist at database') }

          /*

          The authenticated user is NOT at our module database. We need to add him.
          We will take from the authentication provider the basic information it knows about the logged in users
          and save it as an initial set of data, which can later be modified.

          */

          /* The user can sign up with many different possible social accounts. Currently this module only supports Github only. */

          let authArray = authId.split('|')
          let socialAccountProvider = authArray[0]

          if (
            socialAccountProvider !== 'github' &&
            socialAccountProvider !== 'auth0'
          ) {
            if (process.env.ERROR_LOG === true) { logger.error('[ERROR] ' + MODULE_NAME + ' -> authenticate -> onValidated -> onUserFound -> Social Account Provider not Supoorted. ') }
            if (process.env.ERROR_LOG === true) { logger.error('[ERROR] ' + MODULE_NAME + ' -> authenticate -> onValidated -> onUserFound -> socialAccountProvider = ' + socialAccountProvider) }

            callBackFunction(global.DEFAULT_FAIL_RESPONSE, { error: err })
            return
          }

          let localDate = new Date()
          let creationDate = localDate.valueOf()

          let newUser = new User({
            alias: alias,
            authId: authId,
            creationDate: creationDate,
            email: email,
            emailVerified: emailVerified,
            roleId: '1'
          })

          if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> authenticate -> onValidated -> onUserFound -> ' + alias + ' being added to the database') }

          newUser.save(onSaved)

          function onSaved (err, savedUser) {
            if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> authenticate -> onValidated -> onUserFound -> onSaved -> Entering function.') }

            if (err) {
              if (process.env.ERROR_LOG === true) { logger.error('[ERROR] ' + MODULE_NAME + ' -> authenticate -> onValidated -> onUserFound -> onSaved -> err = ' + err) }
              callBackFunction(global.DEFAULT_FAIL_RESPONSE, { error: err })
              return
            }

            if (process.env.INFO_LOG === true) { logger.debug('[INFO] ' + MODULE_NAME + ' -> authenticate -> onValidated -> onUserFound -> onSaved -> Saved User: ' + JSON.stringify(savedUser)) }

            callBackFunction(global.DEFAULT_OK_RESPONSE, { authId, alias })
          }
        }
      }
    }
  } catch (err) {
    if (process.env.ERROR_LOG === true) { logger.error('[ERROR] ' + MODULE_NAME + ' -> authenticate -> err.message = ' + err.message) }
    callBackFunction(global.DEFAULT_FAIL_RESPONSE, { error: err })
  }
}

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})
