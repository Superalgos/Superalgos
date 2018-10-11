import fetch from 'node-fetch'
import { createHttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
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

  const link = setContext((request, previousContext) => (
    {
      headers: {
        authorization: previousContext.graphqlContext.headers.authorization || ''
      }
    }
  )).concat(http)

  return makeRemoteExecutableSchema({
    schema: databaseServiceSchemaDefinition,
    link: link
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
