const axios = require('axios')
let fs = require('fs')
const { promisify } = require('util')
const readFileAsync = promisify(fs.readFile)

exports.getDefinition = async function () {
  try {
    if (!global.DEFINITION) {
      let executionOnCloud = false
      if (process.env.ON_CLOUD !== undefined) {
        executionOnCloud = JSON.parse(process.env.ON_CLOUD)
      }

      if (executionOnCloud) {
        const strategizerResponse = await axios({
          url: process.env.GATEWAY_ENDPOINT_K8S,
          method: 'post',
          data: {
            query: `
                    query($fbSlug: String!){
                        strategizer_TradingSystemByFb(fbSlug: $fbSlug){
                            data
                        }
                    }
                    `,
            variables: {
              fbSlug: process.env.BOT
            }
          },
          headers: {
            authorization: process.env.AUTHORIZATION
          }
        })

        if (strategizerResponse.data.errors) {
          throw new Error(strategizerResponse.data.errors[0].message)
        }

        global.DEFINITION = strategizerResponse.data.data.strategizer_TradingSystemByFb.data
      } else {
        let fileLocation = process.env.INTER_PROCESS_FILES_PATH + '/definition.json'
        let definition = readFile(fileLocation, { encoding: 'utf8' })
        global.DEFINITION = JSON.parse(definition)
      }
    }

    return global.DEFINITION
  } catch (error) {
      throw new Error('There has been an error getting the definition: ', JSON.stringify(error))
  }
}
