import {
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import { EventType } from '../types'
import { Event, Formula } from '../../models'

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLString) },
  name: { type: new GraphQLNonNull(GraphQLString) }
}

const resolve = (parent, { name, eventDesignator }, context) => {
  const ownerId = context.userId
  let newFormula = new Formula({ name, ownerId })
  return new Promise((resolve, reject) => {
    Event.findOne({ designator: eventDesignator, hostId: ownerId }).exec((err, event) => {
      if (err || !event) {
        reject(err)
      } else {
        newFormula.save((err) => {
          if (err) reject(err)
          else {
          }
        })
        event.formula = newFormula._id
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
  createAndSetFormula: {
    type: EventType,
    args,
    resolve
  }
}

export default mutation
