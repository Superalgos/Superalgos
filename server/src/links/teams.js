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
      tradingSystem: strategizer_TradingSystem
    }
  `

export const resolver = (usersSchema, eventsSchema, strategizerSchema) => ({
  teams_FinancialBeings: {
    tradingSystem: {
      fragment: `fragment TradingSystemFragment on teams_FinancialBeings{slug}`,
      resolve ({slug: fbSlug}, args, context, info) {
        return info.mergeInfo.delegateToSchema({
          schema: strategizerSchema,
          operation: 'query',
          fieldName: 'strategizer_TradingSystemByFb',
          args: { fbSlug },
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
