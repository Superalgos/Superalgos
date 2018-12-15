export const typeDef = `
  type Mutation {
    master_SampleMutation(variable: String!): String
  }

  schema {
    mutation: Mutation
  }
`
