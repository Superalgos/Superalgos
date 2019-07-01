import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLID,
  GraphQLFloat
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
    processName: { type: GraphQLString },
    summaryDate: {type: GraphQLInt},
    buyAverage: {type: GraphQLFloat},
    sellAverage: {type: GraphQLFloat},
    marketRate: {type: GraphQLFloat},
    combinedProfitsA: {type: GraphQLFloat},
    combinedProfitsB: {type: GraphQLFloat},
    assetA: {type: GraphQLString},
    assetB: {type: GraphQLString},
    botType: {type: GraphQLString},
    teamName: {type: GraphQLString},
    botName: {type: GraphQLString},
    botAvatar: {type: GraphQLString},
    teamAvatar: {type: GraphQLString},
    keyId: {type: GraphQLString},
    botSlug: {type: GraphQLString},
    exchangeName:{type: GraphQLString},
    timePeriod:{type: GraphQLString},
    balanceAssetA:{type: GraphQLFloat},
    balanceAssetB:{type: GraphQLFloat},
  })
})
export default CloneType
