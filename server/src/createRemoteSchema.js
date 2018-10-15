import fetch from 'node-fetch'
import { createHttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { ApolloLink } from 'apollo-link'
import {
  makeRemoteExecutableSchema,
  introspectSchema,
  transformSchema,
  RenameTypes,
  RenameRootFields
} from 'graphql-tools'

import { capitalize } from './utils'

export const createRemoteSchema = async (uri) => {
  const makeDatabaseServiceLink = () => createHttpLink({
    uri: uri,
    fetch
  })
  const databaseServiceSchemaDefinition = await introspectSchema(makeDatabaseServiceLink())

  const http = makeDatabaseServiceLink()

  const authLink = setContext((request, previousContext) => {
    return (
      {
        headers: {
          Authorization: previousContext.graphqlContext.headers.authorization ? previousContext.graphqlContext.headers.authorization : ''
        }
      }
    )
  })

  return makeRemoteExecutableSchema({
    schema: databaseServiceSchemaDefinition,
    link: ApolloLink.from([authLink, http])
  })
}

export const createTransformedRemoteSchema = async (prefix, uri) => {
  var schema
  try {
    schema = await createRemoteSchema(uri)
  } catch (error) {
    console.log(`An error occured while fetching ${prefix} schema :`)
    console.log(error)
    return false
  }
  const transformedSchema = transformSchema(schema, [
    new RenameTypes((name) => prefix + capitalize(name)),
    new RenameRootFields((operation, name) => prefix + capitalize(name))
  ])
  return transformedSchema
}

export default createRemoteSchema
