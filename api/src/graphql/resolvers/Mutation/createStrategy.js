import axios from 'axios'

import { logger, DatabaseError } from '../../../logger'

export const createStrategy = fbSlug => {
  logger.info('createStrategy')
  logger.info(fbSlug)
  return new Promise((resolve, reject) => {
    try {
      return axios.post(process.env.PLATFORM_API_URL, {
        query: `mutation strategizer_CreateStrategy($fbSlug: String!) {
          strategizer_CreateStrategy(fbSlug: $fbSlug){
            id
          }
        }`,
        variables: {
          fbSlug: fbSlug
        }
      }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(res => {
          logger.info('createStrategy result')
          logger.info(res.data)
          resolve(res.data)
        })
        .catch(err => {
          logger.error('createStrategy err')
          logger.error(err)
          reject(err)
        })
    } catch (error) {
      reject(error)
    }
  })
}

export default createStrategy
