const { GraphQLServer } = require('graphql-yoga')
const {
  Prisma,
  extractFragmentReplacements,
  forwardTo
} = require('prisma-binding')
const { makeExecutableSchema } = require('graphql-tools')
const { importSchema } = require('graphql-import')
const { checkJwt } = require('./auth/middleware/jwt')
const { getMember } = require('./auth/middleware/getMember')
const validateParseIdToken = require('./auth/helpers/validate-parse-id-token')
const { directiveResolvers } = require('./auth-directives')

const ctxMember = ctx => ctx.request.member

const resolvers = {
  Query: {
    async member(parent, { auth0id }, ctx, info) {
      return ctx.db.query.member({ where: { auth0id } }, info)
    },
    teams(parent, args, ctx, info) {
      return ctx.db.query.teamsConnection({},
      `{
        edges {
          node {
            id
            name
            slug
            profile {
              avatar
              description
              motto
            }
            owner {
              nickname
              visible
              profile {
                avatar
              }
            }
            members {
              role
              member {
                nickname
                visible
                profile {
                  avatar
                }
              }
            }
          }
        }
     }`)
    },
    async teamById(parent, { id }, ctx, info) {
      return ctx.db.query.team({ where: { id } }, info)
    },
    async teamByName(parent, { name }, ctx, info) {
      return ctx.db.query.team({ where: { name: name } }, `{ name }`)
    },
    async teamByOwner(parent, { ownerId }, ctx, info) {
      return ctx.db.query.teamsConnection({where: { owner: { auth0id: ownerId }}},
      `{
        edges {
          node {
            id
            name
            slug
            profile {
              avatar
              description
              motto
            }
            owner {
              auth0id
              nickname
              visible
              profile {
                avatar
              }
            }
            members {
              role
              member {
                nickname
                visible
                profile {
                  avatar
                }
              }
            }
          }
        }
     }`)
    },
    async owner(parent, args, ctx, info) {
      console.log('resolver.query.owner ctx: ', ctxMember(ctx))
      return ctx.db.query.member({ where: { id: ctxMember(ctx).auth0id } }, info)
        .catch((res) => {
          console.log('createTeam error: ', res)
          const errors = res.graphQLErrors.map((error) => {
            return error.message
          })
        })
    },
    members: forwardTo('db')
  },
  Mutation: {
    async authenticate(parent, { idToken }, ctx, info) {
      let memberToken = null
      try {
        memberToken = await validateAndParseIdToken(idToken)
        console.log('authenticate.memberToken: ', await memberToken)
      } catch (err) {
        console.log('authenticat.validateAndParseIdToken err: ', err)
        throw new Error(err.message)
      }
      const auth0id = memberToken.sub
      let member = await ctx.db.query.member({ where: { auth0id } }, info)

      if (!member) {
        try {
          return createMember(ctx, info, memberToken)
        } catch (error) {
          throw new Error(error.message)
        }
        }
      }
      return member
    },
    async createTeam(parent, { name, slug, owner }, ctx, info) {
      return ctx.db.mutation.createTeam({
        data: {
          name: name,
          slug: slug,
          owner: {connect:{auth0id: owner}},
          members: {create: {role: 'OWNER', member: {connect: {auth0id: owner}}}}
        }
      }, info)
        .catch((res) => {
          console.log('createTeam error: ', res)
          const errors = res.graphQLErrors.map((error) => {
            return error.message
          })
        })
    },
    async deleteTeam(parent, { id }, ctx, info) {
      return ctx.db.mutation.deleteTeam({ where: { id } }, info)
        .catch((res) => {
          console.log('deleteTeam error: ', res)
          const errors = res.graphQLErrors.map((error) => {
            return error.message
          })
        })
    }
  }
}

const db = new Prisma({
  fragmentReplacements: extractFragmentReplacements(resolvers),
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET,
  debug: true
})

const schema = makeExecutableSchema({
  typeDefs: importSchema('src/schema.graphql'),
  resolvers,
  resolverValidationOptions: { requireResolversForResolveType: false },
  directiveResolvers
})

const server = new GraphQLServer({
  schema,
  context: req => ({
    ...req,
    db
  })
})

server.express.post(
  server.options.endpoint,
  checkJwt,
  (err, req, res, next) => {
    if (err) return res.status(401).send(err.message)
    next()
  }
)

server.express.post(server.options.endpoint, (req, res, done) =>
  getMember(req, res, done, db)
)

const whitelist = [
  'http://localhost:1337',
  'http://0.0.0.0:5000'
]
const corsOptionsDelegate = (req, callback) => {
  var corsOptions
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true, credentials: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false, credentials: true } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

const options = {
  cors: corsOptionsDelegate,
  endpoint: '/graphql',
  subscriptions: '/graphql',
  playground: '/playground'
}

server.start(options, () => console.log(`Server is running on http://localhost:4000${server.options.endpoint}`))

module.exports= { createPrismaMember: createPrismaMember }
