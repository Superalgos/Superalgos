import {
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import { AuthentificationError, DatabaseError } from '../../errors'
import { EventType } from '../types'
import { Event, Plotter } from '../../models'

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLString) },
  name: { type: new GraphQLNonNull(GraphQLString) },
  host: { type: new GraphQLNonNull(GraphQLString) },
  repo: { type: new GraphQLNonNull(GraphQLString) },
  moduleName: { type: new GraphQLNonNull(GraphQLString) }
}

const resolve = (parent, { name, host, repo, moduleName, eventDesignator }, context) => {
  const ownerId = context.userId
  if (!ownerId) {
    throw new AuthentificationError()
  }
  let newPlotter = new Plotter({ name, host, repo, moduleName, ownerId })
  return new Promise((resolve, reject) => {
    Event.findOne({ designator: eventDesignator, hostId: ownerId }).exec((err, event) => {
      if (err) {
        reject(err)
      } else if (!event) {
        reject(new DatabaseError('None of the events you own respond to that designator'))
      } else {
        newPlotter.save((err) => {
          if (err) reject(err)
          else {
          }
        })
        event.plotter = newPlotter._id
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
  createAndSetPlotter: {
    type: EventType,
    args,
    resolve
  }
}

export default mutation
