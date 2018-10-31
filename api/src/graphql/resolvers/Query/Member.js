import { logger, AuthentificationError, DatabaseError } from '../../../logger'

export const member = async (parent, arg, ctx, info) => {
  logger.info(ctx.request.userId, ' --> resolver.member')
  const authId = ctx.request.userId
  if (!authId) {
    throw new AuthentificationError()
  }
  return ctx.db.query.member({ where: { authId: arg.authId } }, info)
    .catch(err => {
      logger.debug('resolver.member error: ')
      logger.debug(err)
      throw new DatabaseError(`Member Data Error: ${err.message}`)
    })
}

export const owner = async (parent, args, ctx, info) => {
  logger.info('resolver.query.owner ctx: ')
  const authId = ctx.request.userId
  if (!authId) {
    return throw new AuthentificationError()
  }
  return ctx.db.query.member({ where: { authId: authId } }, info)
    .catch(err => {
      logger.debug('resolver.owner error: ')
      logger.debug(err)
      throw new DatabaseError(`Member Data Error: ${err.message}`)
    })
}
