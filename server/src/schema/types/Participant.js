import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql'

const ParticipantType = new GraphQLObjectType({
  name: 'Participant',
  fields: () => ({
    devTeam: { type: GraphQLString },
    bot: { type: GraphQLString },
    release: { type: GraphQLString }
  })
})

export default ParticipantType
