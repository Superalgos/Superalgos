import logger from '../config/logger'
import axios from 'axios'

const teamAvatar = async(authorization, teamId) => {
  logger.debug('GraphQL call teamAvatar.')

  return axios({
    url: process.env.GATEWAY_ENDPOINT,
    method: 'post',
    data: {
      query: `
      query Teams_Team($teamId: String!){
        teams_TeamById(teamId:$teamId) {
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

export default teamAvatar
