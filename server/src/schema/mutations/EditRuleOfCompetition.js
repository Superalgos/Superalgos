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
  newtitle: { type: GraphQLString },
  description: { type: GraphQLString }
}

const resolve = (parent, { codeName, title, newtitle, description }, context) => {
  // let authIdOnSession = context.user.sub
  return new Promise((resolve, reject) => {
    Competition.findOne({ codeName }).exec((err, competition) => {
      if (err) reject(err)
      else {
        let ruleIndex
        competition.rules.find((rule, index) => {
          if (rule.title === title) {
            ruleIndex = index
          }
        })

        competition.rules[ruleIndex].description = description || competition.rules[ruleIndex].description
        if (competition.rules.some(rule => rule.title === newtitle)) {
          // need to add an error message here TODO
          resolve(competition)
        } else {
          competition.rules[ruleIndex].title = newtitle || competition.rules[ruleIndex].title
        }

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
  editRuleOfCompetition: {
    type: CompetitionType,
    args,
    resolve
  }
}

export default mutation
