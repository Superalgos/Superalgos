require('dotenv').config();
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
const { validateIdToken } = require('./auth/validateIdToken')
const { directiveResolvers } = require('./auth/authDirectives')

const createMember = async function (ctx, info, idToken) {
  console.log('createMember', idToken)
  const member = await ctx.db.mutation.upsertMember({
    where: {
      authId: idToken.sub,
    },
    create: {
      authId: idToken.sub,
      alias: idToken.nickname
    },
    update: {
      authId: idToken.sub,
      alias: idToken.nickname
    }
  }, info)
  return member
}

const ctxMember = ctx => ctx.request.member

const resolvers = {
  Query: {
    async member(parent, arg, ctx, info) {
      console.log('member: ', parent, arg)
      return ctx.db.query.member({ where: { authId: arg.authId } }, info)
    },
    async currentMember(parent, args, ctx, info) {
      console.log('currentMember: ', ctx.request.res.req.user)
      const authId = ctx.request.res.req.user.sub
      return ctx.db.query.member({ where: { authId } }, info)
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
    async teamsByOwner(parent, { ownerId }, ctx, info) {
      return ctx.db.query.teamsConnection({where: { owner: { authId: ownerId }}},
      `{
        edges {
          node {
            id
            name
            slug
            owner
            status {
              status
              reason
              createdAt
            }
            createdAt
            profile {
              avatar
              description
              motto
              updatedAt
            }
            members {
              role
              member {
                alias
                authId
              }
            }
          }
        }
     }`)
    },
    async owner(parent, args, ctx, info) {
      console.log('resolver.query.owner ctx: ', ctxMember(ctx))
      return ctx.db.query.member({ where: { id: ctxMember(ctx).authId } }, info)
        .catch((res) => {
          console.log('createTeam error: ', res)
          const errors = res.graphQLErrors.map((error) => {
            return error.message
          })
        })
    }
  },
  Mutation: {
    async authenticate(parent, { idToken }, ctx, info) {
      let memberToken = null
      try {
        memberToken = await validateIdToken(idToken)
        console.log('authenticate.memberToken: ', await memberToken)
      } catch (err) {
        console.log('authenticat.validateIdToken err: ', err)
        throw new Error(err.message)
      }
      const authId = memberToken.sub
      let member = await ctx.db.query.member({ where: { authId } }, info)

      if (!member) {
        try {
          return createMember(ctx, info, memberToken)
        } catch (error) {
          throw new Error(error.message)
        }
      }
      return member
    },
    async createTeam(parent, { name, slug, owner }, ctx, info) {
      return ctx.db.mutation.createTeam({
        data: {
          name: name,
          slug: slug,
          owner: owner
        }
      }, info)
        .catch((err) => {
          console.log('createTeam error: ', err)
          return err
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
  }),
})

server.express.use(
  server.options.endpoint,
  checkJwt,
  (err, req, res, next) => {
    console.log('checkJwt: ', err, req.user)
    if (err) return res.status(401).send(err.message)
    next()
  }
)

server.express.post(server.options.endpoint, (err, req, res, done) => {
  console.log('getMember: ', err, req.user)
  getMember(req, res, done, db)
})

const whitelist = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:4000',
  'http://localhost:4002'
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
  port: 4001,
  cors: corsOptionsDelegate,
  endpoint: '/graphql',
  subscriptions: '/graphql',
  playground: '/playground'
}

server.start(options, () => console.log(`Server is running on http://localhost:4001${server.options.endpoint}`))

module.exports= { createMember }
