import logger from '../config/logger'
import axios from 'axios'

const authorizeKey = (authorization, keyId, cloneId, releaseClon) => {
  logger.debug('authorizeKey -> Entering function.')

  return axios({
    url: process.env.GATEWAY_ENDPOINT,
    method: 'post',
    data: {
      query: `
      mutation keyVault_AuthorizeClone($keyId: String!, $cloneId: String!, $releaseClon: Boolean!){
        keyVault_AuthorizeClone(keyId: $keyId, cloneId: $cloneId, releaseClon:$releaseClon)
      }
      `,
      variables: {
        keyId: keyId,
        cloneId: cloneId,
        releaseClon: releaseClon
      }
    },
    headers: {
      authorization: authorization
    }
  })
}

export default authorizeKey
