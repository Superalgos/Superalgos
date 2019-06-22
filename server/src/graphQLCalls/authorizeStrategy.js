import logger from '../config/logger'
import axios from 'axios'

const authorizeStrategy = (authorization, fbSlug, cloneId, release) => {
  logger.debug('authorizeStrategy -> Entering function.')

  return axios({
    url: process.env.GATEWAY_ENDPOINT,
    method: 'post',
    data: {
      query: `
      mutation strategizer_AuthorizeStrategy($fbSlug: String!, $cloneId: String!, $release: Boolean!){
        strategizer_AuthorizeStrategy(fbSlug: $fbSlug, cloneId: $cloneId, release:$release)
      }
      `,
      variables: {
        fbSlug,
        cloneId,
        release
      }
    },
    headers: {
      authorization: authorization
    }
  })
}

export default authorizeStrategy
