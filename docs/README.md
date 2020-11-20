# AA Team Module Documentation

## Architecture
Single-Page App (SPA) Modules are NodeJS applications that consist of a client-side application that loads and runs within a users browsers. While a SPA is a fully functional application and doesn't need backend support, it easily meets its limitations when relegated to solely the resources of a web browser.

Single-page apps are able to expand their capabilities by connecting to external datasources or other services, usually through a web API(application programming interface). These APIs allow the web app to pull in curated data from other sources like trade exchanges or movie information, connect to functionality that allows the app to authenticate, create, manage and save information in databases and much more.

### Overview
![AA Team Module Demo Architecture](./assets/AATeamDemoArchiteture.svg)

1. Postgres Database: relational data store
2. Prisma GraphQL service: wrap Postgres as a Relational Database Manager (RDBM)
3. GraphQL API server: Provides backend support with connections to data storage and other datasources
4. NGinx Web Server: Serves the front-end web applications. HTTPS provided by LetsEncrypt.
5. https://api.algocommunity.org: The API endpoint
6. https://aaweb.algocommunity.org: The aaweb demo endpoint
7. https://algocommunity.org: the team module front-end demo endpoint
8. Auth0: Third-party service providing authentication to front-end clients and Graphql API server.
9. User Web Browser: Location where front-end web apps are loaded to

### GraphQL
This module uses a GraphQL API server as its backend support providing it with the ability to query stored data on AA teams and members as well as create and manage that data.

