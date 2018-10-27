import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLString
} from 'graphql'
import { EventType } from '../types'
import { Event } from '../../models'

const args = {
  designator: { type: new GraphQLNonNull(GraphQLID) },
  name: { type: GraphQLString },
  description: { type: GraphQLString },
  startDatetime: { type: GraphQLInt },
  finishDatetime: { type: GraphQLInt },
  formulaId: { type: GraphQLString },
  plotterId: { type: GraphQLString }
}

const resolve = (parent, { designator, name, description, startDatetime, finishDatetime, formulaId, plotterId }, context) => {
  return new Promise((resolve, reject) => {
    Event.findOne({ designator, hostId: context.userId }).exec((err, event) => {
      if (err || !event) {
        reject(err)
      } else {
        event.name = name || event.name
        event.description = description || event.description
        event.startDatetime = startDatetime || event.startDatetime
        event.finishDatetime = finishDatetime || event.finishDatetime
        event.formula = formulaId || event.formula
        event.plotter = plotterId || event.plotter

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
  editEvent: {
    type: EventType,
    args,
    resolve
  }
}

export default mutation
