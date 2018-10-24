import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt
} from 'graphql'
import { isBetween } from '../../utils/functions'
import { CompetitionType } from '../types'
import Competition from '../../models/competition'

const args = {
  competitionCodeName: { type: new GraphQLNonNull(GraphQLID) },
  fromNumber: { type: new GraphQLNonNull(GraphQLInt) },
  toNumber: { type: new GraphQLNonNull(GraphQLInt) }
}

const resolve = (parent, { competitionCodeName, fromNumber, toNumber }, context) => {
  return new Promise((resolve, reject) => {
    Competition.findOne({ codeName: competitionCodeName, host: context.userId }).exec((err, competition) => {
      if (err || !competition) {
        reject(err)
      } else {
        const delta = fromNumber > toNumber ? 1 : -1
        competition.rules.forEach((part) => {
          if (part.number === fromNumber) {
            part.number = toNumber
          } else if (isBetween(part.number, fromNumber, toNumber)) {
            part.number += delta
          }
        })

        competition.save((err) => {
          if (err) reject(err)
          else {
            resolve(competition)
          }
        })
      }
    })
  })
}

const mutation = {
  reorderRules: {
    type: CompetitionType,
    args,
    resolve
  }
}

export default mutation
