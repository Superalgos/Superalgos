import {
  GraphQLNonNull,
  GraphQLID
} from 'graphql'
import { DatabaseError } from '../../errors'
import { EventType } from '../types'
import { Event } from '../../models'

const args = {
  designator: { type: new GraphQLNonNull(GraphQLID) }
}

const resolve = (parent, { designator }, context) => {
  return new Promise((resolve, reject) => {
    Event.findOne({ designator }).exec((err, event) => {
      if (err) {
        reject(err)
      } else if (!event) {
        reject(new DatabaseError('None of the events respond to that designator'))
      } else {
        resolve(event)
      }
    })
  })
}

const query = {
  event: {
    type: EventType,
    args,
    resolve
  }
}

export default query
