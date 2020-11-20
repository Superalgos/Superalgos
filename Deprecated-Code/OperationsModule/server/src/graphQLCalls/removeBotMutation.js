import logger from '../config/logger'
import axios from 'axios'

const removeBotMutation = async (authorization, bot) => {
  logger.debug('removeBotMutation -> Entering function.')

  let response = await axios({
    url: process.env.GATEWAY_ENDPOINT,
    method: 'post',
    data: {
      query: `
      mutation web_RemoveBot($bot: web_BotInput){
        web_RemoveBot(bot: $bot){
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

  return response.data.data.web_RemoveBot
}

export default removeBotMutation
