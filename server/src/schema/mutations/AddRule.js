import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql'
import { EventType } from '../types'
import { Event } from '../../models'

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLID) },
  title: { type: new GraphQLNonNull(GraphQLString) },
  description: { type: new GraphQLNonNull(GraphQLString) }
}

const resolve = (parent, { eventDesignator, title, description }, context) => {
  return new Promise((resolve, reject) => {
    Event.findOne({ designator: eventDesignator, hostId: context.userId }).exec((err, event) => {
      if (err || !event) {
        reject(err)
      } else {
        if (event.rules.some(rule => rule.title === title)) {
          resolve(event)
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
