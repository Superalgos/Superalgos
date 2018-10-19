import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql'
import { CompetitionType } from '../types'
import Competition from '../../models/competition'

const args = {
  codeName: { type: new GraphQLNonNull(GraphQLID) },
  devTeam: { type: new GraphQLNonNull(GraphQLString) },
  bot: { type: new GraphQLNonNull(GraphQLString) },
  release: { type: new GraphQLNonNull(GraphQLString) }
}

const mutation = {
  registerToCompetition: {
    type: CompetitionType,
    args,
    resolve (parent, args, context) {
      // let authIdOnSession = context.user.sub
      return new Promise((resolve, reject) => {
        Competition.findOne({ codeName: args.codeName }).exec((err, competition) => {
          if (err) reject(err)
          else {
            if (competition.participants.some(participant => participant.devTeam === args.devTeam)) {
              // need to add an error message here TODO
              resolve(competition)
            } else {
              competition.participants.push({
                devTeam: args.devTeam,
                bot: args.bot,
                release: args.release
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
  }
}

export default mutation
