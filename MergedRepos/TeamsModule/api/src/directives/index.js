import { SchemaDirectiveVisitor } from 'apollo-server-express'
import _get from 'lodash/get'
import { logger, AuthenticationError, DatabaseError } from '../logger'

const memberLocationOnContext = 'request.user'
const userIdOnContext = 'request.headers.userid'
const bearerAccessToken = 'request.headers.authorization'

const ctxUserId = ctx => _get(ctx, userIdOnContext)
const ctxMember = ctx => _get(ctx, memberLocationOnContext)
const ctxToken = ctx => _get(ctx, bearerAccessToken)

const createMember = async (ctx, idToken, info) => {
  logger.info(`createMember: ${idToken}`)
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

const isUserId = async ctx => {
  logger.info(`isUserId 0: ${ctx.request.headers.userid}`)
  logger.info(`isUserId 1: ${ctx.request}`)
  let member = await ctxUserId(ctx)
  logger.info(member)
  if (!member) {
    throw new AuthenticationError()
    return
  } else {
    return member
  }
}

const isRequestingMemberAlsoOwner = ({ ctx, memberId, type, teamSlug }) =>
  ctx.db.exists[type]({ slug: teamSlug, owner: memberId })
const isRequestingMember = ({ ctx, memberId }) => ctx.db.exists.Member({ authId: memberId })


const getUser = ({ req = {}, request = {} }) => req.user || request.user || null
const hasRole = (roles, ctx) => {
  const { role = '' } = getUser(ctx) || {}
  return role && roles.includes(role)
}

const assertAuth = ctx => {
  if (!getUser(ctx)) {
    throw new AuthenticationError('Access token is missing or expired')
  }
}

// Directive resolvers (apollo v1 syntax)
export const directiveResolvers = {
  isAuthenticated: async (next, source, args, ctx) => {
    let result = await isUserId(ctx)
    logger.info('directive isAuthenticated: ')
    logger.info(await result)
    return next(result)
  },
  hasRole: (next, source, { roles }, ctx) => {
    const { role } = isUserId(ctx)
    logger.info('directive hasRole: ', role)
    if (roles.includes(role)) {
      return next()
    }
    throw new AuthenticationError('Insufficient permissions')
  },
  isOwner: async (next, source, { type }, ctx) => {
    logger.info('directive isOwner: ', source, type, ctx)
    logger.info(ctx.request.body.variables)
    logger.info(type)
    const { _v0_slug: typeId } = ctx.request.body.variables ? ctx.request.body.variables : { _v0_slug: null }
    logger.info('typeId')
    logger.info(typeId)
    const userId = await isUserId(ctx)
    const isOwner =
      type === `Member`
        ? memberId === typeId
        : await isRequestingMemberAlsoOwner({ ctx, userId, type, typeId })
        logger.info('isOwner')
        logger.info(isOwner)
    if (isOwner) {
      return next()
    }
    throw new AuthenticationError('Insufficient permissions')
  },
  isOwnerOrHasRole: async (next, source, { roles, type }, ctx, ...p) => {
    const userId = await isUserId(ctx)
    logger.info('directive isOwnerOrHasRole 1: ', userId, roles, type)
    if(userId === undefined && role=== undefined) throw new Error(`Not logged in`)
    if (roles.includes(role)) {
      return next()
    }

    const { teamSlug } = ctx.request.body.variables
    const isOwner = await isRequestingMemberAlsoOwner({
      ctx,
      userId,
      type,
      teamSlug
    })
    logger.info('directive isOwnerOrHasRole 2: ', teamSlug, userId, role, isOwner)
    if (isOwner) {
      return next()
    }

    const hasRole = await isRequestingMember({
      ctx,
      userId,
      type,
      teamSlug
    })
    if(hasRole){
      return next()
    }
    throw new AuthenticationError('Insufficient permissions')
  }
}

export const defaultFieldResolver = (source, args, contextValue, info) => {
  // ensure source is a value for which property access is acceptable.
  if (typeof source === 'object' || typeof source === 'function') {
    const property = source[info.fieldName]
    if (typeof property === 'function') {
      return source[info.fieldName](args, contextValue, info)
    }
    return property
  }
}

// Schema directives (apollo v2 syntax)
export const schemaDirectives = Object.keys(directiveResolvers).reduce(
  (acc, directiveName) => ({
    ...acc,
    [directiveName]: class extends SchemaDirectiveVisitor {
      visitFieldDefinition(field) {
        const resolver = directiveResolvers[directiveName]
        const originalResolver = field.resolve || defaultFieldResolver
        const directiveArgs = this.args
        field.resolve = (...args) => {
          const [source, , context, info] = args
          return resolver(
            async () => originalResolver.apply(field, args),
            source,
            directiveArgs,
            context,
            info
          )
        }
      }
    },
  }),
  {}
)
