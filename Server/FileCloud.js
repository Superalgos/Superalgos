exports.newFileCloud = function newFileCloud() {
  const MODULE_NAME = 'File Cloud'
  const INFO_LOG = false
  const ERROR_LOG = true
  const axios = require('axios')

  let thisObject = {
    getBlobToText: getBlobToText
  }

  return thisObject

  function getBlobToText(container, filePath, host, callBackFunction) {
    try {
      if (INFO_LOG === true) { console.log('[INFO] getBlobToText -> Entering function.' + filePath) }

      let headers

      axios({
        url: process.env.GATEWAY_ENDPOINT,
        method: 'post',
        data: {
          query: `
            query web_PlotterCode($file: web_FileInput){
              web_PlotterCode(file: $file)
            }
            `,
          variables: {
            file: {
              container: container.toLowerCase(),
              filePath: filePath,
              storage: '',
              accessKey: ''
            }
          }
        },
        headers: headers
      }).then(res => {
        if (res.data.errors) {
          if (ERROR_LOG === true) { console.log(MODULE_NAME + ' : ' + '[ERROR] FileCloud -> getBlobToText -> response.text = ' + JSON.stringify(res.data.errors)) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE, '', '')
        }
        let response = res.data.data.web_PlotterCode
        if (response)
          callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, response, '')
        else
          callBackFunction(GLOBAL.CUSTOM_FAIL_RESPONSE)
      }).catch(error => {
        if (ERROR_LOG === true) { console.log(MODULE_NAME + ' : ' + '[ERROR] FileCloud -> getBlobToText -> Invalid JSON received: ' + error.message, error.stack) }
        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE, '', '')
      })

    } catch (err) {
      if (ERROR_LOG === true) { console.log('[ERROR] FileCloud -> getBlobToText -> err = ' + err.message, err.stack) }
    }
  }
}
