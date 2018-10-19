import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLString
} from 'graphql'
import { CompetitionType } from '../types'
import Competition from '../../models/competition'

const args = {
  codeName: { type: new GraphQLNonNull(GraphQLID) },
  displayName: { type: GraphQLString },
  description: { type: GraphQLString },
  startDatetime: { type: GraphQLInt },
  finishDatetime: { type: GraphQLInt },
  formula: { type: GraphQLString },
  plotterCodeName: { type: GraphQLString },
  plotterHost: { type: GraphQLString },
  plotterRepo: { type: GraphQLString },
  plotterModuleName: { type: GraphQLString }
}

const resolve = (parent, { codeName, displayName, description, startDatetime, finishDatetime,
  formula, plotterCodeName, plotterHost, plotterRepo, plotterModuleName }, context) => {
  // let authIdOnSession = context.user.sub
  return new Promise((resolve, reject) => {
    Competition.findOne({ codeName }).exec((err, competition) => {
      if (err) reject(err)
      else {
        competition.displayName = displayName || competition.displayName
        competition.description = description || competition.description
        competition.startDatetime = startDatetime || competition.startDatetime
        competition.finishDatetime = finishDatetime || competition.finishDatetime
        competition.formula = formula || competition.formula
        competition.plotter.codeName = plotterCodeName || competition.plotter.codeName
        competition.plotter.host = plotterHost || competition.plotter.host
        competition.plotter.repo = plotterRepo || competition.plotter.repo
        competition.plotter.moduleName = plotterModuleName || competition.plotter.moduleName

        competition.save((err) => {
          if (err) reject(err)
          else {
            resolve(competition)
          }
        })
      }
    })
  })
}

const mutation = {
  editCompetition: {
    type: CompetitionType,
    args,
    resolve
  }
}

export default mutation
