import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLString
} from 'graphql'
import { CompetitionType } from '../types'
import Competition from '../../models/competition'

const args = {
  competitionCodeName: { type: new GraphQLNonNull(GraphQLID) },
  position: { type: new GraphQLNonNull(GraphQLInt) },
  algoPrize: { type: new GraphQLNonNull(GraphQLString) }
}

const resolve = (parent, { competitionCodeName, position, algoPrize }, context) => {
  return new Promise((resolve, reject) => {
    Competition.findOne({ codeName: competitionCodeName, host: context.user.sub }).exec((err, competition) => {
      if (err || !competition) {
        reject(err)
      } else {
        if (competition.prizes.some(prize => prize.position === position)) {
          // need to add an error message here TODO
          resolve(competition)
        } else {
          competition.prizes.push({
            position,
            algoPrize
          })
          competition.save((err) => {
            if (err) reject(err)
            else {
              resolve(competition)
            }
          })
        }
      }
    })
  })
}

const mutation = {
  addPrize: {
    type: CompetitionType,
    args,
    resolve
  }
}

export default mutation
