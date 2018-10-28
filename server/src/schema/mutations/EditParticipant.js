import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql'
import axios from 'axios'
import {
  AuthentificationError,
  WrongArgumentsError,
  ServiceUnavailableError
} from '../../errors'
import { EventType } from '../types'
import { Event } from '../../models'

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLID) },
  teamId: { type: new GraphQLNonNull(GraphQLString) },
  botId: { type: GraphQLString },
  releaseId: { type: GraphQLString }
}

const resolve = (parent, { eventDesignator, teamId, botId, releaseId }, context) => {
  const userid = context.userId
  if (!userid) {
    throw new AuthentificationError()
  }
  return new Promise((resolve, reject) => {
    axios({
      url: process.env.TEAMS_ENDPOINT,
      method: 'post',
      data: {
        query: `
          {
            teamsByRole{
              id
            }
          }
        `
      },
      headers: {
        userid,
        authorization: context.authorization
      }
    }).then(
      (result) => {
        if (!result.data.data.teamsByRole.some(team => team.id === teamId)) {
          reject(new WrongArgumentsError('You are not eligible to register this team'))
          return
        }
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
      },
      (error) => {
        reject(new ServiceUnavailableError(error))
      }
    )
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
