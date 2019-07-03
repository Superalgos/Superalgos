const axios = require('axios')
const Ecosystem = require('./Ecosystem')

exports.newFileStorage = function newFileStorage() {
  const INFO_LOG = true
  const ERROR_LOG = true

  let thisObject = {
    getTextFile,
    createTextFile
  }

  return thisObject

  async function getTextFile(container, filePath, callBackFunction) {
    try {
      if (INFO_LOG === true) { console.log('[INFO] getTextFile -> Entering function: ' + container.toLowerCase() + '/' + filePath) }

      let host = await getDevTeamHost(container)

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
              container: container.toLowerCase(),
              filePath,
              storage: host.storage,
              accessKey: host.accessKey
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
        if (response){
          callBackFunction(global.DEFAULT_OK_RESPONSE, response)
        } else{
          let error = { code: 'The specified key does not exist.' }
          callBackFunction(error)
        }
      }).catch(error => {
        if (ERROR_LOG === true) { console.log('newFileStorage: [ERROR] getTextFile -> Invalid JSON received. ') }
        if (ERROR_LOG === true) { console.log('newFileStorage: [ERROR] getTextFile -> error = ', error) }
        callBackFunction(global.DEFAULT_FAIL_RESPONSE)
      })
    } catch (err) {
      if (ERROR_LOG === true) { console.log('[ERROR] getTextFile -> err = ', err) }
      if (ERROR_LOG === true) { console.log('[ERROR] getTextFile -> stack = ', err.stack) }
      callBackFunction(global.DEFAULT_FAIL_RESPONSE)
    }
  }

  async function createTextFile(container, filePath, fileContent, callBackFunction) {
    try {
      if (INFO_LOG === true) { console.log('[INFO] createTextFile -> Entering function: ' + container.toLowerCase() + '/' + filePath) }

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
              accessKey: '', //TODO Pending
              fileContent
            }
          }
        }
      })

      if (!response || response.data.errors)
        callBackFunction(global.CUSTOM_FAIL_RESPONSE)
      else
        callBackFunction(global.DEFAULT_OK_RESPONSE)

    } catch (err) {
      if (ERROR_LOG === true) { console.log('[ERROR] createTextFile -> err = ', err.stack) }
      if (ERROR_LOG === true) { console.log('[ERROR] createTextFile -> stack = ', err.stack) }
      callBackFunction(global.DEFAULT_FAIL_RESPONSE)
    }
  }

  async function getDevTeamHost(devTeamName) {
    let ecosystem = await Ecosystem.getEcosystem()

    for (var i = 0; i < ecosystem.devTeams.length; i++) {
      for (key in ecosystem.devTeams[i]) {
        if (key ==='codeName' && ecosystem.devTeams[i][key].toLowerCase().indexOf(devTeamName.toLowerCase())!=-1) {
          return ecosystem.devTeams[i].host
        }
      }
    }
  }
}
