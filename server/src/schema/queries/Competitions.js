import {
  GraphQLList
} from 'graphql'
import { CompetitionType } from '../types'
import Competition from '../../models/competition'

const query = {
  competitions: {
    type: new GraphQLList(CompetitionType),
    resolve (parent, args, context) {
      return Competition.find()
    }
  }
}

export default query
