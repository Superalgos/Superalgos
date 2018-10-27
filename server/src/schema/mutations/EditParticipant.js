import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql'
import { EventType } from '../types'
import { Event } from '../../models'

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLID) },
  teamId: { type: new GraphQLNonNull(GraphQLString) },
  botId: { type: GraphQLString },
  releaseId: { type: GraphQLString }
}

const resolve = (parent, { eventDesignator, teamId, botId, releaseId }, context) => {
  return new Promise((resolve, reject) => {
    Event.findOne({ designator: eventDesignator }).exec((err, event) => {
      if (err) reject(err)
      else {
        let participantIndex
        event.participants.find((participant, index) => {
          if (participant.teamId === teamId) {
            participantIndex = index
          }
        })

        event.participants[participantIndex].botId = botId || event.participants[participantIndex].botId
        event.participants[participantIndex].releaseId = releaseId || event.participants[participantIndex].releaseId

        event.save((err) => {
          if (err) reject(err)
          else {
            resolve(event)
          }
        })
      }
    })
  })
}

const mutation = {
  editParticipant: {
    type: EventType,
    args,
    resolve
  }
}

export default mutation
