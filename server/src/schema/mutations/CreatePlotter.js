import {
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import { PlotterType } from '../types'
import { Plotter } from '../../models'

const args = {
  name: { type: new GraphQLNonNull(GraphQLString) },
  host: { type: new GraphQLNonNull(GraphQLString) },
  repo: { type: new GraphQLNonNull(GraphQLString) },
  moduleName: { type: new GraphQLNonNull(GraphQLString) }
}

const resolve = (parent, { name, host, repo, moduleName }, context) => {
  const ownerId = context.userId
  let newPlotter = new Plotter({ name, host, repo, moduleName, ownerId })
  return new Promise((resolve, reject) => {
    newPlotter.save((err) => {
      if (err) reject(err)
      else {
        resolve(newPlotter)
      }
    })
  })
}

const mutation = {
  createPlotter: {
    type: PlotterType,
    args,
    resolve
  }
}

export default mutation
