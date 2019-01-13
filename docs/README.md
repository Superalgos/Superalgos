# Superalgos Notifications Module Documentation

## Architecture
Currently, this module is only a GraphQL server providing notification services to other platform modules. For example, it wraps the SendGrid API and allows other modules to send transactional emails or provides signup methods to campaign newsletter list.

There is no database or client for this module currently.

### GraqphQL schema

The Notifications Module graphql schema:

```
type Mutation {
  Corporate_NewsletterSignup(email: String!): String
  Corporate_NewsletterSignupVerify(token: String!): String
  Corporate_Contact(email: String!, name: String, message: String!, recaptcha: String!): String
  Master_NewsletterSignup(email: String!): String
  Master_NewsletterSignupVerify(token: String!): String
  Master_Feedback(email: String!, subject: String!, message: String!, recaptcha: String!): String
  Teams_SendTeamMemberInvite(email: String!, teamName: String!): String
  Teams_SendTeamCreateConfirmation(email: String!, teamName: String!, botName: String!): String
  Teams_VerifyTeamMemberInviteToken(token: String!): String
}
```
