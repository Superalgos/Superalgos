 ﻿
function newSingleFile () {
  const MODULE_NAME = 'Single File'
  const INFO_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  

  let thisObject = {
    getFile: getFile,
    initialize: initialize
  }

  let fileCloud
  let file

  return thisObject

  function initialize (
    pMine,
    pBot,
    pSession,
    pProduct,
    pDataset,
    pExchange,
    pMarket,
    pHost,
    pPort,
    pEventsServerClient,
    callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> Entering function.') }
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> key = ' + pMine.config.codeName + '-' + pBot.config.codeName + '-' + pProduct.config.codeName) }

      let exchange = pExchange

      fileCloud = newFileCloud()
      fileCloud.initialize(pBot, pHost, pPort)

            /* Now we will get the file */

      fileCloud.getFile(pMine, pBot, pSession, pProduct, pDataset, exchange, pMarket, undefined, undefined, undefined, undefined, undefined, onFileReceived)

      function onFileReceived (err, pFile) {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> Entering function.') }

          switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> Received OK Response.') }
              break
            }

            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> Received FAIL Response.') }
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
              return
            }

            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> Received CUSTOM FAIL Response.') }
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> err.message = ' + err.message) }

              callBackFunction(err)
              return
            }

            default: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> Received Unexpected Response.') }
              callBackFunction(err)
              return
            }
          }

          file = pFile

          callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onFileReceived -> err = ' + err.stack) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function getFile () {
    if (INFO_LOG === true) { logger.write('[INFO] getFile -> Entering function.') }

    return file
  }
}
