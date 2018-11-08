export const typeDef = `
  type Mutation {
    sendgrid_NewsletterSignup(email: String!): String
    sendgrid_NewsletterSignupVerify(email: String!): String
    sendgrid_Contact(email: String!, subject: String!, Message: String!, recaptcha: String!): String
  }

  schema {
    mutation: Mutation
  }
`
