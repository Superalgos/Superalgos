export const linkSchemaDefs =
  `
    extend type operations_GetClones {
      team: teams_Team
    }
    extend type operations_GetClones {
      bot: teams_FinancialBeings
    }
    extend type operations_Clone {
      signals( orderStatus: String ): [cockpit_Signal]
    }
  `

export const resolver = (teamsSchema, cockpitSchema) => ({
  operations_Clone: {
    signals: {
      fragment: `fragment SignalFragment on operations_Clone{id}`,
      resolve ({id: cloneId}, args, context, info) {
        return info.mergeInfo.delegateToSchema({
          schema: cockpitSchema,
          operation: 'query',
          fieldName: 'cockpit_SignalsByCloneId',
          args: { ...args, cloneId },
          context,
          info
        })
      }
    }
  },
  operations_GetClones: {
    team: {
      fragment: `fragment TeamFragment on operations_GetClones{teamId}`,
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
    },
    bot: {
      fragment: `fragment TeamFragment on operations_GetClones{botId}`,
      resolve ({botId: fbId}, args, context, info) {
        return info.mergeInfo.delegateToSchema({
          schema: teamsSchema,
          operation: 'query',
          fieldName: 'teams_FbByFbId',
          args: { fbId },
          context,
          info
        })
      }
    }
  }
})

export default { resolver, linkSchemaDefs }
