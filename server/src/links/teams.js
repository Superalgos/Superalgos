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
    }
  }
})

export default { resolver, linkSchemaDefs }
