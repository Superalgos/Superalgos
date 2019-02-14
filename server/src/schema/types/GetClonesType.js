import { GraphQLObjectType, GraphQLID } from 'graphql'

const GetClonesType = new GraphQLObjectType({
  name: 'GetClones',
  fields: () => ({
    id: {type: GraphQLID},
    teamId: {type: GraphQLID},
    botId: {type: GraphQLID}
  })
})
export default GetClonesType
