import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLID
} from 'graphql'
import {
  PlotterType,
  RuleType,
  ParticipantType,
  PrizeType
} from './index'

const CompetitionType = new GraphQLObjectType({
  name: 'Competition',
  fields: () => ({
    codeName: { type: GraphQLID },
    displayName: { type: GraphQLString },
    host: { type: GraphQLString },
    description: { type: GraphQLString },
    startDatetime: { type: GraphQLInt },
    finishDatetime: { type: GraphQLInt },
    formula: { type: GraphQLString },
    plotter: {
      type: PlotterType,
      resolve (parent, args) {
        return parent.plotter
      }
    },
    rules: {
      type: new GraphQLList(RuleType),
      resolve (parent, args) {
        return parent.rules
      }
    },
    participants: {
      type: new GraphQLList(ParticipantType),
      resolve (parent, args) {
        return parent.participants
      }
    },
    prizes: {
      type: new GraphQLList(PrizeType),
      resolve (parent, args) {
        return parent.prizes
      }
    }
  })
})

export default CompetitionType
