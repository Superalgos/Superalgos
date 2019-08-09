const axios = require('axios')
let fs = require('fs')
const { promisify } = require('util')
const readFileAsync = promisify(fs.readFile);

exports.getEcosystem = async function () {
  try {
    if (!global.ECOSYSTEM) {

      let executionOnCloud = false
      if (process.env.ON_CLOUD !== undefined) {
        executionOnCloud = JSON.parse(process.env.ON_CLOUD)
      }

      if (executionOnCloud) {
        const ecosystemResponse = await axios({
          url: process.env.GATEWAY_ENDPOINT_K8S,
          method: 'post',
          data: {
            query: `
                    query {
                        web_GetEcosystem {
                          id
                          devTeams {
                            codeName
                            displayName
                            host {
                              url
                              storage
                              container
                              accessKey
                              ownerKey
                            }
                            bots {
                              codeName
                              displayName
                              type
                              profilePicture
                              repo
                              configFile
                              products{
                                codeName
                                displayName
                                description
                                dataSets{
                                  codeName
                                  type
                                  validPeriods
                                  filePath
                                  fileName
                                  dataRange{
                                    filePath
                                    fileName
                                  }
                                }
                                exchangeList{
                                  name
                                }
                              }
                            }
                          }
                        }
                      }
                      `
          },
          headers: {
            authorization: process.env.AUTHORIZATION
          }
        })
        //TODO Competition hosts not retrieved currently

        if (ecosystemResponse.data.errors)
          throw new Error(ecosystemResponse.data.errors[0].message)

        global.ECOSYSTEM = ecosystemResponse.data.data.web_GetEcosystem
      } else {
          let fileLocation = process.env.INTER_PROCESS_FILES_PATH + '/ecosystem.json'
        let ecosystem = await readFileAsync(fileLocation, { encoding: 'utf8' })
        global.ECOSYSTEM = JSON.parse(ecosystem)
      }
    }

    return global.ECOSYSTEM

  } catch (error) {
    throw new Error('There has been an error getting the Ecosystem: ', error)
  }
}
