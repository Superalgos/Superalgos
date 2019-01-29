export function toPlatformDatetime (epoch) {
  const platformDate = new Date(0)
  platformDate.setUTCSeconds(epoch)
  return platformDate.toISOString()
}

export function isDefined (d) {
  return d !== null && typeof d !== 'undefined'
}

export function getJobNameFromClone (teamSlug, botSlug, mode) {
  return teamSlug + '-' + botSlug + '-' + mode.toLowerCase()
}

export function getSelectedBot(botsByUser, selectedBotId){
  if(isDefined(botsByUser)){
    for (var i = 0; i < botsByUser.fb.length; i++) {
      if(botsByUser.fb[i].id === selectedBotId){
        return botsByUser.fb[i]
      }
    }
  }
}
