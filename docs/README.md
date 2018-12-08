# AA Notifications Module Documentation

## Architecture
Currently, this module is only a GraphQL server providing notification services to other platform modules. For example, it wraps the SendGrid API and allows other modules to send transactional emails or provides signup methods to campaign newsletter list.

There is no database or client for this module at this time.

### GraqphQL schema

The Notifications Module graphql schema:

```
type Mutation {
  master
  teamsSendMemberInvite(email: String!, teamId: String!): String
  teamsVerifyMemberInvite(token: String!): String
}
```
