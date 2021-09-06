function newFileStorage(host, port) {
  const MODULE_NAME = 'File Storage'
  const INFO_LOG = false
  const logger = newWebDebugLog()


  const MAX_RETRY = 2
  let currentRetry = 0

  const recoverableErrors = [
    'SOCKETTIMEDOUT',
    'TIMEDOUT',
    'CONNRESET',
    'CONNREFUSED',
    'NOTFOUND',
    'ENOTFOUND',
    'ECONNREFUSED',
    'CONNREFUSED',
    'NOTFOUND',
    'ESOCKETTIMEDOUT',
    'ECONNRESET',
    'ETIMEDOUT',
    'EAI_AGAIN'
  ]

  let thisObject = {
    getFileFromHost: getFileFromHost
  }

  return thisObject

  async function getFileFromHost(filePath, callBackFunction, pathComplete) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] getFileFromHost -> Entering function.') }

      let folder = ''
      if (pathComplete === false || pathComplete === undefined) {
        folder = 'Storage/'
      }
      let url

      if (host !== undefined && port !== undefined) {
        url = 'http://' + host + ':' + port + '/' + folder + filePath
      } else {
        url = folder + filePath
      }

      /* Scaping # since it breaks the URL */
      url = url.replaceAll('#', '_HASHTAG_')

      httpRequest(undefined, url, (response, fileContent) => {
        if (response.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
          callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, fileContent)
        } else {
          callBackFunction(response)
        }
      })
    } catch (err) {
      if (verifyRetry(err.code) && currentRetry < MAX_RETRY) {
        currentRetry++
        if (INFO_LOG === true) { console.log('[INFO] getTextFile -> Retrying connection to the server because received error: ' + err.code + '. Retry #: ' + currentRetry) }
        getFileFromHost(filePath, callBackFunction)
      } else if (err.message === 'Request aborted') {
        let err = { code: 'The specified key does not exist.' }
        callBackFunction(err)
      } else {
        console.log('Error geting the file from the serever:', err)
        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
      }
    }
  }

  function verifyRetry(errorCode) {
    for (let i = 0; i < recoverableErrors.length; i++) {
      const error = recoverableErrors[i]
      if (error === errorCode) {
        return true
      }
    }
    return false
  }
}
