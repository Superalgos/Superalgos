import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} from 'graphql'
import { slugify } from './utils/functions'
import Competition from './models/competition'

const PlotterType = new GraphQLObjectType({
  name: 'Plotter',
  fields: () => ({
    codeName: { type: GraphQLString },
    host: { type: GraphQLString },
    repo: { type: GraphQLString },
    moduleName: { type: GraphQLString }
  })
})

const RuleType = new GraphQLObjectType({
  name: 'Rule',
  fields: () => ({
    number: { type: GraphQLInt },
    title: { type: GraphQLString },
    description: { type: GraphQLString }
  })
})

const ParticipantType = new GraphQLObjectType({
  name: 'Participant',
  fields: () => ({
    devTeam: { type: GraphQLString },
    bot: { type: GraphQLString },
    release: { type: GraphQLString }
  })
})

const OtherPrizeType = new GraphQLObjectType({
  name: 'OtherPrize',
  fields: () => ({
    condition: { type: GraphQLString },
    amount: { type: GraphQLInt },
    asset: { type: GraphQLString }
  })
})

const PrizeType = new GraphQLObjectType({
  name: 'Prize',
  fields: () => ({
    position: { type: GraphQLInt },
    algoPrize: { type: GraphQLInt },
    otherPrizes: {
      type: new GraphQLList(OtherPrizeType),
      resolve (parent, args) {
        return parent.otherPrizes
      }
    }
  })
})

const CompetitionType = new GraphQLObjectType({
  name: 'Competition',
  fields: () => ({
    codeName: { type: GraphQLID },
    displayName: { type: GraphQLString },
    host: { type: GraphQLString },
    description: { type: GraphQLString },
    startDatetime: { type: GraphQLString },
    finishDatetime: { type: GraphQLString },
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

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    competitions: {
      type: new GraphQLList(CompetitionType),
      resolve (parent, args, context) {
        return Competition.find()
      }
    },
    competitionsByHost: {
      type: new GraphQLList(CompetitionType),
      args: {
        host: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve (parent, args, context) {
        return Competition.find({
          host: args.host
        })
      }
    }
  }
})

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    hostCompetition: {
      type: CompetitionType,
      args: {
        displayName: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
        startDatetime: { type: new GraphQLNonNull(GraphQLString) },
        finishDatetime: { type: new GraphQLNonNull(GraphQLString) },
        formula: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve (parent, args, context) {
        // let authIdOnSession = context.user.sub
        let authIdOnSession = 'some-id'
        let newCompetition = new Competition({
          host: authIdOnSession,
          displayName: args.displayName,
          description: args.description,
          // startDatetime: args.startDatetime,
          // finishDatetime: args.finishDatetime,
          formula: args.formula
        })
        newCompetition.codeName = slugify(newCompetition.displayName) + '-' + newCompetition._id
        return new Promise((resolve, reject) => {
          newCompetition.save((err) => {
            if (err) reject(err)
            else {
              resolve(newCompetition)
            }
          })
        })
      }
    }
  }
})

const Schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})

export default Schema
