export const linkSchemaDefs =
  `
    extend type teams_Team {
      ownerUser: users_User
    }
  `

export const resolver = (usersSchema) => ({
  teams_Team: {
    ownerUser: {
      fragment: `fragment UserFragment on teams_Team{owner}`,
      resolve (parent, args, context, info) {
        const authId = parent.owner
        return info.mergeInfo.delegateToSchema({
          schema: usersSchema,
          operation: 'query',
          fieldName: 'users_UserByAuthId',
          args: { authId },
          context,
          info
        })
      }
    }
  }
})

export default { resolver, linkSchemaDefs }
