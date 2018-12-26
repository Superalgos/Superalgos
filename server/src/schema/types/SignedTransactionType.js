import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql'

const SignedTransactionType = new GraphQLObjectType({
  name: 'SignedTransaction',
  fields: () => ({
    key: {type: GraphQLString},
    signature: {type: GraphQLString},
    date: {type: GraphQLString}
  })
})

export default SignedTransactionType
