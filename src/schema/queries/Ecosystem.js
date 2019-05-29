import logger from '../../utils/logger'
import { Ecosystem } from '../../models'
import { EcosystemType } from '../types'

const args = {}

const resolve = async (parent, args, context) => {
  logger.debug('getEcosystem -> Entering Function.')

  try {
    if (!context.userId) {
      logger.debug('getEcosystem -> User not logged in, returning default ecosystem.')
      let defaultEcosystem = require('../../config/ecosystem.json')
      return defaultEcosystem
    } else {
      let userEcosystem = await Ecosystem.findOne({
        authId: context.userId
      })

      if (!userEcosystem) {
        logger.debug('addTeam -> Ecosystem not found for the user, retrieving default.')
          let defaultEcosystem = require('../../config/ecosystem.json')
        return defaultEcosystem
      }

      return userEcosystem
    }
  } catch (err) {
    logger.error('getEcosystem -> Error: %s', err.stack)
    throw err
  }
}

const query = {
  getEcosystem: {
    type: EcosystemType,
    args,
    resolve,
  }
}

export default query