[GraphQL](https://graphql.org/) is a specification and query language for APIs and is implemented by using the [Apollo Server](https://www.apollographql.com/) platform. Behind the GraphQL API server is a Prisma service that connects to a Postgres relational database. The Prisma service acts as a lower-level GraphQL relational-database-manager wrapping the Postgres DB.

A simple comparison between GraphQL and REST can be found at [howtographql.com](https://www.howtographql.com/basics/1-graphql-is-the-better-rest/)

In short, this combination allows

- rapid database development by simply creating a GraphQL schema
- connecting multiple datasource endpoints and wrapping them into a single endpoint (Postgres DB, Azure storage API, other micro-services and apis (like Sendgrid or even other AA modules)
- a single endpoint simplifies caching and authentication

### Auth0 Integration

[Auth0](https://auth0.com/) is a third-party service that simplifies integrating authentication into a web application.

The main use of Auth0 will be for [Oauth 2.0](https://auth0.com/docs/protocols/oauth2) authentication requesting an [*implicit grant*](https://tools.ietf.org/html/rfc6749#section-1.3.2) flow. Auth0 also hosts the login/oauth authentication forms.

While Auth0 provides a depth of user-security services such as authorization (scopes/roles), multi-factor authentication, currently only basic authentication will be used.

#### Auth0 Function Flow
![Auth0 Function Flow](./assets/AATeamAuth0FunctionFlow.svg)

Following a likely User Experience flow and revealing the Auth0 API functionality below:

1. **User loads AAWeb app and clicks login**. App should initially check session/local storage on-load to see if user is already logged-in. For Single-sign on, can use [Auth0.checkSession](https://auth0.github.io/auth0.js/global.html#checkSession). Otherwise, a first action could be for user to click on the login button to initiate the authentication flow.
2. **AAWeb app sends authorize call to Auth0 and display universal login screen** The login screen is hosted by Auth0. A user can choose to login or signup using email/password or Oauth2 login through strategy provider like Github. After user submits and Auth0 authenticates user, it returns a callback address to the web app.
3. **AAWeb receives callback address and replies to that callback address.**
4. **Auth0 now sends back a JSON Web Token (JWT) back to AAWeb** AAWeb parses JWT and extracts id_token for user information. Saves access_token, id_token and token expiration for future authentication checks. AAWeb can make an `authenticate` mutation query to the API to create an initial account store in the database.
5. **After login, AAWeb checks for user's team information by making request to GraphQL API.** Sends a POST request with an `Authorization: Bearing <auth0_access_token>`header, AAWeb queries API for `teamByOwner` using Auth0 user_info *idTokenPayload.sub* as the owner_id.
6. **GraphQL API receives query request** API parses authentication token and verifies user, compares user_id to existing user or creates a new one. Searches for any teams owned by user. Returns data in JSON format.
7. **User does not have a team and clicks on `Create Team` button**
8. User is redirected to team module client. Session is checked and if user previously logged-in, then user is automatically signed in, otherwise user has to sign-in again. *Note 1: Single-sign-on (SSO) is just a convenience function that shows a single button in login form as opposed to some "auto-login" function.* *Note 2: If user signs in with different method (ie email/pass instead of social[github]) is treated as a new user.*
9. **Auth0 sends new access_token, id_token, expiration, etc** Web app should store values for future api calls.
10. **Make authenticated API class - same as step 5** Once logged in, user can create teams, edit profile, invite others to their team, etc.
11. **Data or errors returned** Both data and errors are returned in JSON format. Data usually returned with HTTP status 204 and errors returned with status 400.

## Working with GraphQL

If you're unfamiliar with working with GraphQL, the best way to start is learning the [Core Concepts](https://www.howtographql.com/basics/2-core-concepts/) and reading through some of the introduction on [HowToGraphql](https://www.howtographql.com/).

The next step is to start playing with queries in a GraphQL playground. Browse around this one: [https://api.algocommunity.org/playground](https://api.algocommunity.org/playground)

![GraphQL Playground](./assets/AAGraphQLPlayground.png)

1. The main query builder area. GraphQL schemas can be introspected, so auto-suggestion and linting is built in.
2. The response area: where data and errors will show up.
3. The schema documentation: The format of a GraphQL schema allows it to be "Self-documenting" showing the various queries and mutations  along with their expected parameters and response forms.
4. Query Variables or Headers can be set. Especially the Authorization Header for queries/mutations that require authentication. The Bearer token is the Auth0 access_token.

### GraphQL tutorial
1. In the playground, let's make a first query. Right now, there's really only one call that doesn't require authenticated: getting teams list.
2. A GraphQL query is written in a JSON-like format of nested layers between brackets. The main searching function is called a "query" and is started by typing **`query {}`** Go ahead an enter that in the query builder section.
3. You should notice some syntax highlighting where the last bracket is marked red and if you hover your mouse over the red, you should see a message like `Syntax Error: Expected Name.` This is useful for letting you know that your query is malformed and it this case it's just telling you that it needs a Name to query — or to be more specific, a Name of a Type to query.
4. To know what our options are, click the Schema tab on the right-hand side. We are going to query the teams and you should see a **Query called teams:TeamConnection**.
5. Go ahead and **click on the query**. What's being show is that the `query teams` returns the type TeamConnection. There are no parameters. But we can somewhat choose what shape of response we get.
6. You'll notice this query returns three main TeamConnection items: pageInfo, edges, and aggregate. **Click on Edges**  You should see a type of Edges with item `node: Team` Go ahead and explore the Team item down to see our query options. [Edges/node?](https://blog.apollographql.com/explaining-graphql-connections-c48b7c3d6976)
7. Back in the query builder, let's start building our query. Since we are querying `teams` add it to your query like so: ``` query { teams }``` Notice an autocomplete will pop up to help you figure out what to type.
8. `teams` will be red, and the syntax highlighting should give you a hint. That's right, we need to tell the query what we want returned. After `teams` add `{ }`
9. The cool thing about GraphQL is we can shape our response. We could return all three main query items, but if we really only need one, then we can tell it to return one item. In this case, start typing `edges` Autocomplete will help you again, and you can hit the [Tab] key to take advantage of the suggestions.
11. You probably clicked through a fair amount of pages when exploring the teams schema. Each slideout could be thought of as another layer of brackets and you working your way down the graph until you hit the end of a connection that ends in some type of scalar like String, Int, Boolean or custom ones you defined like Date or Role.
12. So using the syntax highlighting and schema, finish creating a query. No red is usually a sign that the query form is correct. Here's an example:

```
query {
  teams {
    edges {
      node {
        name
        owner {
          nickname
        }
        profile {
          avatar
        }
      }
    }
  }
}
```
Go ahead and hit the large triangle button and see what you get!

Congrats, you've created your first GraphQL query.

### GraqphQL schema

The Teams Module graphql schema:

```
enum Role {
  OWNER
  MANAGER
  MEMBER
}

type Team {
  id: ID! @unique
  createdAt: DateTime!
  name: String!
  slug: String! @unique
  owner: Member! @relation (name: "TeamOwner", onDelete: CASCADE)
  profile: TeamProfile
  members: [TeamMembers!]! @relation (name: "TeamMembers", onDelete: SET_NULL)
  anonymous: Boolean! @default(value: true)
}

type TeamMembers {
  id: ID! @unique
  member: Member @relation (name: "MemberOnTeam", onDelete: SET_NULL)
  team: Team @relation (name: "TeamMembers", onDelete: SET_NULL)
  role: Role @default(value: MEMBER)
}

type TeamProfile {
  id: ID! @unique
  createdAt: DateTime!
  description: String
  motto: String
  avatar: String
}

type Member {
  id: ID! @unique
  nickname: String
  teams: [TeamMembers!]! @relation (name: "MemberOnTeam", onDelete: SET_NULL)
  profile: MemberProfile
  auth0id: String! @unique
  visible: Boolean! @default(value: false)
  anonymous: Boolean! @default(value: true)
}

type MemberProfile {
  id: ID! @unique
  createdAt: DateTime!
  bio: String
  status: String
  avatar: String
  repo: String
  email: String
}
```
