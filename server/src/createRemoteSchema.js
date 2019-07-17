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
import logger from './logger'

export const createRemoteSchema = async (uri, preshared_key) => {
  const makeDatabaseServiceLink = () => createHttpLink({
    uri: uri,
    headers: {
      preshared: preshared_key
    },
    fetch
  })
  const databaseServiceSchemaDefinition = await introspectSchema(makeDatabaseServiceLink())

  const http = makeDatabaseServiceLink()

  const authLink = setContext((request, previousContext) => {
    return (
      {
        headers: {
          Authorization: previousContext.graphqlContext.headers.authorization ? previousContext.graphqlContext.headers.authorization : '',
          UserId: previousContext.graphqlContext.headers.userId ? previousContext.graphqlContext.headers.userId : '',
          keyvault: previousContext.graphqlContext.headers.keyvault ? previousContext.graphqlContext.headers.keyvault : ''
        }
      }
    )
  })

  return makeRemoteExecutableSchema({
    schema: databaseServiceSchemaDefinition,
    link: ApolloLink.from([authLink, http])
  })
}

export const createTransformedRemoteSchema = async (prefix, uri, preshared_key) => {
  var schema
  try {
    logger.info('About to create %s schema at %s.', prefix, uri)
    schema = await createRemoteSchema(uri, preshared_key)
  } catch (error) {
    logger.error('An error occured while fetching %s, %s schema. Details: %j', prefix, uri, error)
    return false
  }
  const transformedSchema = transformSchema(schema, [
    new RenameTypes((name) => prefix + capitalize(name)),
    new RenameRootFields((operation, name) => prefix + capitalize(name))
  ])
  return transformedSchema
}

export default createRemoteSchema
