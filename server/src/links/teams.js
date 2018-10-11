export const linkSchemaDefs =
  `
    extend type TeamsModuleTeam {
      ownerUser: UsersModuleUser
    }
  `

export const resolver = (usersSchema) => ({
  TeamsModuleTeam: {
    ownerUser: {
      fragment: `fragment UserFragment on TeamsModuleTeam{owner}`,
      resolve (parent, args, context, info) {
        const authId = parent.owner
        return info.mergeInfo.delegateToSchema({
          schema: usersSchema,
          operation: 'query',
          fieldName: 'UsersModuleUserByAuthId',
          args: { authId },
          context,
          info
        })
      }
    }
  }
})

export default { resolver, linkSchemaDefs }
