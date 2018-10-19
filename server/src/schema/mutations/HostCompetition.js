import {
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import { CompetitionType } from '../types'
import Competition from '../../models/competition'
import { slugify } from '../../utils/functions'

const args = {
  displayName: { type: new GraphQLNonNull(GraphQLString) },
  description: { type: new GraphQLNonNull(GraphQLString) },
  startDatetime: { type: new GraphQLNonNull(GraphQLString) },
  finishDatetime: { type: new GraphQLNonNull(GraphQLString) },
  formula: { type: new GraphQLNonNull(GraphQLString) }
}

const mutation = {
  hostCompetition: {
    type: CompetitionType,
    args,
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

export default mutation
