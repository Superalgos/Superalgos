
function newFileSequence () {
  const MODULE_NAME = 'File Sequence'
  const INFO_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    eventHandler: undefined,
    getFile: getFile,
    getExpectedFiles: getExpectedFiles,
    getFilesLoaded: getFilesLoaded,
    initialize: initialize,
    finalize: finalize
  }

  let filesLoaded = 0
  let fileCloud
  let files = new Map()
  let maxSequence = -1 // This is replaced by the content of the sequence file, which contains an index that starts on zero. In the case that the sequence file is not found the default value is -1 so when you add 1 it gives you the amount of files in the sequence, zero.
  let market
  let dataMine
  let bot
  let session
  let thisSet
  let product
  let finalized = false
  let initialized = false

  thisObject.eventHandler = newEventHandler()

  let eventSubscriptionIdDatasetUpdated
  let callerId

  return thisObject

  function finalize () {
    try {
      systemEventHandler.stopListening('Dataset Updated', eventSubscriptionIdDatasetUpdated)

      thisObject.eventHandler.finalize()
      thisObject.eventHandler = undefined

      filesLoaded = undefined
      fileCloud = undefined
      files = undefined
      maxSequence = undefined
      market = undefined
      dataMine = undefined
      bot = undefined
      session = undefined
      thisSet = undefined
      product = undefined

      finalized = true
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
  }

  function initialize (pDataMine, pBot, pSession, pProduct, pSet, pExchange, pMarket, callBackFunction) {
    try {
      exchange = ecosystem.getExchange(pProduct, pExchange)

      if (exchange === undefined) {
        throw 'Exchange not supoorted by this pProduct of the ecosystem! - pDataMine.codeName = ' + pDataMine.codeName + ', pBot.codeName = ' + pBot.codeName + ', pProduct.codeName = ' + pProduct.codeName + ', pExchange = ' + pExchange
      }

      market = pMarket
      dataMine = pDataMine
      bot = pBot
      session = pSession
      thisSet = pSet
      product = pProduct

      fileCloud = newFileCloud()
      fileCloud.initialize(bot)

      callerId = newUniqueId()

      let key = dataMine.codeName + '-' + bot.codeName + '-' + product.codeName + '-' + thisSet.codeName
      systemEventHandler.listenToEvent(key, 'Dataset Updated', undefined, callerId, onResponse, updateFiles)

      function onResponse (message) {
        eventSubscriptionIdDatasetUpdated = message.eventSubscriptionId
      }

            /* First we will get the sequence max number */

      fileCloud.getFile(dataMine, bot, session, thisSet, exchange, market, undefined, undefined, 'Sequence', undefined, onSequenceFileReceived)

      function onSequenceFileReceived (err, file) {
        try {
          if (finalized === true) { return }

          switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
              break
            }

            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
              return
            }

            case GLOBAL.CUSTOM_OK_RESPONSE.result: {
              if (ERROR_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> err.message = ' + err.message) }
              initialized = true
              callBackFunction(err)
              return
            }

            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
              if (err.message === 'File does not exist.') { // We will assume that the process which generates the files has never been started, that does not imply that we can wait for data to come later.
                initialized = true
                callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
                return
              }
              if (ERROR_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> err.message = ' + err.message) }
              callBackFunction(err, thisObject)
              return
            }

            default: {
              callBackFunction(err)
              return
            }
          }
          initialized = true
          maxSequence = Number(file)

                    /* Now we will get the sequence of files */

          for (let i = 0; i <= maxSequence; i++) {
            fileCloud.getFile(dataMine, bot, session, thisSet, exchange, market, undefined, undefined, i, undefined, onFileReceived)

            function onFileReceived (err, file) {
              try {
                if (finalized === true) { return }
                switch (err.result) {
                  case GLOBAL.DEFAULT_OK_RESPONSE.result: {
                    break
                  }

                  case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
                    callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                    return
                  }

                  case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
                    if (ERROR_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> onFileReceived -> err.message = ' + err.message) }
                    callBackFunction(err)
                    return
                  }

                  default: {
                    callBackFunction(err)
                    return
                  }
                }

                files.set(i, file)

                filesLoaded++

                callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, thisObject) // Note that the callback is called for every file loaded.
              } catch (err) {
                if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onSequenceFileReceived -> onFileReceived -> err = ' + err.stack) }
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
              }
            }
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onSequenceFileReceived -> err = ' + err.stack) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function updateFiles () {
    try {
      if (finalized === true || initialized === false) { return }

            /*

            To keep this data structure up-to-date we need to:

            1. Re-read the sequence file.
            2. Re-load the current last file.
            3. Re-load all new files after our last one.

            */

      let currentMaxSequence = maxSequence

      fileCloud.getFile(dataMine, bot, session, thisSet, exchange, market, undefined, undefined, 'Sequence', undefined, onSequenceFileReceived)

      function onSequenceFileReceived (err, sequenceFile) {
        try {
          if (finalized === true) { return }
          switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
              break
            }

            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
              return
            }

            case GLOBAL.CUSTOM_OK_RESPONSE.result: {
              if (ERROR_LOG === true) { logger.write('[WARN] updateFiles -> onSequenceFileReceived -> err.message = ' + err.message) }
              return
            }

            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
              if (ERROR_LOG === true) { logger.write('[WARN] updateFiles -> onSequenceFileReceived -> err.message = ' + err.message) }
              return
            }

            default: {
              if (ERROR_LOG === true) { logger.write('[WARN] updateFiles -> onSequenceFileReceived -> Received Unexpected Response.') }
              return
            }
          }

          maxSequence = Number(sequenceFile)
          filesLoaded = 0

                    /* Now we will get the sequence of files, but in this case only from the currentMaxSequence and above. */

          for (let i = currentMaxSequence; i <= maxSequence; i++) {
            fileCloud.getFile(dataMine, bot, session, thisSet, exchange, market, undefined, undefined, i, undefined, onFileReceived)

            function onFileReceived (err, file) {
              try {
                if (finalized === true) { return }
                switch (err.result) {
                  case GLOBAL.DEFAULT_OK_RESPONSE.result: {
                    break
                  }
                  case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
                    return
                  }
                  case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
                    if (ERROR_LOG === true) { logger.write('[WARN] updateFiles -> onSequenceFileReceived -> onFileReceived -> err.message = ' + err.message) }
                    return
                  }
                }

                files.set(i, file)

                filesLoaded++

                if (filesLoaded === maxSequence + 1) {
                  thisObject.eventHandler.raiseEvent('Files Updated', undefined)
                }
              } catch (err) {
                if (ERROR_LOG === true) { logger.write('[ERROR] updateFiles -> onSequenceFileReceived -> onFileReceived -> err = ' + err.stack) }
              }
            }
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] updateFiles -> onSequenceFileReceived -> err = ' + err.stack) }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] updateFiles -> err = ' + err.stack) }
    }
  }

  function getFile (pSequence) {
    return files.get(pSequence)
  }

  function getExpectedFiles () {
    return maxSequence + 1
  }

  function getFilesLoaded () {
    return filesLoaded
  }
}
