const axios = require('axios')

exports.getEcosystem = async function () {
    try {
        if (!global.ECOSYSTEM) {
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

            global.ECOSYSTEM = ecosystemResponse.data.data.web_GetEcosystem;
        }
        return global.ECOSYSTEM

    } catch (error) {
        throw new Error('There has been an error getting the Ecosystem: ', error)
    }
}
