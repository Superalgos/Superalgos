export const linkSchemaDefs =
  `
    extend type events_Event {
      host: users_User
    }
    extend type events_Inviter {
      inviter: users_User
    }
    extend type events_Formula {
      owner: users_User
    }
    extend type events_Plotter {
      owner: users_User
    }
    extend type events_Participant {
      participant: teams_Team
    }
    extend type events_Participant {
      clone: operations_GetClones
    }
    extend type events_Invitation {
      invitee: teams_Team
    }
  `

export const resolver = (usersSchema, teamsSchema, operationsSchema) => ({
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
  events_Inviter: {
    inviter: {
      fragment: `fragment UserFragment on events_Inviter{inviterId}`,
      resolve ({inviter : id}, args, context, info) {
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
  events_Formula: {
    owner: {
      fragment: `fragment UserFragment on events_Formula{ownerId}`,
      resolve ({owner : id}, args, context, info) {
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
  events_Plotter: {
    owner: {
      fragment: `fragment UserFragment on events_Plotter{ownerId}`,
      resolve ({owner : id}, args, context, info) {
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
    participant: {
      fragment: `fragment TeamFragment on events_Participant{participantId}`,
      resolve ({participantId : teamId}, args, context, info) {
        return info.mergeInfo.delegateToSchema({
          schema: teamsSchema,
          operation: 'query',
          fieldName: 'teams_TeamById',
          args: { teamId },
          context,
          info
        })
      }
    },
    clone: {
      fragment: `fragment CloneFragment on events_Participant{operationId}`,
      resolve ({operationId : cloneIdList}, args, context, info) {
        return info.mergeInfo.delegateToSchema({
          schema: operationsSchema,
          operation: 'query',
          fieldName: 'operations_GetClones',
          args: { cloneIdList },
          context,
          info
        })
      }
    }
  },
  events_Invitation: {
    invitee: {
      fragment: `fragment TeamFragment on events_Invitation{inviteeId}`,
      resolve ({inviteeId : teamId}, args, context, info) {
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
  },
})

export default { resolver, linkSchemaDefs }
