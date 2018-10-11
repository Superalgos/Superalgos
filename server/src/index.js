import express from 'express'
import bodyParser from 'body-parser'
import 'dotenv/config'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import {
  makeRemoteExecutableSchema,
  mergeSchemas,
  introspectSchema,
  transformSchema,
  RenameTypes,
  RenameRootFields
} from 'graphql-tools'
import fetch from 'node-fetch'
import { createHttpLink } from 'apollo-link-http'

async function run () {
  const createRemoteSchema = async (uri) => {
    const makeDatabaseServiceLink = () => createHttpLink({
      uri: uri,
      fetch
    })
    const databaseServiceSchemaDefinition = await introspectSchema(makeDatabaseServiceLink())

    return makeRemoteExecutableSchema({
      schema: databaseServiceSchemaDefinition,
      link: makeDatabaseServiceLink()
    })
  }

  const teamsSchema = await createRemoteSchema(process.env.TEAMS_API_URL)
  const usersSchema = await createRemoteSchema(process.env.USERS_API_URL)
  const keyVaultSchema = await createRemoteSchema(process.env.KEYVAULT_API_URL)

  const capitalize = (string) => {
    return (string).charAt(0).toUpperCase() + (string).slice(1)
  }

  const transformedTeamsSchema = transformSchema(teamsSchema, [
    new RenameTypes((name) => `TeamsModule${capitalize(name)}`),
    new RenameRootFields((operation, name) => `TeamsModule${capitalize(name)}`)
  ])

  const transformedUsersSchema = transformSchema(usersSchema, [
    new RenameTypes((name) => `UsersModule${capitalize(name)}`),
    new RenameRootFields((operation, name) => `UsersModule${capitalize(name)}`)
  ])

  const transformedKeyVaultSchema = transformSchema(keyVaultSchema, [
    new RenameTypes((name) => `KeyVaultModule${capitalize(name)}`),
    new RenameRootFields((operation, name) => `KeyVaultModule${capitalize(name)}`)
  ])

  const linkSchemaDefs =
  `
    extend type TeamsModuleTeam {
      ownerUser: UsersModuleUser
    }
  `

  const schema = mergeSchemas({
    schemas: [transformedTeamsSchema, transformedUsersSchema, transformedKeyVaultSchema, linkSchemaDefs],
    resolvers: mergeInfo => ({
      TeamsModuleTeam: {
        ownerUser: {
          fragment: `fragment TeamFragment on TeamsModuleTeam{owner}`,
          resolve (parent, args, context, info) {
            const authId = parent.owner
            return mergeInfo.delegate(
              'query',
              'usersModuleUserByAuthId',
              { authId },
              context,
              info
            )
          }
        }
      }
    })
  })

  const app = express()

  app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))

  app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/graphql',
      query: `
      {
        TeamsModuleTeams{
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
