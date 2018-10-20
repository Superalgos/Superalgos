import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLString
} from 'graphql'
import { CompetitionType } from '../types'
import Competition from '../../models/competition'

const args = {
  codeName: { type: new GraphQLNonNull(GraphQLID) },
  position: { type: new GraphQLNonNull(GraphQLInt) },
  algoPrize: { type: new GraphQLNonNull(GraphQLString) }
}

const resolve = (parent, { codeName, position, algoPrize }, context) => {
  // let authIdOnSession = context.user.sub
  return new Promise((resolve, reject) => {
    Competition.findOne({ codeName }).exec((err, competition) => {
      if (err) reject(err)
      else {
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
  addPrizeToCompetition: {
    type: CompetitionType,
    args,
    resolve
  }
}

export default mutation
