import logger from '../../../logger'

export const resolvers = {
  Query: {
    _blank: (parent, arg, ctx, info) => { return '' }
  }
}
