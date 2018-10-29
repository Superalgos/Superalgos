import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt
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
      if (err) {
        reject(err)
      } else if (!event) {
        reject(new DatabaseError('None of the events you own respond to that designator'))
      } else {
        if (event.prizes.some(prize => prize.rank === rank)) {
          reject(new WrongArgumentsError('A prize for that rank already exists'))
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
