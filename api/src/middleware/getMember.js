import { logger } from '../logger'

export const getMember = async (req, res, next, db) => {
  if (!req.headers.userId) return next()
  logger.info('getMember ')
  logger.info(req.headers.userId)
  try {
    const member = await getUser(req.headers.userId)
    req.user = await member
    next()
  } catch (err) {
    next()
  }

}

export const getUser = authId => {
  logger.info('getUser')
  logger.info(authId)
  const API_URL = 'https://app-api.advancedalgos.net/graphql'
  return new Promise(resolve => {
    try {
      const result = axios.post(API_URL, {
        query: `query users_User($userId: String!) {
          users_User(id: $userId){
            id
            alias
            email
          }
        }`,
        variables: {
          userId: authId
        }
      }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(result => {
          logger.info('getUser result')
          logger.info(result.data)
          resolve(result.data)
        })
        .catch(err => {
          logger.info('getUser err')
          logger.info(err)
          throw new Error(err)
        })

    } catch (error) {
      resolve(error)
    }
  })
}

export default getUser
