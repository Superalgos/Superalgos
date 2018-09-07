const _get = require('lodash.get')
const validateParseIdToken = require('./validate-auth0-token')
const createUser  = require('./index')

const userLocationOnContext = 'request.user'
const bearerAccessToken = 'request.headers.authorization'

const ctxUser = ctx => _get(ctx, userLocationOnContext)
const ctxToken = ctx => _get(ctx, bearerAccessToken)

const isLoggedIn = async ctx => {
    let user = ctxUser(ctx, userLocationOnContext)
    let token = ctxToken(ctx, bearerAccessToken)
    let userToken

    if (!user && token) {
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
         userToken = await validateParseIdToken(token)
         const auth0id = userToken.sub

         user = await ctx.db.query.user({ where: { auth0id } })

         if (!user) {
           user = await createUser(ctx, userToken)
         }
       } catch (err) {
         userToken = false
       }
     }
    }

    if (!user) {
      throw new Error(`Not logged in`)
    }
    return user
}


const isRequestingUserAlsoOwner = ({ ctx, userId, type, typeId }) =>
  ctx.db.exists[type]({ id: typeId, owner: { auth0id: userId } })
const isRequestingUser = ({ ctx, userId }) => ctx.db.exists.User({ auth0id: userId })

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
  }
}

module.exports = { directiveResolvers }
