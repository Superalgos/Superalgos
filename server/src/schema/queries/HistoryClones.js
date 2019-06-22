import { GraphQLList, GraphQLString } from 'graphql'
import { AuthenticationError, OperationsError } from '../../errors'
import { CloneType } from '../types'
import { Clone } from '../../models'
import logger from '../../config/logger'
import cloneDetails from '../cloneDetails'
import teamQuery from '../../graphQLCalls/teamQuery'

const args = {
  botType: { type: GraphQLString }
}

const resolve = async(parent, { botType }, context) => {
  logger.debug('Retrieving History Clones.')
  try {
    if (!context.userId) {
      throw new AuthenticationError()
    }

    let clones = await Clone.find({
      authId: context.userId,
      active: false
    }).sort({createDatetime: -1})

    let cloneResponse = []
    let allUserBotsResponse = await teamQuery(context.authorization, null)
    let allUserBots = allUserBotsResponse.data.data.teams_FbByOwner.edges

    for (var i = 0; i < clones.length; i++) {
      for (var j = 0; j < allUserBots.length; j++) {
        let bot = allUserBots[j].node
        if(clones[i].botId === bot.id){
          let clone = cloneDetails(bot, clones[i])
          cloneResponse.push(clone)
          break
        }
      }
    }

    if (botType) {
      var filtered = cloneResponse.filter((value) => value.botType === botType)
      return filtered
    } else {
      return cloneResponse
    }
  } catch (err) {
    logger.error('Retrieving History Clones error: %s', err.stack)
    throw new OperationsError('There has been an error retrieving history clones.')
  }
}

const HistoryClones = {
  historyClones: {
    type: new GraphQLList(CloneType),
    args,
    resolve
  }
}

export default HistoryClones
