import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql'
import { CompetitionType } from '../types'
import Competition from '../../models/competition'

const args = {
  competitionCodeName: { type: new GraphQLNonNull(GraphQLID) },
  title: { type: new GraphQLNonNull(GraphQLString) },
  description: { type: new GraphQLNonNull(GraphQLString) }
}

const resolve = (parent, { competitionCodeName, title, description }, context) => {
  return new Promise((resolve, reject) => {
    Competition.findOne({ codeName: competitionCodeName, host: context.userId }).exec((err, competition) => {
      if (err || !competition) {
        reject(err)
      } else {
        if (competition.rules.some(rule => rule.title === title)) {
          resolve(competition)
        } else {
          let number = 1
          while (competition.rules.some(rule => rule.number === number)) {
            number++
          }
          competition.rules.push({
            number,
            title,
            description
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
  addRule: {
    type: CompetitionType,
    args,
    resolve
  }
}

export default mutation
