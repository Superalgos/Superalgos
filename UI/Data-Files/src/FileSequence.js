
function newFileSequence () {
  const MODULE_NAME = 'File Sequence'
  const INFO_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  

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
  let mine
  let bot
  let session
  let dataset
  let product
  let finalized = false
  let initialized = false

  thisObject.eventHandler = newEventHandler()

  let eventSubscriptionIdDatasetUpdated
  let callerId
  let eventsServerClient

  return thisObject

  function finalize () {
    try {
      eventsServerClient.stopListening('Dataset Updated', eventSubscriptionIdDatasetUpdated)

      thisObject.eventHandler.finalize()
      thisObject.eventHandler = undefined

      filesLoaded = undefined
      fileCloud = undefined
      files = undefined
      maxSequence = undefined
      market = undefined
      mine = undefined
      bot = undefined
      session = undefined
      dataset = undefined
      product = undefined
      eventsServerClient = undefined

      finalized = true
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
  }

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
      exchange = pExchange
      market = pMarket
      mine = pMine
      bot = pBot
      session = pSession
      dataset = pDataset
      product = pProduct
      eventsServerClient = pEventsServerClient

      fileCloud = newFileCloud()
      fileCloud.initialize(bot, pHost, pPort)

      callerId = newUniqueId()

      let key = mine.config.codeName + '-' + bot.config.codeName + '-' + product.config.codeName + '-' + dataset.config.codeName + '-' + exchange.config.codeName + '-' + market.baseAsset + '/' + market.quotedAsset
      eventsServerClient.listenToEvent(key, 'Dataset Updated', undefined, callerId, onResponse, updateFiles)

      function onResponse (message) {
        eventSubscriptionIdDatasetUpdated = message.eventSubscriptionId
      }

            /* First we will get the sequence max number */

      fileCloud.getFile(mine, bot, session, product, dataset, exchange, market, undefined, undefined, 'Sequence', undefined, undefined, onSequenceFileReceived)

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
            fileCloud.getFile(mine, bot, session, product, dataset, exchange, market, undefined, undefined, i, undefined, undefined, onFileReceived)

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

      fileCloud.getFile(mine, bot, session, product, dataset, exchange, market, undefined, undefined, 'Sequence', undefined, undefined, onSequenceFileReceived)

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
            fileCloud.getFile(mine, bot, session, product, dataset, exchange, market, undefined, undefined, i, undefined, undefined, onFileReceived)

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
