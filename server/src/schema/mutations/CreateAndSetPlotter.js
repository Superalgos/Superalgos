import {
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
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
  let newPlotter = new Plotter({ name, host, repo, moduleName, ownerId })
  return new Promise((resolve, reject) => {
    Event.findOne({ designator: eventDesignator, hostId: ownerId }).exec((err, event) => {
      if (err || !event) {
        reject(err)
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
