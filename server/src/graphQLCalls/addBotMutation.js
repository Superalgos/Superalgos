import logger from '../config/logger'
import axios from 'axios'

const addBotMutation = async (authorization, bot) => {
  logger.debug('addBotMutation -> Entering function.')

  let response = await axios({
    url: process.env.GATEWAY_ENDPOINT,
    method: 'post',
    data: {
      query: `
      mutation web_AddBot($bot: web_BotInput){
        web_AddBot(bot: $bot){
          codeName
          cloneId
        }
      }
      `,
      variables: {
        bot
      }
    },
    headers: {
      authorization: authorization
    }
  })

  if (response.data.errors) {
    throw response.data.errors
  }

  return response.data.data.web_AddBot
}

export default addBotMutation
