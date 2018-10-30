export const linkSchemaDefs =
  `
    extend type hosts_Event {
      host: users_User
    }
    extend type hosts_Participant {
      team: teams_Team
    }
  `

export const resolver = (usersSchema, teamsSchema) => ({
  hosts_Event: {
    host: {
      fragment: `fragment UserFragment on hosts_Event{hostId}`,
      resolve (parent, args, context, info) {
        return info.mergeInfo.delegateToSchema({
          schema: usersSchema,
          operation: 'query',
          fieldName: 'users_User',
          args: { id: parent.hostId },
          context,
          info
        })
      }
    }
  },
  hosts_Participant: {
    team: {
      fragment: `fragment TeamFragment on hosts_Participant{teamId}`,
      resolve (parent, args, context, info) {
        return info.mergeInfo.delegateToSchema({
          schema: teamsSchema,
          operation: 'query',
          fieldName: 'teams_TeamById',
          args: { teamId: parent.teamId },
          context,
          info
        })
      }
    }
  }
})

export default { resolver, linkSchemaDefs }
