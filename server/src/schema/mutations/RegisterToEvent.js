import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql'
import { EventType } from '../types'
import { Event } from '../../models'

const args = {
  designator: { type: new GraphQLNonNull(GraphQLID) },
  teamId: { type: new GraphQLNonNull(GraphQLString) },
  botId: { type: GraphQLString },
  releaseId: { type: GraphQLString }
}

const resolve = (parent, { designator, teamId, botId, releaseId }, context) => {
  return new Promise((resolve, reject) => {
    Event.findOne({ designator }).exec((err, event) => {
      if (err) reject(err)
      else {
        if (event.participants.some(participant => participant.teamId === teamId)) {
          // need to add an error message here TODO
          resolve(event)
        } else {
          event.participants.push({
            teamId,
            botId,
            releaseId
          })
          event.save((err) => {
            if (err) reject(err)
            else {
              resolve(event)
            }
          })
        }
      }
    })
  })
}

const mutation = {
  registerToEvent: {
    type: EventType,
    args,
    resolve
  }
}

export default mutation
