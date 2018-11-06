import { logger, AuthenticationError, DatabaseError } from '../../../logger'

export const member = async (parent, arg, ctx, info) => {
  logger.info(' --> resolver.member')
  logger.info(ctx.request.headers.userid)
  const authId = ctx.request.headers.userid
  if (!authId) {
    throw new AuthenticationError()
  }
  return ctx.db.query.member({ where: { authId } }, info)
    .catch(err => {
      logger.debug('resolver.member error: ')
      logger.debug(err)
      throw new DatabaseError(`Member Data Error: ${err.message}`)
    })
}

export const owner = async (parent, args, ctx, info) => {
  logger.info('resolver.query.owner ctx: ')
  logger.info(ctx.request.headers.userid)
  const authId = cctx.request.headers.userid
  if (!authId) {
    throw new AuthenticationError()
  }
  return ctx.db.query.member({ where: { authId: authId } }, info)
    .catch(err => {
      logger.debug('resolver.owner error: ')
      logger.debug(err)
      throw new DatabaseError(`Member Data Error: ${err.message}`)
    })
}
