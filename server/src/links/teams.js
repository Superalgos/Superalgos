export const linkSchemaDefs =
  `
    extend type teams_Team {
      ownerUser: users_User
    }
    extend type teams_Team {
      events(
        hostId: String,
        inviteeId: String,
        minStartDate: Int,
        maxStartDate: Int,
        minEndDate: Int,
        maxEndDate: Int
        ): [events_Event]
    }
    extend type teams_FinancialBeings {
      strategy: strategizer_Strategy
    }
  `

export const resolver = (usersSchema, eventsSchema, strategizerSchema) => ({
  teams_FinancialBeings: {
    strategy: {
      fragment: `fragment StrategyFragment on teams_FinancialBeings{id}`,
      resolve ({id: fbId}, args, context, info) {
        return info.mergeInfo.delegateToSchema({
          schema: usersSchema,
          operation: 'query',
          fieldName: 'strategizer_StrategyByFb',
          args: { fbId },
          context,
          info
        })
      }
    }
  },
  teams_Team: {
    ownerUser: {
      fragment: `fragment UserFragment on teams_Team{owner}`,
      resolve ({owner: id}, args, context, info) {
        return info.mergeInfo.delegateToSchema({
          schema: usersSchema,
          operation: 'query',
          fieldName: 'users_User',
          args: { id },
          context,
          info
        })
      }
    },
    events: {
      fragment: `fragment EventFragment on teams_Team{id}`,
      resolve ({id: participantId}, args, context, info) {
        return info.mergeInfo.delegateToSchema({
          schema: eventsSchema,
          operation: 'query',
          fieldName: 'events_Events',
          args: { ...args, participantId },
          context,
          info
        })
      }
    }
  }
})

export default { resolver, linkSchemaDefs }
