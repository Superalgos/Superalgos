import axios from 'axios'

import { logger, DatabaseError } from '../logger'

export const getMember = async (req, res, next, db) => {
  if (!req.headers.userId) return next()
  logger.debug('getMember ')
  logger.debug(req.headers.userId)
  try {
    const member = await getUser(req.headers.userId)
    req.user = await member
    logger.debug('getMember - getUser:')
    logger.debug(req.user)
    next()
  } catch (err) {
    logger.debug('getMember - error:')
    logger.debug(err)
    next()
  }

}

export default getMember
