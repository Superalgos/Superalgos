import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull
} from 'graphql'
import { epoch } from '../../utils/functions'
import { CompetitionType } from '../types'
import Competition from '../../models/competition'

const args = {
  host: { type: new GraphQLNonNull(GraphQLString) },
  includeOld: { type: GraphQLBoolean }
}

const resolve = (parent, { host, includeOld }, context) => {
  return Competition.find(
    Object.assign(
      {
        host
      },
      includeOld ? {} : { finishDatetime: { $gt: epoch() } }
    )
  )
}

const query = {
  competitionsByHost: {
    type: new GraphQLList(CompetitionType),
    args,
    resolve
  }
}

export default query
