# Superalgos Team GraphQL API Server

This is the Superalgos Team Module server-side GraphQL API server. We use Webpack 4 + Docker to develop locally, then build to a distribution bundle that can then be uploaded via FTP, git or used with a continuous integration workflow.

This modules client-side frontend is in the [client directory](../client#README).

## Getting Started

Run
```
		npm install
```
then
```
		npm run dev
```

## Overview
The Superalgos/TeamModule API is a GraphQL server that serves the necessary queries and mutations for Superalgos teams to browser clients and the Superalgos platform.

### Main Libraries

- [*Prisma*](https://www.prisma.io/): GraphQL ORM for Postgres.
- [*Graphql*](https://graphql.org/): GraphQL is a query language for APIs and a runtime for fulfilling those queries.
- [*Apollo Server*](https://www.apollographql.com/docs/apollo-server/): Apollo Server is the best way to quickly build a production-ready, self-documenting API for GraphQL clients, using data from any source.
- [*Docker*](https://www.docker.com/what-docker)

### File organization

```
.                               # Top level directory located at your choice
├── database			# Database files for local Prisma development
├── src		        
│   ├── directives   # Directives for role permissions
│   ├── errors    # error handling
│   ├── generated     # Auto-compile GraphQl schema from Prisma endpoint
│   ├── graphql    # GraphQL API schema + resolvers
│   ├── logger    	# Utils for logging
│   ├── middleware   	# Server middleware
│   └── storage   	# Azure storage service
├── ApolloServer.js    # Main Apollo Server setup
│
└── index.js 				# Server API entrypoint

```
