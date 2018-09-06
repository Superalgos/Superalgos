const _get = require('lodash.get')
const validateAndParseIdToken = require('./helpers/validateAndParseIdToken')
const createMember  = require('./index')

const memberLocationOnContext = 'request.member'
const bearerAccessToken = 'request.headers.authorization'

const ctxMember = ctx => _get(ctx, memberLocationOnContext)
const ctxToken = ctx => _get(ctx, bearerAccessToken)

const isLoggedIn = async ctx => {
    let member = ctxMember(ctx, memberLocationOnContext)
    let token = ctxToken(ctx, bearerAccessToken)
    let memberToken

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
       try {
         memberToken = await validateAndParseIdToken(token)
         const auth0id = memberToken.sub

         member = await ctx.db.query.member({ where: { auth0id } })

         if (!member) {
           member = await createMember(ctx, memberToken)
         }
       } catch (err) {
         memberToken = false
       }
     }
    }

    if (!member) {
      throw new Error(`Not logged in`)
    }
    return member
}


const isRequestingMemberAlsoOwner = ({ ctx, memberId, type, typeId }) =>
  ctx.db.exists[type]({ id: typeId, owner: { auth0id: memberId } })
const isRequestingMember = ({ ctx, memberId }) => ctx.db.exists.Member({ auth0id: memberId })

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
    const { id: typeId } =
      source && source.id
        ? source
        : ctx.request.body.variables ? ctx.request.body.variables : { id: null }
    const { auth0id: memberId } = await isLoggedIn(ctx)
    console.log('directive isOwner 0: ', type, typeId, memberId)
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
    const { auth0id: memberId } = await isLoggedIn(ctx)
    console.log('directive isOwnerOrHasRole 1: ', memberId, roles, type)
    if(memberId === undefined && role=== undefined) throw new Error(`Not logged in`)
    if (roles.includes(role)) {
      return next()
    }

    const { auth0id: typeId } = ctx.request.body.variables
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
