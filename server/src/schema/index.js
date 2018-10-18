import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull
} from 'graphql'
import { slugify } from '../utils/functions'

import Competition from '../models/competition'
import { CompetitionType } from './types'

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
