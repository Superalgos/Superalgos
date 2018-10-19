import {
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString
} from 'graphql'
import { CompetitionType } from '../types'
import Competition from '../../models/competition'
import { slugify } from '../../utils/functions'

const args = {
  displayName: { type: new GraphQLNonNull(GraphQLString) },
  description: { type: new GraphQLNonNull(GraphQLString) },
  startDatetime: { type: new GraphQLNonNull(GraphQLInt) },
  finishDatetime: { type: new GraphQLNonNull(GraphQLInt) },
  formula: { type: new GraphQLNonNull(GraphQLString) }
}

const resolve = (parent, { displayName, description, startDatetime, finishDatetime, formula }, context) => {
  // let authIdOnSession = context.user.sub
  let authIdOnSession = 'some-id'
  let newCompetition = new Competition({
    host: authIdOnSession,
    displayName,
    description,
    startDatetime,
    finishDatetime,
    formula
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

const mutation = {
  hostCompetition: {
    type: CompetitionType,
    args,
    resolve
  }
}

export default mutation
