import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt
} from 'graphql'
import { AuthentificationError } from '../../errors'
import { EventType } from '../types'
import { Event } from '../../models'

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLID) },
  rank: { type: new GraphQLNonNull(GraphQLInt) },
  amount: { type: new GraphQLNonNull(GraphQLInt) }
}

const resolve = (parent, { eventDesignator, rank, amount }, context) => {
  const hostId = context.userId
  if (!hostId) {
    throw new AuthentificationError()
  }
  return new Promise((resolve, reject) => {
    Event.findOne({ designator: eventDesignator, hostId }).exec((err, event) => {
      if (err || !event) {
        reject(err)
      } else {
        if (event.prizes.some(prize => prize.rank === rank)) {
          // need to add an error message here TODO
          resolve(event)
        } else {
          event.prizes.push({
            rank,
            amount
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
  addPrize: {
    type: EventType,
    args,
    resolve
  }
}

export default mutation
