import {
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString
} from 'graphql'
import { EventType } from '../types'
import { Event } from '../../models'
import { slugify } from '../../utils/functions'

const args = {
  name: { type: new GraphQLNonNull(GraphQLString) },
  description: { type: new GraphQLNonNull(GraphQLString) },
  startDatetime: { type: new GraphQLNonNull(GraphQLInt) },
  finishDatetime: { type: new GraphQLNonNull(GraphQLInt) }
}

const resolve = (parent, { name, description, startDatetime, finishDatetime }, context) => {
  const hostId = context.userId
  let newEvent = new Event({
    hostId,
    name,
    description,
    startDatetime,
    finishDatetime
  })
  newEvent.designator = slugify(newEvent.name) + '-' + newEvent._id
  return new Promise((resolve, reject) => {
    newEvent.save((err) => {
      if (err) reject(err)
      else {
        resolve(newEvent)
      }
    })
  })
}

const mutation = {
  hostEvent: {
    type: EventType,
    args,
    resolve
  }
}

export default mutation
