export const linkSchemaDefs =
  `
    extend type events_Event {
      host: users_User
    }
    extend type events_Participant {
      team: teams_Team
    }
  `

export const resolver = (usersSchema, teamsSchema) => ({
  events_Event: {
    host: {
      fragment: `fragment UserFragment on events_Event{hostId}`,
      resolve ({hostId : id}, args, context, info) {
        return info.mergeInfo.delegateToSchema({
          schema: usersSchema,
          operation: 'query',
          fieldName: 'users_User',
          args: { id },
          context,
          info
        })
      }
    }
  },
  events_Participant: {
    team: {
      fragment: `fragment TeamFragment on events_Participant{teamId}`,
      resolve ({teamId}, args, context, info) {
        return info.mergeInfo.delegateToSchema({
          schema: teamsSchema,
          operation: 'query',
          fieldName: 'teams_TeamById',
          args: { teamId },
          context,
          info
        })
      }
    }
  }
})

export default { resolver, linkSchemaDefs }
