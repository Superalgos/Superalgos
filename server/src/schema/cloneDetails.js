const cloneDetails = (selectedBot, clone) => {
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
    clone.botType = selectedBot.kind
  }
  return clone
}

export default cloneDetails
