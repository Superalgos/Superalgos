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

const query = {
  competitionsByHost: {
    type: new GraphQLList(CompetitionType),
    args,
    resolve (parent, args, context) {
      return Competition.find(
        Object.assign(
          {
            host: args.host
          },
          args.includeOld ? { finishDatetime: { $gt: epoch() } } : {}
        )
      )
    }
  }
}

export default query
