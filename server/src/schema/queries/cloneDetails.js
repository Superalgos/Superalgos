import logger from '../../config/logger'
import { getJobNameFromClone, getSelectedBot } from '../../config/utils'
import teamAvatar from '../../graphQLCalls/teamAvatar'

const cloneDetails = async(authorization, botsByUser, clone) => {
  logger.debug('Retrieving clone details.')
  // TODO Refactor this code once financial beings api is ready
  let selectedBot = getSelectedBot(botsByUser.data.data.teams_FbByTeamMember, clone.botId)
  clone.cloneName = getJobNameFromClone(botsByUser.data.data.teams_FbByTeamMember.slug, selectedBot.slug, clone.mode)
  clone.kind = selectedBot.kind
  clone.teamName = botsByUser.data.data.teams_FbByTeamMember.name
  clone.botName = selectedBot.name
  clone.botAvatar = selectedBot.avatar

  let team = await teamAvatar(authorization, botsByUser.data.data.teams_FbByTeamMember.id)
  clone.teamAvatar = team.data.data.teams_TeamById.profile.avatar
  logger.debug('Retrieving clone details complete.')
  return clone
};

export default cloneDetails
