require('dotenv').config();
const { GraphQLServer } = require('graphql-yoga')
const {
  Prisma,
  extractFragmentReplacements,
  forwardTo
} = require('prisma-binding')
const { makeExecutableSchema } = require('graphql-tools')
const { importSchema } = require('graphql-import')

const checkJwt = require('./auth/middleware/jwt')
const { getMember } = require('./auth/middleware/getMember')
const { validateIdToken } = require('./auth/validateIdToken')
const { directiveResolvers } = require('./auth/authDirectives')

const TEAMS_FRAGMENT = require('./graphql/TeamsFragment')
const TEAMS_CONNECTIONS_FRAGMENT = require('./graphql/TeamsConnectionsFragment')

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

const ctxMember = ctx => ctx.request.user

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
      return ctx.db.query.teamsConnection({}, TEAMS_CONNECTIONS_FRAGMENT)
    },
    async teamById(parent, { id }, ctx, info) {
      return ctx.db.query.team({ where: { id } }, info)
    },
    async teamByName(parent, { name }, ctx, info) {
      return ctx.db.query.team({ where: { name: name } }, `{ name }`)
    },
    async teamsByOwner(parent, { ownerId }, ctx, info) {
      console.log('teamsByOwner: ', ctx.user)
      return ctx.db.query.teams({where: { owner: ownerId }, orderBy:'updatedAt_DESC'}, TEAMS_FRAGMENT)
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
      return ctx.db.mutation.createTeam({ data: { name: name, slug: slug, owner: owner, members: { create: { member:{ connect:{ authId: owner} }, role: 'OWNER' } } } }, TEAMS_FRAGMENT)
        .catch((err) => {
          console.log('createTeam error: ', err)
          return err
        })
    },
    async updateTeamProfile(parent, { slug, owner, description, motto, avatar }, ctx, info) {
      return ctx.db.mutation.updateTeam({data:{profile: {update: {description: description, motto: motto, avatar: avatar}}}, where:{slug: slug}}, TEAMS_FRAGMENT)
        .catch((err) => {
          console.log('createTeam error: ', err)
          return err
        })
    },
    async deleteTeam(parent, { slug }, ctx, info) {
      return ctx.db.mutation.deleteTeam({ where: { slug } }, info)
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
    token: req.headers,
    user: req.user,
    db,
    ...req
  }),
})

server.express.use(
  server.options.endpoint,
  checkJwt,
  function (err, req, res, next) {
    console.log('checkJwt: ', err, req)
    if (err) {
      return res.status(201).send(err.message)
    } else {
      next()
    }
  }
)

server.express.post(server.options.endpoint, (req, res, done) => getUser(req, res, done, db))

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
