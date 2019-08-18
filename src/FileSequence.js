
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
  let devTeam
  let bot
  let thisSet
  let product
  let finalized = false
  let initialized = false

  thisObject.eventHandler = newEventHandler()

  let intervalHandle

  return thisObject

  function finalize () {
    try {
      clearInterval(intervalHandle)

      filesLoaded = undefined
      fileCloud = undefined
      files = undefined
      maxSequence = undefined
      finalized = true
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
  }

  function initialize (pDevTeam, pBot, pProduct, pSet, pExchange, pMarket, callBackFunction) {
    try {
      exchange = ecosystem.getExchange(pProduct, pExchange)

      if (exchange === undefined) {
        throw 'Exchange not supoorted by this pProduct of the ecosystem! - pDevTeam.codeName = ' + pDevTeam.codeName + ', pBot.codeName = ' + pBot.codeName + ', pProduct.codeName = ' + pProduct.codeName + ', pExchange = ' + pExchange
      }

      intervalHandle = setInterval(updateFiles, _1_MINUTE_IN_MILISECONDS)

      market = pMarket
      devTeam = pDevTeam
      bot = pBot
      thisSet = pSet
      product = pProduct

      fileCloud = newFileCloud()
      fileCloud.initialize(bot)

            /* First we will get the sequence max number */

      fileCloud.getFile(devTeam, bot, thisSet, exchange, market, undefined, undefined, 'Sequence', undefined, onSequenceFileReceived)

      function onSequenceFileReceived (err, file) {
        try {
          initialized = true

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

              callBackFunction(err)
              return
            }

            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
              if (ERROR_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> err.message = ' + err.message) }

              callBackFunction(err, thisObject)
              return
            }

            default: {
              callBackFunction(err)
              return
            }
          }

          maxSequence = Number(file)

                    /* Now we will get the sequence of files */

          for (let i = 0; i <= maxSequence; i++) {
            fileCloud.getFile(devTeam, bot, thisSet, exchange, market, undefined, undefined, i, undefined, onFileReceived)

            function onFileReceived (err, file) {
              try {
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

      logger.write('[INFO] updateFiles -> Entering function.')

            /*

            To keep this data structure up-to-date we need to:

            1. Re-read the sequence file.
            2. Re-load the current last file.
            3. Re-load all new files after our last one.

            */

      let currentMaxSequence = maxSequence

      fileCloud.getFile(devTeam, bot, thisSet, exchange, market, undefined, undefined, 'Sequence', undefined, onSequenceFileReceived)

      function onSequenceFileReceived (err, file) {
        try {
          switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
              break
            }

            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
              return
            }

            case GLOBAL.CUSTOM_OK_RESPONSE.result: {
              if (ERROR_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> err.message = ' + err.message) }
              return
            }

            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
              if (ERROR_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> err.message = ' + err.message) }
              return
            }

            default: {
              if (ERROR_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> Received Unexpected Response.') }
              return
            }
          }

          maxSequence = Number(file)

                    /* Now we will get the sequence of files, but in this case only from the currentMaxSequence and above. */

          for (let i = currentMaxSequence; i <= maxSequence; i++) {
            fileCloud.getFile(devTeam, bot, thisSet, exchange, market, undefined, undefined, i, undefined, onFileReceived)

            function onFileReceived (err, file) {
              try {
                switch (err.result) {
                  case GLOBAL.DEFAULT_OK_RESPONSE.result: {
                    break
                  }

                  case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
                    return
                  }

                  case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
                    if (ERROR_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> onFileReceived -> err.message = ' + err.message) }
                    return
                  }

                  default: {
                    return
                  }
                }

                files.set(i, file)

                if (i !== currentMaxSequence) {
                  filesLoaded++
                }

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
