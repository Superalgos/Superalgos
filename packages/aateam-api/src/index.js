const { GraphQLServer } = require('graphql-yoga')
const {
  Prisma,
  extractFragmentReplacements,
  forwardTo
} = require('prisma-binding')
const { makeExecutableSchema } = require('graphql-tools')
const { importSchema } = require('graphql-import')
const { checkJwt } = require('./middleware/jwt')
const { getMember } = require('./middleware/getMember')
const validateAndParseIdToken = require('./helpers/validateAndParseIdToken')
const { directiveResolvers } = require('./directives')

const createPrismaMember = async function (ctx, info, idToken) {
  console.log('createPrismaMember', idToken)
  const member = await ctx.db.mutation.upsertMember({
    where: {
      auth0id: idToken.sub,
    },
    create: {
      auth0id: idToken.sub,
      nickname: idToken.nickname,
      profile: {
        create: {
          email: idToken.email,
          avatar: idToken.picture
        }
      }
    },
    update: {
      auth0id: idToken.sub,
      nickname: idToken.nickname,
      profile: {
        update: {
          email: idToken.email,
          avatar: idToken.picture
        }
      }
    }
  }, info)
  return member
}
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
          return createPrismaMember(ctx, info, memberToken)
        } catch (error) {
          try {
            return createPrismaMember(ctx, info, memberToken)
          } catch (error) {
            throw new Error(error.message)
          }
        }
      }
      return member
    },
    async createTeam(parent, { name, slug, owner }, ctx, info) {
      ctx.db.mutation.createTeam({
        data: {
          name: name,
          slug: slug,
          owner: {connect:{auth0id: owner}},
          members: {create: {role: 'OWNER', member: {connect: {auth0id: owner}}}}
        }
      }, info)
    },
    async deleteTeam(parent, { id, owner }, ctx, info) {
      ctx.db.mutation.deleteTeam({ where: { id } }, info)
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

console.log(process.env.PRISMA_ENDPOINT)
const schema = makeExecutableSchema({
  typeDefs: importSchema('src/schema.graphql'),
  resolvers,
  resolverValidationOptions :{ requireResolversForResolveType: false },
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
    console.log('server.express.post:',err, req, res, next, req.token)
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
