import express from 'express'
import bodyParser from 'body-parser'
import 'dotenv/config'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
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

  app.use('/graphql', bodyParser.json(), graphqlExpress(req => {
    return ({
      schema: schema,
      context: req
    })
  }))

  app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/graphql',
      query: `
      {
        teams_Teams{
          edges{
            node{
              name
            }
          }
        }
      }
      `
    })
  )

  app.listen(3000)
  console.log('Server running. Open http://localhost:3000/graphiql to run queries.')
}

try {
  run()
} catch (e) {
  console.log(e, e.message, e.stack)
}
