const axios = require('axios')
const Ecosystem = require('./Ecosystem')
let fs = require('fs')
const { promisify } = require('util')
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const path = require('path')

exports.newFileStorage = function newFileStorage() {
  const MODULE_NAME = 'FileStorage'
  const MAX_RETRY = 30
  let currentRetryGetTextFile = 0
  let currentRetryWriteTextFile = 0

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

  return {
    getTextFile,
    createTextFile
  }

  function logInfo(message) {
    log('[INFO] ' + message)
  }
  function log(message) {
    console.log("['" + new Date().toISOString() + "', 0,'" + MODULE_NAME + "','" + message + "']")
  }

  function logError(message) {
    log('[ERROR] ' + message)
  }

  async function getTextFile(container, filePath, callBackFunction) {


    try {
      let host = await getDevTeamHost(container)

      if (host.url.indexOf('localhost') !== -1) {
          let fileLocation = process.env.STORAGE_PATH + '/' + container + '/' + filePath

          logInfo('getTextFile: ' + fileLocation)

        let fileContent = await readFileAsync(fileLocation)
        callBackFunction(global.DEFAULT_OK_RESPONSE, fileContent.toString())
      } else {
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

        if (response.data.errors) {
          callBackFunction({ code: response.data.errors[0] })
          return
        }

        if (response.data.data.web_FileContent) {
          callBackFunction(global.DEFAULT_OK_RESPONSE, response.data.data.web_FileContent)
        } else {
          callBackFunction({ code: 'The specified key does not exist.' })
        }
      }
    } catch (err) {
      if (verifyRetry(err.code) && currentRetryGetTextFile < MAX_RETRY) {
        currentRetryGetTextFile++
        logInfo('getTextFile -> Retrying connection to the server because received error: ' + err.code + '. Retry #: ' + currentRetryGetTextFile)
        getTextFile(container, filePath, callBackFunction)
      } else if (err.code === 'ENOENT') {
        callBackFunction({ code: 'The specified key does not exist.' })
      } else {
        currentRetryGetTextFile = 0
        logError('getTextFile -> error = ' + err.message)
        callBackFunction(global.DEFAULT_FAIL_RESPONSE)
      }
    }
  }

  async function createTextFile(container, filePath, fileContent, callBackFunction) {

    try {
      let host = await getDevTeamHost(container)

      if (host.url.indexOf('localhost') !== -1) {
          let fileLocation = process.env.STORAGE_PATH + '/' + container + '/' + filePath
          logInfo('createTextFile: ' + fileLocation)
        let directoryPath = fileLocation.substring(0, fileLocation.lastIndexOf('/') + 1);
        mkDirByPathSync(directoryPath)
        await writeFileAsync(fileLocation, fileContent)
        callBackFunction(global.DEFAULT_OK_RESPONSE)
      } else {
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

        if (!response || response.data.errors) {
          let customErr = {
            result: global.CUSTOM_FAIL_RESPONSE.result,
            message: response.data.errors[0]
          }
          callBackFunction(customErr)
        } else {
          callBackFunction(global.DEFAULT_OK_RESPONSE)
        }
      }

    } catch (err) {
      if (verifyRetry(err.code) && currentRetryWriteTextFile < MAX_RETRY) {
        currentRetryWriteTextFile++
        logInfo('createTextFile -> Retrying connection to the server because received error: ' + err.code + '. Retry #: ' + currentRetryWriteTextFile)
        createTextFile(container, filePath, fileContent, callBackFunction)
      } else {
        currentRetryWriteTextFile = 0
        logError('createTextFile -> error = ' + err.message)
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

  function verifyRetry(errorCode) {
    for (let i = 0; i < recoverableErrors.length; i++) {
      const error = recoverableErrors[i];
      if (error === errorCode) {
        return true
      }
    }
    return false
  }

  function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
    const sep = '/';
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';

    return targetDir.split(sep).reduce((parentDir, childDir) => {
      const curDir = path.resolve(baseDir, parentDir, childDir);
      try {
        fs.mkdirSync(curDir);
      } catch (err) {
        if (err.code === 'EEXIST') { // curDir already exists!
          return curDir;
        }

        // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
        if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
          throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
        }

        const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
        if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
          throw err; // Throw if it's just the last created dir.
        }
      }

      return curDir;
    }, initDir);
  }
}
