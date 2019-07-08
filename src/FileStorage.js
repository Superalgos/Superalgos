function newFileStorage() {
  const MODULE_NAME = 'File Cloud'
  const INFO_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    getBlobToText: getBlobToText
  }

  return thisObject

  function getBlobToText(container, filePath, host, callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] getBlobToText -> Entering function.') }

      let headers
      let accessToken = window.localStorage.getItem('access_token')
      if (accessToken !== null) {
        headers = {
          authorization: 'Bearer ' + accessToken
        }
      }

      axios({
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
              container: container,
              filePath: filePath,
              storage: host.storage,
              accessKey: host.accessKey
            }
          }
        },
        headers: headers
      }).then(res => {
        if (res.data.errors) {
          let error = { code: res.data.errors[0] }
          callBackFunction(error)
          return
        }
        let response = res.data.data.web_FileContent
        if (response){
          callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, response)
        } else {
          let error = { code: 'The specified key does not exist.' }
          callBackFunction(error)
        }
      }).catch(error => {
        if (error.message === 'Request aborted' || error.message === 'Network Error') {
          let error = { code: 'The specified key does not exist.' }
          callBackFunction(error)
        } else {
          if (ERROR_LOG === true) { console.log(spacePad(MODULE_NAME, 50) + ' : ' + '[ERROR] AppPreLoader -> getBlobToText -> Invalid JSON received. ') }
          if (ERROR_LOG === true) { console.log(spacePad(MODULE_NAME, 50) + ' : ' + '[ERROR] AppPreLoader -> getBlobToText -> response.text = ' + error.message) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      })
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] getBlobToText -> err = ' + err.stack) }
    }
  }
}
