# ModuleUsers


## Known Improvements

1. Remove the relationship to users, since it is not needed.

const RoleType = new GraphQLObjectType({
  name: 'Role',
  fields: () => ({
    id: { type: GraphQLID},
    name: {type: GraphQLString},
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return User.find({roleId: parent.id});
      }
    }
  })
});

2. Roles should be an Enum Type.

Since roles just have a name field, I think we should use the ENUM type... https://graphql.org/learn/schema/#enumeration-types
They would just be resolved in Mongoose/MongoDB as strings and we would validate specifcially to those strings.
Unless there's going to be many types of roles in the future.
