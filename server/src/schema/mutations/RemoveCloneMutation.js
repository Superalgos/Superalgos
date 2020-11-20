import { GraphQLNonNull, GraphQLID, GraphQLString } from 'graphql'
import { AuthenticationError, OperationsError } from '../../errors'
import { Clone } from '../../models'
import logger from '../../config/logger'
import removeKuberneteClone from '../../kubernetes/removeClone'
import teamQuery from '../../graphQLCalls/teamQuery'
import { isDefined } from '../../config/utils'
import cloneDetails from '../cloneDetails'
import authorizeKey from '../../graphQLCalls/authorizeKey'
import { LIVE, COMPETITION, BACKTEST } from '../../enums/CloneMode'
import { Trading } from '../../enums/BotTypes'
import removeBotMutation from '../../graphQLCalls/removeBotMutation'

const args = { id: { type: new GraphQLNonNull(GraphQLID) } }

const resolve = async (parent, { id }, context) => {
  logger.debug('removeClone -> Entering Fuction.')

  if (!context.userId) {
    throw new AuthenticationError()
  }
  try {
    let clone = await Clone.findOne({
      _id: id,
      authId: context.userId,
      active: true
    })

    if (!isDefined(clone)) {
      throw new OperationsError('You are not authorized to remove this clone.')
    }

    let allUserBotsResponse = await teamQuery(context.authorization, clone.botId)
    let bot = allUserBotsResponse.data.data.teams_FbByOwner.edges[0].node
    clone = cloneDetails(bot, clone)

    if ((clone.mode === LIVE || clone.mode === COMPETITION) && isDefined(clone.keyId)) {
      logger.debug('removeClone -> Release the clone key.')
      await authorizeKey(context.authorization, clone.keyId, clone.id, true)
    }

    logger.debug('removeClone -> Removing Clone from Kubernates.')
    await removeKuberneteClone(clone.id)

    const query = {
      _id: id,
      authId: context.userId
    }
    const options = { new: true }
    const update = { active: false }

    return new Promise((res, rej) => {
      Clone.findOneAndUpdate(query, update, options, (err, doc) => {
        if (err) {
          logger.error('removeClone -> Error removing clone from the DB. %s', err.stack)
          rej(err)
          return
        }
        logger.debug('removeClone -> Clone Removed from the DB.')
        res('Clone Removed.')
      })
    })
  } catch (error) {
    logger.error('Error removing the clone. %s', error.stack)
    throw new OperationsError(error.message)
  }
}

const RemoveCloneMutation = {
  removeClone: {
    type: GraphQLString,
    args,
    resolve
  }
}

export default RemoveCloneMutation
