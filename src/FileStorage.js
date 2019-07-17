function newFileStorage() {
  const MODULE_NAME = 'File Cloud'
  const INFO_LOG = false
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  const MAX_RETRY = 2
  let currentRetry = 0

  let thisObject = {
    getBlobToText: getBlobToText
  }

  return thisObject

  async function getBlobToText(container, filePath, host, callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] getBlobToText -> Entering function.') }

      let headers
      let accessToken = window.localStorage.getItem('access_token')
      if (accessToken !== null) {
        headers = {
          authorization: 'Bearer ' + accessToken
        }
      }

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
        },
        headers: headers
      })

      currentRetry = 0
      if (response.data.errors) {
        let error = { code: response.data.errors[0] }
        callBackFunction(error)
        return
      }

      if (response.data.data.web_FileContent) {
        callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, response.data.data.web_FileContent)
      } else {
        callBackFunction({ code: 'The specified key does not exist.' })
      }

    } catch (err) {
      if ((err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET') && currentRetry < MAX_RETRY) {
        currentRetry++
        if (INFO_LOG === true) { console.log('[INFO] getTextFile -> Retrying connection to the server because received error: ' + err.code + '. Retry #: ' + currentRetry) }
        getBlobToText(container, filePath, host, callBackFunction)
      }else if (err.message === 'Request aborted') {
        let err = { code: 'The specified key does not exist.' }
        callBackFunction(err)
      } else {
        console.log('Error geting the file from the serever:', err)
        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
      }
    }
  }
}
