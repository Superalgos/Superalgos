import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql'
import { AuthentificationError } from '../../errors'
import { EventType } from '../types'
import { Event } from '../../models'

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLID) },
  title: { type: new GraphQLNonNull(GraphQLString) },
  newtitle: { type: GraphQLString },
  description: { type: GraphQLString }
}

const resolve = (parent, { eventDesignator, title, newtitle, description }, context) => {
  const hostId = context.userId
  if (!hostId) {
    throw new AuthentificationError()
  }
  return new Promise((resolve, reject) => {
    Event.findOne({ designator: eventDesignator, hostId }).exec((err, event) => {
      if (err || !event) {
        reject(err)
      } else {
        let ruleIndex
        event.rules.find((rule, index) => {
          if (rule.title === title) {
            ruleIndex = index
          }
        })

        event.rules[ruleIndex].description = description || event.rules[ruleIndex].description
        if (event.rules.some(rule => rule.title === newtitle)) {
          // need to add an error message here TODO
          resolve(event)
        } else {
          event.rules[ruleIndex].title = newtitle || event.rules[ruleIndex].title
        }

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
  editRule: {
    type: EventType,
    args,
    resolve
  }
}

export default mutation
