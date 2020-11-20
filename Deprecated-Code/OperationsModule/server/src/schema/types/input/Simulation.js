import {
  GraphQLString,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLBoolean
} from 'graphql'

const Type = new GraphQLInputObjectType({
  name: 'SimulationInput',
  fields: () => ({
    beginDatetime: { type: new GraphQLNonNull(GraphQLInt) },
    timePeriodDailyArray: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    timePeriodMarketArray: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    resumeExecution: { type: GraphQLBoolean }
  })
})

export default Type
