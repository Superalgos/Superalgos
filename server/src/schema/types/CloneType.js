import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLID
} from 'graphql'

const CloneType = new GraphQLObjectType({
  name: 'Clone',
  fields: () => ({
    id: {type: GraphQLID},
    authId: {type: GraphQLID},
    teamId: {type: GraphQLString},
    botId: {type: GraphQLString},
    mode: {type: GraphQLString},
    resumeExecution: {type: GraphQLBoolean},
    beginDatetime: {type: GraphQLInt},
    endDatetime: {type: GraphQLInt},
    waitTime: {type: GraphQLInt},
    state: {type: GraphQLString},
    stateDatetime: {type: GraphQLInt},
    createDatetime: {type: GraphQLInt},
    lastLogs: {type: GraphQLString},
    runAsTeam: {type: GraphQLBoolean}
  })
})
export default CloneType
