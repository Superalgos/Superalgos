import logger from '../config/logger'

const cloneDetails = (authId, selectedBot, clone) => {
  logger.debug('cloneDetails -> Entering function.')

  if (selectedBot !== undefined) {
    clone.botId = selectedBot.id
    clone.kind = selectedBot.kind
    clone.botName = selectedBot.name
    clone.botSlug = selectedBot.slug
    clone.botAvatar = selectedBot.avatar

    clone.teamId = selectedBot.team.id
    clone.teamName = selectedBot.team.name
    clone.teamSlug = selectedBot.team.slug

    clone.teamAvatar = selectedBot.team.profile.avatar

    clone.userLoggedIn = selectedBot.team.members[0].member.alias // TODO change by context info if possible

    clone.botType = selectedBot.kind // Only for listing we show the teams value

    logger.debug('cloneDetails -> Retrieving clone details complete.')
  }
  return clone
}

export default cloneDetails
