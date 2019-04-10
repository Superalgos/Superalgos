import logger from '../config/logger'
import axios from 'axios'

const teamQuery = (authorization, botId) => {
  logger.debug('teamQuery -> Entering function')

  return axios({
    url: process.env.GATEWAY_ENDPOINT,
    method: 'post',
    data: {
      query: `
      query teams_FbByOwner($fbId: String){
        teams_FbByOwner(fbId: $fbId) {
          edges{
            node{
              id
              kind
              name
              slug
              avatar
              team{
                id
                name
                slug
                profile{
                  avatar
                }
                members{
                  member{
                    alias
                  }
                }
              }
            }
          }
        }
      }
      `,
      variables: {
        fbId: botId
      }
    },
    headers: {
      authorization: authorization
    }
  })
}

export default teamQuery
