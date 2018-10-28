import {
  GraphQLInt,
  GraphQLList,
  GraphQLString
} from 'graphql'
import { EventType } from '../types'
import { Event } from '../../models'

const args = {
  hostId: { type: GraphQLString },
  minDate: { type: GraphQLInt },
  maxDate: { type: GraphQLInt }
}

const resolve = (parent, { hostId, minDate, maxDate }, context) => {
  return Event.find(
    Object.assign(
      hostId ? { hostId } : { hostId: context.userId },
      minDate || maxDate
        ? { startDatetime:
          Object.assign(
            minDate ? { $gte: minDate } : {},
            maxDate ? { $lte: maxDate } : {}
          ) }
        : {}
    )
  )
}

const query = {
  eventsByHost: {
    type: new GraphQLList(EventType),
    args,
    resolve
  }
}

export default query
