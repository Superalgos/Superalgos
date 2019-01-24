export function toPlatformDatetime (epoch) {
  const platformDate = new Date(0)
  platformDate.setUTCSeconds(epoch)
  return platformDate.toISOString()
}

export function isDefined (d) {
  return d !== null && typeof d !== 'undefined'
}

export function getJobNameFromClone (clone) {
  return clone.teamId + '-' + clone.botId + '-' + clone.mode.toLowerCase()
}
