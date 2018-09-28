require('dotenv').config();
const { GraphQLServer } = require('graphql-yoga')
const {
  Prisma,
  extractFragmentReplacements,
  forwardTo
} = require('prisma-binding')
const { makeExecutableSchema } = require('graphql-tools')
const { importSchema } = require('graphql-import')
const parser = require('fast-xml-parser')

const checkJwt = require('./auth/middleware/jwt')
const { getMember } = require('./auth/middleware/getMember')
const { validateIdToken } = require('./auth/validateIdToken')
const { directiveResolvers } = require('./auth/authDirectives')

const { sendTeamMemberInvite, verifyInviteToken } = require('./email/sendgrid')

const {
  createStoragePipline,
  createServiceURL,
  listContainers,
  createContainer,
  createBlob,
  uploadBlob,
  downloadBlob,
  deleteBlob,
  deleteContainer
} = require('./storage/azure')
//var azure = require('azure-storage')
const Azure = require("@azure/storage-blob")
const azureAccount = process.env.AZURE_STORAGE_ACCOUNT
const azureKey = process.env.AZURE_STORAGE_ACCESS_KEY
const azureStorageUrl = process.env.AZURE_STORAGE_URL

var debug = require('debug')('http')
  , http = require('http')
  , name = 'My App';

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
      console.log('currentMember: ', ctx.request.res.req.user, ctx.token)
      const authId = ctx.request.res.req.user.sub

      fetch('URL_GOES_HERE', {
        method: 'post',
        headers: new Headers({
         'Authorization': 'Basic '+btoa('username:password'),
         'Content-Type': 'application/x-www-form-urlencoded'
        }),
        body: 'A=1&B=2'
      })

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
    async teamWithRole(parent, { teamId, role }, ctx, info) {
      return ctx.db.query.teamsConnection({where: {AND: [{id: teamId},{members_some:{role: role}}]}, first:1}, info)
    },
    async teamsByOwner(parent, args, ctx, info) {
      const authId = ctx.request.user.sub
      return ctx.db.query.teams({where: { owner: authId }, orderBy:'updatedAt_DESC'}, TEAMS_FRAGMENT)
    },
    async teamsByRole(parent, args, ctx, info) {
      const authId = ctx.request.user.sub
      let teamAdmin = await ctx.db.query.teams({where: {members_some: {OR: [{role: 'ADMIN'}, {role: 'OWNER'}], AND: [{member: {authId: authId}}]}}, orderBy: 'updatedAt_DESC'}, TEAMS_FRAGMENT)
      console.log('teamsByRole teamAdmin: ', teamAdmin)
      return teamAdmin
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
    async verifyTeamInvite(parent, { token }, ctx, info) {
      let verifiedToken = null
      let team = null
      try {
        verifiedToken = await verifyInviteToken(token)
        team = {
          email: verifiedToken.email,
          team: {
            slug: verifiedToken.team
          }
        }
        console.log('verifyTeamInvite.token: ', await verifiedToken)
      } catch (err) {
        console.log('verifyTeamInvite. err: ', err)
        throw new Error(err.message)
      }
      return team
    },
    async createTeam(parent, { name, slug }, ctx, info) {
      const authId = ctx.request.user.sub
      return ctx.db.mutation.createTeam({ data: { name: name, slug: slug, owner: authId, members: { create: { member:{ connect:{ authId: authId} }, role: 'OWNER' } }, profile:{create:{avatar:"a"} } } }, TEAMS_FRAGMENT)
        .catch((err) => {
          console.log('createTeam error: ', err)
          return err
        })
    },
    async updateTeamProfile(parent, { slug, owner, description, motto, avatar, banner }, ctx, info) {
      return ctx.db.mutation.updateTeam({data:{profile: {update: {description: description, motto: motto, avatar: avatar, banner: banner}}}, where:{slug: slug}}, TEAMS_FRAGMENT)
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
    },
    async getAzureSAS(parent, { teamSlug }, ctx, info) {
      // Create start and expiry times
      let today = new Date()
      let week = new Date()
      week.setDate(today.getDate() + 7)
      // Create SharedKeyCredential and attach to pipline
      const SKC = new Azure.SharedKeyCredential(azureAccount, azureKey)
      const pipeline = Azure.StorageURL.newPipeline(SKC)
      // Create container URL
      const serviceURL = new Azure.ServiceURL(azureStorageUrl, pipeline)
      const containerName = teamSlug
      const containerURL = Azure.ContainerURL.fromServiceURL(serviceURL, containerName)

      let marker
      let containerCheck = null
      do {
        const listContainersResponse = await serviceURL.listContainersSegment(
          Azure.Aborter.None,
          marker,
        )
        console.log(`ContainerCheck marker: `, listContainersResponse)
        marker = listContainersResponse.marker;
        for (const container of listContainersResponse.containerItems) {
          console.log(`ContainerCheck: ${container.name} | ${containerName} | ${marker}`)
          if(container.name === containerName){
            containerCheck = container.name
          }
        }
      } while (marker)
      let newContainer
      if(containerCheck === null){
        newContainer = await containerURL.create(Azure.Aborter.None, { access: 'blob' })
      }
      console.log('getAzureSAS container: ', containerURL, containerCheck, newContainer)

      // Set permissions for service, resource types and containers
      const SASServicePerms = Azure.AccountSASServices.parse('b')
      const SASResourceTypes = Azure.AccountSASResourceTypes.parse('co')
      const SASContainerPerms = Azure.ContainerSASPermissions.parse('rwl')
      // Generate SAS url
      const SASQueryParameters = Azure.generateAccountSASQueryParameters(
        {
          version: '2017-11-09',
          permissions: SASContainerPerms,
          startTime: today,
          expiryTime: week,
          protocol: 'https',
          services: SASServicePerms,
          resourceTypes: SASResourceTypes
        }, SKC )
      return SASQueryParameters
    },
    async sendMemberInviteSG(parent, { email, teamId }, ctx, info) {
      const team = await ctx.db.query.team({ where: { id: teamId } }, TEAMS_FRAGMENT)
      const addMember = await ctx.db.mutation.upsertTeamMembers({
        where:{email: email},
        create:{role:'MEMBER', email:email, team: {connect: {id: teamId}}, status:{create:{status: 'INVITED', reason: `Invited by ${team.members[0].member.alias}`}}},
        update:{role: 'MEMBER', email: email, team: {connect: {id: teamId}}, status:{create:{status: 'INVITED', reason: `Invite resent by ${team.members[0].member.alias}`}}}},
        `{ id }`)
      const sendInvite = await sendTeamMemberInvite(email, team)
      return sendInvite
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
    // console.log('checkJwt: ', err, req)
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
