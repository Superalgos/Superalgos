const axios = require('axios')
const Ecosystem = require('./Ecosystem')

exports.newFileStorage = function newFileStorage() {
  const MODULE_NAME = 'FileStorage'
  const MAX_RETRY = 30
  let currentRetry = 0

  return {
    getTextFile,
    createTextFile
  }

  function logInfo(message) {
    log('[INFO] ' + message)
  }
  function log(message) {
    console.log( "['" + new Date().toISOString() + "', 0,'" + MODULE_NAME + "','" + message + "']")
  }

  function logError(message) {
    log('[ERROR] ' + message)
  }

  async function getTextFile(container, filePath, callBackFunction) {
    try {
      logInfo('getTextFile: ' + container.toLowerCase() + '/...' + filePath.substring(filePath.length - 110, filePath.length))

      let host = await getDevTeamHost(container)

      let response = await axios({
        url: host.url + 'graphql',
        method: 'post',
        data: {
          query: `
          query web_FileContent($file: web_FileInput){
            web_FileContent(file: $file)
          }
          `,
          variables: {
            file: {
              container: container.toLowerCase(),
              filePath,
              storage: host.storage,
              accessKey: host.accessKey
            }
          }
        }
      })

      currentRetry = 0
      if (response.data.errors) {
        callBackFunction({ code: response.data.errors[0] })
        return
      }

      if (response.data.data.web_FileContent) {
        callBackFunction(global.DEFAULT_OK_RESPONSE, response.data.data.web_FileContent)
      } else {
        callBackFunction({ code: 'The specified key does not exist.' })
      }

    } catch (err) {
      if ((err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET' || err.code === 'ENOTFOUND') && currentRetry < MAX_RETRY) {
        currentRetry++
        logInfo('getTextFile -> Retrying connection to the server because received error: ' + err.code + '. Retry #: ' + currentRetry)
        getTextFile(container, filePath, callBackFunction)
      } else {
        currentRetry = 0
        logError('getTextFile -> error = '+ err.message)
        callBackFunction(global.DEFAULT_FAIL_RESPONSE)
      }
    }
  }

  async function createTextFile(container, filePath, fileContent, callBackFunction) {
    try {
      logInfo('createTextFile -> Entering function: ' + container.toLowerCase() + '/...' + filePath.substring(filePath.length - 110, filePath.length))

      let host = await getDevTeamHost(container)

      let response = await axios({
        url: process.env.GATEWAY_ENDPOINT_K8S,
        method: 'post',
        data: {
          query: `
          mutation web_CreateFile($file: web_FileInput){
            web_CreateFile(file: $file)
          }
          `,
          variables: {
            file: {
              container: container.toLowerCase(),
              filePath,
              storage: 'localStorage',
              accessKey: host.ownerKey,
              fileContent
            }
          }
        }
      })

      currentRetry = 0

      if (!response || response.data.errors) {
        let customErr = {
          result: global.CUSTOM_FAIL_RESPONSE.result,
          message: response.data.errors[0]
        }
        callBackFunction(customErr)
      } else {
        callBackFunction(global.DEFAULT_OK_RESPONSE)
      }

    } catch (err) {
      if ((err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET' || err.code === 'ENOTFOUND' || err.message === "Request failed with status code 413") && currentRetry < MAX_RETRY) {
        currentRetry++
        logInfo('createTextFile -> Retrying connection to the server because received error: ' + err.code + '. Retry #: ' + currentRetry)
        createTextFile(container, filePath, fileContent, callBackFunction)
      } else {
        currentRetry = 0
        logError('createTextFile -> error = '+ err.message)
        callBackFunction(global.DEFAULT_FAIL_RESPONSE)
      }
    }
  }

  async function getDevTeamHost(devTeamName) {
    let ecosystem = await Ecosystem.getEcosystem()

    for (var i = 0; i < ecosystem.devTeams.length; i++) {
      if (ecosystem.devTeams[i].codeName.toLowerCase() === devTeamName.toLowerCase()) {
        return ecosystem.devTeams[i].host
      }
    }
  }
}
