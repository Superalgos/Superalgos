import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql'
import { CompetitionType } from '../types'
import Competition from '../../models/competition'

const args = {
  codeName: { type: new GraphQLNonNull(GraphQLID) },
  title: { type: new GraphQLNonNull(GraphQLString) },
  description: { type: new GraphQLNonNull(GraphQLString) }
}

const resolve = (parent, { codeName, title, description }, context) => {
  // let authIdOnSession = context.user.sub
  return new Promise((resolve, reject) => {
    Competition.findOne({ codeName }).exec((err, competition) => {
      if (err) reject(err)
      else {
        if (competition.rules.some(rule => rule.title === title)) {
          // need to add an error message here TODO
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
  addRuleToCompetition: {
    type: CompetitionType,
    args,
    resolve
  }
}

export default mutation
