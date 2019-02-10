import http from 'http'
import { ApolloServer, makeExecutableSchema } from 'apollo-server-express'
import { applyMiddleware as applyGraphQLMiddleware } from 'graphql-middleware'
import { moduleAuth } from './middleware'
import { logger } from './logger'

export default function createApolloServer(
  app,
  {
    // Main options
    graphqlEndpoint = '',
    typeDefs = {},
    resolvers = {},
    schemaDirectives = {},
    directiveResolvers = {},
    graphqlMiddlewares = [],
    dataSources = () => ({}),
    context = () => ({}),
    // Subscriptions
    subscriptionsEndpoint = '',
    wsMiddlewares = [],
    // Mocks
    mocks,
    // Apollo Engine
    engineKey = '',
    // HTTP options
    cors = true,
    timeout = 120000,
    // Extra options for Apollo Server
    apolloServerOptions = {},
  }
) {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives,
    directiveResolvers,
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
  })

  // Apollo server options
  const options = {
    ...apolloServerOptions,
    schema: applyGraphQLMiddleware(schema, ...graphqlMiddlewares),
    tracing: true,
    cacheControl: true,
    introspection: true,
    playground: true,
    engine: engineKey ? { apiKey: engineKey } : false,
    dataSources,
    // Resolvers context in POST requests
    context: async ({ req, connection }) => {
      let contextData
      try {
        if (connection) {
          contextData = { ...connection.context }
        } else {
          contextData = await context({ req, request: req })
        }
      } catch (err) {
        logger.error(err)
        throw err
      }

      return contextData
    },
    // Resolvers context in WebSocket requests
    subscriptions: {
      path: subscriptionsEndpoint,
      onConnect: async (connection, websocket) => {
        const { authorization, userid } = connection

        let contextData = {}
        try {
          // Simulate `req` object for auth
          const req = { headers: { authorization, userid } }

          // Call all middlewares in order and modify `req`
          await new Promise((resolve, reject) =>
            wsMiddlewares.reduceRight(
              (acc, m) => err => (err ? reject(err) : m(req, null, acc)),
              err => (err ? reject(err) : resolve())
            )()
          )

          contextData = await context({
            connection,
            websocket,
            request: req,
            req,
          })
        } catch (err) {
          logger.error(err)
        }

        return contextData
      },
    },
  }

  // Apollo Server
  const server = new ApolloServer(options)

  // Express middleware
  server.applyMiddleware({
    moduleAuth,
    app,
    cors,
    path: graphqlEndpoint,
    // gui: {
    //   endpoint: graphqlEndpoint,
    //   subscriptionEndpoint: graphqlSubscriptionsPath,
    // },
  })

  // Create HTTP server and add subscriptions
  const httpServer = http.createServer(app)
  httpServer.setTimeout(timeout)
  server.installSubscriptionHandlers(httpServer)

  return httpServer
}
