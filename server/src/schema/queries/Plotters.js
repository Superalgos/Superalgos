import {
  GraphQLList
} from 'graphql'
import { PlotterType } from '../types'
import { Plotter } from '../../models'

const args = {}

const resolve = (parent, args, context) => {
  return Plotter.find()
}

const query = {
  plotters: {
    type: new GraphQLList(PlotterType),
    args,
    resolve
  }
}

export default query
