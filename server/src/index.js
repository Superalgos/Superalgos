import express from 'express'
import bodyParser from 'body-parser'
import 'dotenv/config'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import { makeRemoteExecutableSchema, mergeSchemas, introspectSchema } from 'graphql-tools'
import { createApolloFetch } from 'apollo-fetch'

async function run () {
  const createRemoteSchema = async (uri) => {
    const fetcher = createApolloFetch({ uri })
    return makeRemoteExecutableSchema({
      schema: await introspectSchema(fetcher),
      fetcher
    })
  }

  const teamsSchema = await createRemoteSchema(process.env.TEAMS_API_URL)
  console.log(teamsSchema)

  // const usersSchema = await createRemoteSchema(process.env.USERS_API_URL)
  // const keyvaultSchema = await createRemoteSchema(process.env.KEYVAULT_API_URL)

  // const linkSchemaDefs =
  // `
  //   extend type User {
  //     user: User
  //   }
  // `

  const schema = mergeSchemas({
    schemas: [teamsSchema]
    // schemas: [teamsSchema, usersSchema, keyvaultSchema, linkSchemaDefs],
    // resolvers: mergeInfo => ({
    //   Team: {
    //     location: {
    //       fragment: `fragment TeamFragment on Team {owner}`,
    //       resolve (parent, args, context, info) {
    //         const authId = parent.owner
    //         return mergeInfo.delegate(
    //           'query',
    //           'userByAuthId',
    //           { authId },
    //           context,
    //           info
    //         )
    //       }
    //     }
    //   }
    // })
  })

  const app = express()

  app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))

  app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/graphql',
      query: `
      query {
        teams{
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
