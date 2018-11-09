export const typeDef = `
  type Mutation {
    sgSendNewsletterVerify(email: String!): String
    sgNewsletterSignup(email: String!): String
    sgContact(email: String!, subject: String!, Message: String!): String
  }

  schema {
    mutation: Mutation
  }
`
