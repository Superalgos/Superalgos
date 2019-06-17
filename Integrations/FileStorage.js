const axios = require('axios')

exports.newFileStorage = function newFileStorage() {
  const INFO_LOG = true
  const ERROR_LOG = true

  let thisObject = {
    getTextFile,
    createTextFile
  }

  return thisObject

  function getTextFile(container, filePath, callBackFunction) {
    try {
      if (INFO_LOG === true) { console.log('[INFO] getTextFile -> Entering function: ' + filePath) }

      axios({
        url: process.env.HOST_URL + 'graphql',
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
              storage: process.env.HOST_STORAGE,
              accessKey: process.env.HOST_ACCESS_KEY
            }
          }
        }
      }).then(res => {
        if (res.data.errors) {
          let error = {
            code: res.data.errors[0]
          }
          callBackFunction(error)
          return
        }
        let response = res.data.data.web_FileContent
        if (response)
          callBackFunction(global.DEFAULT_OK_RESPONSE, response)
        else
          callBackFunction(global.CUSTOM_FAIL_RESPONSE)
      }).catch(error => {
        if (ERROR_LOG === true) { console.log('newFileStorage: [ERROR] getTextFile -> Invalid JSON received. ') }
        if (ERROR_LOG === true) { console.log('newFileStorage: [ERROR] getTextFile -> response.text = ' + error.message) }
        callBackFunction(global.DEFAULT_FAIL_RESPONSE)
      })
    } catch (err) {
      if (ERROR_LOG === true) { console.log('[ERROR] getTextFile -> err = ' + err.stack) }
    }
  }

  async function createTextFile(container, filePath, fileContent, callBackFunction) {
    try {
      if (INFO_LOG === true) { console.log('[INFO] createTextFile -> Entering function: ' + filePath) }

      let response = await axios({
        url: process.env.HOST_URL + 'graphql',
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
              storage: process.env.HOST_STORAGE,
              accessKey: process.env.HOST_ACCESS_KEY,
              fileContent
            }
          }
        }
      })

      if(!response){
        console.log('[ERROR] createTextFile -> err = ')
      }

      // .then(res => {
      //   if (res.data.errors) {
      //     let error = {
      //       code: res.data.errors[0]
      //     }
      //     callBackFunction(error)
      //     return
      //   }
      //   let response = res.data.data.web_CreateFile
      //   if (response)
      //     callBackFunction(global.DEFAULT_OK_RESPONSE)
      //   else
      //     callBackFunction(global.CUSTOM_FAIL_RESPONSE)
      // }).catch(error => {
      //   if (ERROR_LOG === true) { console.log('newFileStorage: [ERROR] createTextFile -> Invalid JSON received. ') }
      //   if (ERROR_LOG === true) { console.log('newFileStorage: [ERROR] createTextFile -> response.text = ' + error.message) }
      //   callBackFunction(global.DEFAULT_FAIL_RESPONSE)
      // })
    } catch (err) {
      if (ERROR_LOG === true) { console.log('[ERROR] createTextFile -> err = ' + err.stack) }
    }
  }

}
