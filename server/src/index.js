import express from 'express'
import bodyParser from 'body-parser'
import 'dotenv/config'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import { mergeSchemas } from 'graphql-tools'
import { createTransformedRemoteSchema } from './createRemoteSchema'

async function run () {
  const transformedTeamsSchema = await createTransformedRemoteSchema('TeamsModule', process.env.TEAMS_API_URL)
  const transformedUsersSchema = await createTransformedRemoteSchema('UsersModule', process.env.USERS_API_URL)
  const transformedKeyVaultSchema = await createTransformedRemoteSchema('KeyVaultModule', process.env.KEYVAULT_API_URL)

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
          fragment: `fragment UserFragment on TeamsModuleTeam{owner}`,
          resolve (parent, args, context, info) {
            const authId = parent.owner
            return mergeInfo.delegateToSchema({
              schema: transformedUsersSchema,
              operation: 'query',
              fieldName: 'UsersModuleUserByAuthId',
              args: { authId },
              context,
              info
            })
          }
        }
      }
    })
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
