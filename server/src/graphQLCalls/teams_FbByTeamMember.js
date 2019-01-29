import logger from '../config/logger'
import axios from 'axios'

const teams_FbByTeamMember = (authorization) => {
  logger.debug('GraphQL call teams_FbByTeamMember')

  return axios({
    url: process.env.GATEWAY_ENDPOINT,
    method: 'post',
    data: {
      query: `
      query Teams_FbByTeamMember {
        teams_FbByTeamMember {
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
            }
          }
        }
      }
      `,
    },
    headers: {
      authorization: authorization
    }
  })
};

export default teams_FbByTeamMember
