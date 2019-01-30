import logger from '../config/logger'
import { getJobNameFromClone, getSelectedBot } from '../config/utils'
import teamAvatar from '../graphQLCalls/teamAvatar'

// TODO Refactor this code once financial beings api is ready
const cloneDetails = async(authorization, botsByUser, clone) => {
  logger.debug('Retrieving clone details.')

  let selectedBot = getSelectedBot(botsByUser.data.data.teams_FbByTeamMember, clone.botId)
  clone.teamId = botsByUser.data.data.teams_FbByTeamMember.id
  clone.botId = selectedBot.id
  clone.teamSlug = botsByUser.data.data.teams_FbByTeamMember.slug
  clone.botSlug = selectedBot.slug
  clone.cloneName = getJobNameFromClone(clone)
  clone.teamName = botsByUser.data.data.teams_FbByTeamMember.name
  clone.botName = selectedBot.name
  clone.botAvatar = selectedBot.avatar
  let team = await teamAvatar(authorization, botsByUser.data.data.teams_FbByTeamMember.id)
  clone.teamAvatar = team.data.data.teams_TeamById.profile.avatar
  clone.userLoggedIn = botsByUser.data.data.teams_FbByTeamMember.members[0].member.alias //TODO change by context info if possible

  logger.debug('Retrieving clone details complete.')
  return clone
};

export default cloneDetails
