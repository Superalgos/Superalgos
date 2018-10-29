import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql'
import {
  AuthentificationError,
  DatabaseError,
  WrongArgumentsError
} from '../../errors'
import { EventType } from '../types'
import { Event } from '../../models'

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLID) },
  title: { type: new GraphQLNonNull(GraphQLString) },
  description: { type: new GraphQLNonNull(GraphQLString) }
}

const resolve = (parent, { eventDesignator, title, description }, context) => {
  const hostId = context.userId
  if (!hostId) {
    throw new AuthentificationError()
  }
  return new Promise((resolve, reject) => {
    Event.findOne({ designator: eventDesignator, hostId }).exec((err, event) => {
      if (err) {
        reject(err)
      } else if (!event) {
        reject(new DatabaseError('None of the events you own respond to that designator'))
      } else {
        if (event.rules.some(rule => rule.title === title)) {
          reject(new WrongArgumentsError('A prize for that rank already exists'))
        } else {
          let position = 1
          while (event.rules.some(rule => rule.position === position)) {
            position++
          }
          event.rules.push({
            position,
            title,
            description
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
  addRule: {
    type: EventType,
    args,
    resolve
  }
}

export default mutation
