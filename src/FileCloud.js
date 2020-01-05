
function newFileCloud () {
  const MODULE_NAME = 'File Cloud'
  const INFO_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  /*

  This is the module in the system that actually connects to the cloud storage and grabs from there the needed files.

  */

  let thisObject = {
    getFile: getFile,
    initialize: initialize
  }

  let blobService

  return thisObject

  function initialize (pBot) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> Entering function.') }
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> pBot = ' + pBot.codeName) }

      switch (STORAGE_PROVIDER) {
        case 'Azure': {
          blobService = AzureStorage.Blob.createBlobServiceWithSas(pBot.storage.fileUri, pBot.storage.sas)
          break
        }
        case 'AAWeb': {
          blobService = newFileStorage()
          break
        }
        default: {
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> Storage Provider not supported -> process.env.STORAGE_PROVIDER = ' + STORAGE_PROVIDER) }
          return
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
      // callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);  TODO> Handle this callback.
    }
  }

  function getFile (pDataMine, pBot, pSession, pSet, pExchange, pMarket, pPeriodName, pDatetime, pSequence, pDataRange, callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] getFile -> Entering function.') }

      const MAX_RETRIES = 3

      getFileRecursively(0, pDataMine, pBot, pSession, pSet, pExchange, pMarket, pPeriodName, pDatetime, pSequence, pDataRange, callBackFunction)

      function getFileRecursively (pRetryCounter, pDataMine, pBot, pSession, pSet, pExchange, pMarket, pPeriodName, pDatetime, pSequence, pDataRange, callBackFunction) {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] getFile -> getFileRecursively -> Entering function.') }
          if (INFO_LOG === true) { logger.write('[INFO] getFile -> getFileRecursively -> key = ' + pDataMine.codeName + '-' + pBot.codeName + '-' + pSet.filePath + '-' + pSet.fileName) }

          let fileName
          let filePath

          if (pDataRange === undefined) {
            fileName = pSet.fileName
            filePath = pSet.filePath
          } else {
            if (pSet.dataRange !== undefined) {
              fileName = pSet.dataRange.fileName
              filePath = pSet.dataRange.filePath
            } else {
              let customErr = {
                result: GLOBAL.CUSTOM_FAIL_RESPONSE.result,
                message: 'Missing Configuration.'
              }

              if (ERROR_LOG === true) { logger.write('[WARN] getFile -> getFileRecursively -> onFileReceived -> customErr.message = ' + customErr.message) }
              if (ERROR_LOG === true) { logger.write('[WARN] getFile -> getFileRecursively -> onFileReceived -> Data Range configuration could not be found. ') }

              callBackFunction(customErr)
              return
            }
          }

          if (fileName === undefined) {
            logger.write('[ERROR] getFile -> getFileRecursively -> Inconsistant data. Check the following: ')
            logger.write('[ERROR] getFile -> getFileRecursively -> pDataMine = ' + JSON.stringify(pDataMine))
            logger.write('[ERROR] getFile -> getFileRecursively -> pBot = ' + JSON.stringify(pBot))
            logger.write('[ERROR] getFile -> getFileRecursively -> pSet = ' + JSON.stringify(pSet))
            logger.write('[ERROR] getFile -> getFileRecursively -> pExchange = ' + JSON.stringify(pExchange))
            logger.write('[ERROR] getFile -> getFileRecursively -> pMarket = ' + JSON.stringify(pMarket))
            logger.write('[ERROR] getFile -> getFileRecursively -> pPeriodName = ' + JSON.stringify(pPeriodName))

            throw ('Inconsistant data received.')
          }

          if (pMarket !== undefined) {
            fileName = fileName.replace('@BaseAsset', pMarket.baseAsset)
            fileName = fileName.replace('@QuotedAsset', pMarket.quotedAsset)
          }

          if (pDataMine !== undefined) {
            filePath = filePath.replace('@DataMine', pDataMine.codeName)
          }

          if (pBot !== undefined) {
            if (pBot.cloneId !== undefined) {
              filePath = filePath.replace('@Bot', pBot.codeName + '-' + pBot.cloneId)
            } else {
              filePath = filePath.replace('@Bot', pBot.codeName)
            }
          }

          if (pSession !== undefined) {
            let code
            let sessionFolderName = pSession.id
            if (pSession.code !== undefined) {
              try {
                code = JSON.parse(pSession.code)
                if (code.folderName !== undefined) {
                  sessionFolderName = code.folderName + '-' + pSession.id
                }
              } catch (err) {
                sessionFolderName = pSession.id
              }
            }
            filePath = filePath.replace('@Session', sessionFolderName)
          }

          if (pExchange !== undefined) {
            filePath = filePath.replace('@Exchange', pExchange.name)
          }

          filePath = filePath.replace('@Period', pPeriodName)

          if (pDatetime !== undefined) {
            filePath = filePath.replace('@Year', pDatetime.getUTCFullYear())
            filePath = filePath.replace('@Month', pad(pDatetime.getUTCMonth() + 1, 2))
            filePath = filePath.replace('@Day', pad(pDatetime.getUTCDate(), 2))
            filePath = filePath.replace('@Hour', pad(pDatetime.getUTCHours(), 2))
            filePath = filePath.replace('@Minute', pad(pDatetime.getUTCMinutes(), 2))
          }

          if (pSequence !== undefined) {
            fileName = fileName.replace('@Sequence', pSequence)
          }

          if (INFO_LOG === true) { logger.write('[INFO] getFile -> getFileRecursively -> filePath = ' + filePath) }
          if (INFO_LOG === true) { logger.write('[INFO] getFile -> getFileRecursively -> fileName = ' + fileName) }

          let containerName

          containerName = pDataMine.codeName.toLowerCase()

          blobService.getBlobToText(containerName, filePath + '/' + fileName, pDataMine.host, onFileReceived)

          function onFileReceived (err, text, response) {
            try {
              if (INFO_LOG === true) { logger.write('[INFO] getFile -> getFileRecursively -> onFileReceived -> Entering function.') }
              if (INFO_LOG === true) { logger.write('[INFO] getFile -> getFileRecursively -> onFileReceived -> filePath = ' + filePath) }
              if (INFO_LOG === true) { logger.write('[INFO] getFile -> getFileRecursively -> onFileReceived -> fileName = ' + fileName) }

              let data

              if (err && err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                if (err.code === 'BlobNotFound' | err.code === 'FileNotFound' | err.code === 'ParentNotFound' | err.code === 'The specified key does not exist.') {
                  let customErr = {
                    result: GLOBAL.CUSTOM_FAIL_RESPONSE.result,
                    message: 'File does not exist.'
                  }

                  if (INFO_LOG === true) { logger.write('[WARN] getFile -> getFileRecursively -> onFileReceived -> customErr.message = ' + customErr.message) }

                  callBackFunction(customErr)
                  return
                }

                if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> containerName = ' + containerName) }
                if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> filePath = ' + filePath) }
                if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> fileName = ' + fileName) }
                if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> Unexpected Error Ocurred.') }
                if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> err = ' + err.stack) }
                if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> text = ' + text) }
                if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> response = ' + response) }

                if (err.message === 'XHR error') {
                  if (pRetryCounter < MAX_RETRIES) {
                    if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> Retrying to get this file. ') }
                    if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> MAX_RETRIES = ' + MAX_RETRIES) }
                    if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> pRetryCounter = ' + pRetryCounter) }

                    getFileRecursively(pRetryCounter + 1, pDataMine, pBot, pSet, pExchange, pMarket, pPeriodName, pDatetime, pSequence, pDataRange, callBackFunction)
                    return
                  } else {
                    if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> Could not get this file from storage. ') }
                    if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> MAX_RETRIES = ' + MAX_RETRIES) }
                    if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> pRetryCounter = ' + pRetryCounter) }
                  }
                }

                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                return
              } else {
                try {
                  data = JSON.parse(text)

                  if (INFO_LOG === true) { logger.write('[INFO] getFile -> getFileRecursively -> onFileReceived -> Data received is valid JSON.') }

                  callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, data)
                  return
                } catch (err) {
                  if (ERROR_LOG === true) { logger.write('[WARN] getFile -> getFileRecursively -> onFileReceived -> err = ' + err.stack) }
                  if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> containerName = ' + containerName) }
                  if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> filePath = ' + filePath) }
                  if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> fileName = ' + fileName) }

                  let customErr = {
                    result: GLOBAL.CUSTOM_OK_RESPONSE.result,
                    message: 'Data not in JSON Format.'
                  }

                  if (ERROR_LOG === true) { logger.write('[WARN] getFile -> getFileRecursively -> onFileReceived -> customErr.message = ' + customErr.message) }

                  callBackFunction(customErr, text)
                  return
                }
              }
            } catch (err) {
              if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> onFileReceived -> err = ' + err.stack) }
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> getFileRecursively -> err = ' + err.stack) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] getFile -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }
}
