import logger from '../config/logger'
import { isDefined } from '../config/utils'
import { AutorizationError } from '../errors'

const cloneDetails = async(authId, team, clone) => {
  logger.debug('Retrieving clone details.')

  // TODO Pending improvement by authorization module
  if(!(authId === process.env.AACLOUD_ID || isAuthorized(team, authId))){
    logger.debug('User %s is not authorized to manage team %s.', authId, team.slug )
    throw new AutorizationError()
  }

  let selectedBot = getSelectedBot(team, clone.botId)
  clone.teamId = team.id
  clone.botId = selectedBot.id
  clone.kind = selectedBot.kind
  clone.teamSlug = team.slug
  clone.botSlug = selectedBot.slug
  clone.cloneName = clone.teamSlug + '-' + clone.botSlug + '-' + clone.mode.toLowerCase()
  clone.teamName = team.name
  clone.botName = selectedBot.name
  clone.botAvatar = selectedBot.avatar
  clone.teamAvatar = team.profile.avatar
  clone.userLoggedIn = team.members[0].member.alias //TODO change by context info if possible

  logger.debug('Retrieving clone details complete.')
  return clone
};

function getSelectedBot(team, selectedBotId){
  logger.debug('Getting selected bot.')
  if(isDefined(team)){
    for (var i = 0; i < team.fb.length; i++) {
      if(team.fb[i].id === selectedBotId){
        return team.fb[i]
      }
    }
  }
}

function isAuthorized(team, authId){
  logger.debug('Checking if the user is authorized by the teams module.')
  let authorized = false
  if(isDefined(team)){
    for (var i = 0; i < team.members.length; i++) {
      if(team.members[i].member.authId === authId){
        authorized = true
        break
      }
    }
  }
  return authorized
}

export default cloneDetails
