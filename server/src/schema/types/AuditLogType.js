import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt
} from 'graphql'

import {
  KeyType
} from './index'

const AuditLogType = new GraphQLObjectType({
  name: 'AuditLog',
  fields: () => ({
    id: {type: GraphQLID},
    authId: {type: GraphQLID},
    action: {type: GraphQLString},
    details: {type: GraphQLString},
    date: {type: GraphQLInt},
    key: {
      type: KeyType,
      resolve (parent, args) {
        return parent.key
      }
    }
  })
})

export default AuditLogType
