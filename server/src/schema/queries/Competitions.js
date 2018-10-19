import {
  GraphQLBoolean,
  GraphQLList
} from 'graphql'
import { epoch } from '../../utils/functions'
import { CompetitionType } from '../types'
import Competition from '../../models/competition'

const args = {
  includeOld: { type: GraphQLBoolean }
}

const query = {
  competitions: {
    type: new GraphQLList(CompetitionType),
    args,
    resolve (parent, args, context) {
      return Competition.find(
        Object.assign(
          {},
          args.includeOld ? { finishDatetime: { $gt: epoch() } } : {}
        ))
    }
  }
}

export default query
