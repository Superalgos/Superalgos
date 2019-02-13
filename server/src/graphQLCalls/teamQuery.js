import logger from '../config/logger'
import axios from 'axios'

const teamQuery = (authorization, teamId) => {
  logger.debug('teamQuery -> Entering function')

  return axios({
    url: process.env.GATEWAY_ENDPOINT,
    method: 'post',
    data: {
      query: `
      query Teams_Team($teamId: String!){
        teams_TeamById(teamId:$teamId) {
          id
          name
          slug
          fb {
            id
            name
            slug
            kind
            avatar
          }
          members {
            member {
              alias
              authId
            }
          }
          profile{
            avatar
          }
        }
      }
      `,
      variables: {
         teamId: teamId
       }
    },
    headers: {
      authorization: authorization
    }
  })
};

export default teamQuery
