import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql'
import { CompetitionType } from '../types'
import Competition from '../../models/competition'

const args = {
  competitionCodeName: { type: new GraphQLNonNull(GraphQLID) },
  devTeam: { type: new GraphQLNonNull(GraphQLString) },
  bot: { type: GraphQLString },
  release: { type: GraphQLString }
}

const resolve = (parent, { competitionCodeName, devTeam, bot, release }, context) => {
  // let authIdOnSession = context.user.sub
  return new Promise((resolve, reject) => {
    Competition.findOne({ codeName: competitionCodeName }).exec((err, competition) => {
      if (err) reject(err)
      else {
        let participantIndex
        competition.participants.find((participant, index) => {
          if (participant.devTeam === devTeam) {
            participantIndex = index
          }
        })

        competition.participants[participantIndex].bot = bot || competition.participants[participantIndex].bot
        competition.participants[participantIndex].release = release || competition.participants[participantIndex].release

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
  editParticipant: {
    type: CompetitionType,
    args,
    resolve
  }
}

export default mutation
