import {
  GraphQLList,
  GraphQLString,
  GraphQLNonNull
} from 'graphql'
import { CompetitionType } from '../types'
import Competition from '../../models/competition'

const args = {
  host: { type: new GraphQLNonNull(GraphQLString) }
}

const query = {
  competitionsByHost: {
    type: new GraphQLList(CompetitionType),
    args,
    resolve (parent, args, context) {
      return Competition.find({
        host: args.host
      })
    }
  }
}

export default query
