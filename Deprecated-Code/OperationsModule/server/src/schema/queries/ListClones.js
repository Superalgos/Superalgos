import { GraphQLList, GraphQLString, GraphQLBoolean } from 'graphql'
import { AuthenticationError, OperationsError } from '../../errors'
import { CloneType } from '../types'
import { Clone } from '../../models'
import logger from '../../config/logger'
import getCloneStatus from '../../kubernetes/getClonePodStatus'
import getCloneLogs from '../../kubernetes/getClonePodLogs'
import cloneDetails from '../cloneDetails'
import teamQuery from '../../graphQLCalls/teamQuery'

const args = {
  botType: { type: GraphQLString },
  queryLogs: { type: GraphQLBoolean }
}

const resolve = async (parent, { botType, queryLogs }, context) => {
  logger.debug('List Clones -> Entering Fuction.')
  try {
    if (!context.userId) {
      throw new AuthenticationError()
    }

    let clones = await Clone.find({
      authId: context.userId,
      active: true
    }).sort({ createDatetime: -1 })

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

    if (queryLogs) {
      for (var i = 0; i < cloneResponse.length; i++) {
        let state = await getCloneStatus(cloneResponse[i].id)
        cloneResponse[i].state = state.substring(1, state.length - 1)

        let lastLogs = await getCloneLogs(cloneResponse[i].id)
        cloneResponse[i].lastLogs = lastLogs.substring(1, lastLogs.length - 1)
      }
    }
    if (botType) {
      var filtered = cloneResponse.filter((value) => value.botType === botType)
      return filtered
    } else {
      return cloneResponse
    }
  } catch (err) {
    logger.error('List Clones error: %s', err.stack)
    throw new OperationsError('There has been an error listing the clones.')
  }
}

const ListClones = {
  clones: {
    type: new GraphQLList(CloneType),
    args,
    resolve
  }
}

export default ListClones
