import logger from '../config/logger'
import axios from 'axios'

const ecosystemQuery = async (authorization) => {
  logger.debug('ecosystemQuery -> Entering function')

  let response = await axios({
    url: process.env.GATEWAY_ENDPOINT,
    method: 'post',
    data: {
      query: `
      query {
        web_GetEcosystem {
          devTeams {
            codeName
            displayName
            host {
              url
              storage
              container
              accessKey
            }
          }
        }
      }
      `
    },
    headers: {
      authorization: authorization
    }
  })

  if (response.data.errors) {
    throw response.data.errors
  }

  return response.data.data.web_GetEcosystem
}

export default ecosystemQuery
