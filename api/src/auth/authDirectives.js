const _get = require('lodash.get')
const { validateIdToken } = require('./validateIdToken')

const memberLocationOnContext = 'request.user'
const bearerAccessToken = 'request.headers.authorization'

const ctxMember = ctx => _get(ctx, memberLocationOnContext)
const ctxToken = ctx => _get(ctx, bearerAccessToken)

const createMember = async (ctx, idToken, info) => {
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

const isLoggedIn = async ctx => {
    let member = ctxMember(ctx, memberLocationOnContext)
    let token = ctxToken(ctx, bearerAccessToken)
    let memberToken
    console.log('isLoggedIn: ', ctx, member, token)
    if (!member && token) {
      let scheme, credentials
      const tokenParts = token.split(' ')
      if (tokenParts.length === 2) {
        scheme = tokenParts[0]
        credentials = tokenParts[1]
      }

     if (/^Bearer$/i.test(scheme)) {
       token = credentials
       //verify token
       console.log('isLoggedIn2 : ', token)
       try {
         memberToken = await validateIdToken(token)
         const authId = memberToken.sub
         console.log('isLoggedIn3 : ', await authId, ctx.db.query.member)
         exists = await ctx.db.query.member({ where: { authId: authId } })
         console.log('isLoggedIn4 : ', await exists, createMember )
         if (!member && exists === null) {
           member = await createMember(ctx, memberToken).then(res => {
              console.log('isLoggedIn5 : ', res)
              return res
           })

           return member
         }
          return member
       } catch (err) {
         memberToken = false
       }
     }
    }
    console.log('isLoggedIn5 : ', await member)
    if (!member) {
      throw new Error(`Not logged in`)
    }
    return member
}


const isRequestingMemberAlsoOwner = ({ ctx, memberId, type, typeId }) =>
  ctx.db.exists[type]({ slug: typeId, owner: memberId })
const isRequestingMember = ({ ctx, memberId }) => ctx.db.exists.Member({ authId: memberId })

const directiveResolvers = {
  isAuthenticated: async (next, source, args, ctx) => {
    let result = await isLoggedIn(ctx)
    console.log('directive isAuthenticated: ', result)
    return next(result)
  },
  hasRole: (next, source, { roles }, ctx) => {
    const { role } = isLoggedIn(ctx)
    console.log('directive hasRole: ', role)
    if (roles.includes(role)) {
      return next()
    }
    throw new Error(`Unauthorized, incorrect role`)
  },
  isOwner: async (next, source, { type }, ctx) => {
    console.log('directive isOwner: ', source, type, ctx)
    const { slug: typeId } =
      source && source.id
        ? source
        : ctx.request.body.variables ? ctx.request.body.variables : { id: null }
    const user = await isLoggedIn(ctx)
    console.log('directive isOwner 0: ', typeId, user.sub)
    const memberId = user.sub
    const isOwner =
      type === `Member`
        ? memberId === typeId
        : await isRequestingMemberAlsoOwner({ ctx, memberId, type, typeId })
    console.log('directive isOwner 1: ', source, isOwner, type, typeId, memberId)
    if (isOwner) {
      return next()
    }
    throw new Error(`Unauthorized, must be owner`)
  },
  isOwnerOrHasRole: async (next, source, { roles, type }, ctx, ...p) => {
    const { authId: memberId } = await isLoggedIn(ctx)
    console.log('directive isOwnerOrHasRole 1: ', memberId, roles, type)
    if(memberId === undefined && role=== undefined) throw new Error(`Not logged in`)
    if (roles.includes(role)) {
      return next()
    }

    const { authId: typeId } = ctx.request.body.variables
    const isOwner = await isRequestingMemberAlsoOwner({
      ctx,
      memberId,
      type,
      typeId
    })
    console.log('directive isOwnerOrHasRole 2: ', typeId, memberId, role, isOwner)
    if (isOwner) {
      return next()
    }

    const hasRole = await isRequestingMember({
      ctx,
      memberId,
      type,
      typeId
    })
    if(hasRole){
      return next()
    }
    throw new Error(`Unauthorized, not owner or incorrect role`)
  }
}

module.exports = { directiveResolvers }
