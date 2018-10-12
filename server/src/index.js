import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { ApolloServer } from 'apollo-server-express'
import { mergeSchemas } from 'graphql-tools'
import { createTransformedRemoteSchema } from './createRemoteSchema'
import { teams } from './links'

async function run () {
  const transformedTeamsSchema = await createTransformedRemoteSchema('teams_', process.env.TEAMS_API_URL)
  const transformedUsersSchema = await createTransformedRemoteSchema('users_', process.env.USERS_API_URL)
  const transformedKeyVaultSchema = await createTransformedRemoteSchema('keyVault_', process.env.KEYVAULT_API_URL)

  var schemas = []
  var resolvers = {}

  if (transformedTeamsSchema) {
    schemas.push(transformedTeamsSchema)
    if (transformedUsersSchema) {
      schemas.push(teams.linkSchemaDefs)
      resolvers = Object.assign(resolvers, teams.resolver(transformedUsersSchema))
    }
  }
  if (transformedUsersSchema) {
    schemas.push(transformedUsersSchema)
  }
  if (transformedKeyVaultSchema) {
    schemas.push(transformedKeyVaultSchema)
  }

  const schema = mergeSchemas({
    schemas,
    resolvers
  })

  const app = express()
  const server = new ApolloServer({
    schema,
    context: ({ req }) => req, // placeholder until specific use case for context on Master App server
    formatError: error => {
      console.log(JSON.stringify(error))
      return error;
    },
    formatResponse: response => {
      console.log(JSON.stringify(response))
      return response;
    },
    playground: {
      settings: { 'editor.theme': 'light' }
    }
  })

  server.applyMiddleware({ app });

  app.use(cors())

  app.listen(4100)
  console.log('Server running. Open http://localhost:4100/graphql to run queries.')
}

try {
  run()
} catch (e) {
  console.log(e, e.message, e.stack)
}
