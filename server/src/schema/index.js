export const typeDef = `
  type Mutation {
    master_NewsletterSignup(email: String!): String
    master_NewsletterSignupVerify(token: String!): String
    master_Contact(email: String!, subject: String!, Message: String!, recaptcha: String!): String
  }

  schema {
    mutation: Mutation
  }
`
