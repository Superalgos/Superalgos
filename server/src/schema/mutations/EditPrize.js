import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt
} from 'graphql'
import { AuthentificationError, DatabaseError } from '../../errors'
import { EventType } from '../types'
import { Event } from '../../models'

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLID) },
  rank: { type: new GraphQLNonNull(GraphQLInt) },
  amount: { type: GraphQLInt }
}

const resolve = (parent, { eventDesignator, rank, amount }, context) => {
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
        let prizeIndex
        event.prizes.find((prize, index) => {
          if (prize.rank === rank) {
            prizeIndex = index
          }
        })
        if (!prizeIndex) {
          reject(new DatabaseError('There is no prize for that index'))
        }
        event.prizes[prizeIndex].amount = amount || event.prizes[prizeIndex].amount
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
  editPrize: {
    type: EventType,
    args,
    resolve
  }
}

export default mutation
