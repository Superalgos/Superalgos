
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

  thisObject.eventHandler = newEventHandler()

  let intervalHandle

  return thisObject

  function finalize () {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] finalize -> Entering function.') }
      if (INFO_LOG === true) { logger.write('[INFO] finalize -> devTeam = ' + devTeam.codeName) }
      if (INFO_LOG === true) { logger.write('[INFO] finalize -> bot = ' + bot.codeName) }
      if (INFO_LOG === true) { logger.write('[INFO] finalize -> thisSet = ' + thisSet.codeName) }
      if (INFO_LOG === true) { logger.write('[INFO] finalize -> intervalHandle = ' + intervalHandle) }

      clearInterval(intervalHandle)

      filesLoaded = undefined
      fileCloud = undefined
      files = undefined
      maxSequence = undefined
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err) }
    }
  }

  function initialize (pDevTeam, pBot, pProduct, pSet, pExchange, pMarket, callBackFunction, pOperationsId) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> Entering function.') }
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> key = ' + pDevTeam.codeName + '-' + pBot.codeName + '-' + pProduct.codeName) }

      exchange = ecosystem.getExchange(pProduct, pExchange)

      if (exchange === undefined) {
        throw 'Exchange not supoorted by this pProduct of the ecosystem! - pDevTeam.codeName = ' + pDevTeam.codeName + ', pBot.codeName = ' + pBot.codeName + ', pProduct.codeName = ' + pProduct.codeName + ', pExchange = ' + pExchange
      }


      if (pOperationsId !== undefined) {
        intervalHandle = setInterval(function () { updateFiles(pOperationsId) }, _1_MINUTE_IN_MILISECONDS)
      } else {
        intervalHandle = setInterval(updateFiles, _1_MINUTE_IN_MILISECONDS)
      }

      if (INFO_LOG === true) { logger.write('[INFO] initialize -> intervalHandle = ' + intervalHandle) }

      market = pMarket
      devTeam = pDevTeam
      bot = pBot
      thisSet = pSet
      product = pProduct

      fileCloud = newFileCloud()
      fileCloud.initialize(bot)

            /* First we will get the sequence max number */

      if (pOperationsId !== undefined) {
        fileCloud.getFile(devTeam, bot, thisSet, exchange, market, undefined, undefined, 'Sequence', undefined, onSequenceFileReceived, pOperationsId)
      } else {
        fileCloud.getFile(devTeam, bot, thisSet, exchange, market, undefined, undefined, 'Sequence', undefined, onSequenceFileReceived)
      }

      function onSequenceFileReceived (err, file) {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> Entering function.') }
          if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> key = ' + devTeam.codeName + '-' + bot.codeName + '-' + product.codeName) }

          switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> Received OK Response.') }
              break
            }

            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> Received FAIL Response.') }
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
              return
            }

            case GLOBAL.CUSTOM_OK_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> Received CUSTOM OK Response.') }
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> err.message = ' + err.message) }

              callBackFunction(err)
              return
            }

            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> Received CUSTOM FAIL Response.') }
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> err.message = ' + err.message) }

              callBackFunction(err, thisObject)
              return
            }

            default: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> Received Unexpected Response.') }
              callBackFunction(err)
              return
            }
          }

          maxSequence = Number(file)

          if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> maxSequence = ' + maxSequence) }

                    /* Now we will get the sequence of files */

          for (let i = 0; i <= maxSequence; i++) {
            if (pOperationsId !== undefined) {
              fileCloud.getFile(devTeam, bot, thisSet, exchange, market, undefined, undefined, i, undefined, onFileReceived, pOperationsId)
            } else {
              fileCloud.getFile(devTeam, bot, thisSet, exchange, market, undefined, undefined, i, undefined, onFileReceived)
            }

            function onFileReceived (err, file) {
              try {
                switch (err.result) {
                  case GLOBAL.DEFAULT_OK_RESPONSE.result: {
                    if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> onFileReceived -> Received OK Response.') }
                    break
                  }

                  case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
                    if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> onFileReceived -> Received FAIL Response.') }
                    callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                    return
                  }

                  case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
                    if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> onFileReceived -> Received CUSTOM FAIL Response.') }
                    if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> onFileReceived -> err.message = ' + err.message) }

                    callBackFunction(err)
                    return
                  }

                  default: {
                    if (INFO_LOG === true) { logger.write('[INFO] initialize -> onSequenceFileReceived -> onFileReceived -> Received Unexpected Response.') }
                    callBackFunction(err)
                    return
                  }
                }

                files.set(i, file)

                filesLoaded++

                callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, thisObject) // Note that the callback is called for every file loaded.
              } catch (err) {
                if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onSequenceFileReceived -> onFileReceived -> err = ' + err) }
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
              }
            }
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onSequenceFileReceived -> err = ' + err) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function updateFiles (pOperationsId) {
    try {
      let updateFiles = 0

      if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> Entering function.') }

            /*

            To keep this data structure up-to-date we need to:

            1. Re-read the sequence file.
            2. Re-load the current last file.
            3. Re-load all new files after our last one.

            */

      let currentMaxSequence = maxSequence

      if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> currentMaxSequence = ' + currentMaxSequence) }
      if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> intervalHandle = ' + intervalHandle) }

      if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> devTeam = ' + devTeam.codeName) }
      if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> bot = ' + bot.codeName) }
      if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> thisSet = ' + thisSet.codeName) }

      if (pOperationsId !== undefined) {
        fileCloud.getFile(devTeam, bot, thisSet, exchange, market, undefined, undefined, 'Sequence', undefined, onSequenceFileReceived, pOperationsId)
      } else {
        fileCloud.getFile(devTeam, bot, thisSet, exchange, market, undefined, undefined, 'Sequence', undefined, onSequenceFileReceived)
      }

      function onSequenceFileReceived (err, file) {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> Entering function.') }
          if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> key = ' + devTeam.codeName + '-' + bot.codeName + '-' + product.codeName) }

          switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> Received OK Response.') }
              break
            }

            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> Received FAIL Response.') }
              return
            }

            case GLOBAL.CUSTOM_OK_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> Received CUSTOM OK Response.') }
              if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> err.message = ' + err.message) }
              return
            }

            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> Received CUSTOM FAIL Response.') }
              if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> err.message = ' + err.message) }
              return
            }

            default: {
              if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> Received Unexpected Response.') }
              return
            }
          }

          maxSequence = Number(file)

          if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> maxSequence = ' + maxSequence) }

                    /* Now we will get the sequence of files, but in this case only from the currentMaxSequence and above. */

          for (let i = currentMaxSequence; i <= maxSequence; i++) {
            if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> i = ' + i) }

            if (pOperationsId !== undefined) {
              fileCloud.getFile(devTeam, bot, thisSet, exchange, market, undefined, undefined, i, undefined, onFileReceived, pOperationsId)
            } else {
              fileCloud.getFile(devTeam, bot, thisSet, exchange, market, undefined, undefined, i, undefined, onFileReceived)
            }

            function onFileReceived (err, file) {
              try {
                switch (err.result) {
                  case GLOBAL.DEFAULT_OK_RESPONSE.result: {
                    if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> onFileReceived -> Received OK Response.') }
                    break
                  }

                  case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
                    if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> onFileReceived -> Received FAIL Response.') }
                    return
                  }

                  case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
                    if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> onFileReceived -> Received CUSTOM FAIL Response.') }
                    if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> onFileReceived -> err.message = ' + err.message) }
                    return
                  }

                  default: {
                    if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> onFileReceived -> Received Unexpected Response.') }
                    return
                  }
                }

                files.set(i, file)

                if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> onFileReceived -> File Updated.') }
                if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> onFileReceived -> i = ' + i) }
                if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> onFileReceived -> file.length = ' + file.length) }
                if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> onFileReceived -> filesLoaded = ' + filesLoaded) }

                if (i !== currentMaxSequence) {
                  filesLoaded++
                  if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> onFileReceived -> filesLoaded = ' + filesLoaded) }
                }

                if (filesLoaded === maxSequence + 1) {
                  thisObject.eventHandler.raiseEvent('Files Updated', undefined)
                  if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onSequenceFileReceived -> onFileReceived -> Files Updated event Raised.') }
                }
              } catch (err) {
                if (ERROR_LOG === true) { logger.write('[ERROR] updateFiles -> onSequenceFileReceived -> onFileReceived -> err = ' + err) }
              }
            }
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] updateFiles -> onSequenceFileReceived -> err = ' + err) }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] updateFiles -> err = ' + err) }
    }
  }

  function getFile (pSequence) {
    if (INFO_LOG === true) { logger.write('[INFO] getFile -> Entering function.') }
    if (INFO_LOG === true) { logger.write('[INFO] getFile -> pSequence = ' + pSequence) }

    return files.get(pSequence)
  }

  function getExpectedFiles () {
    if (INFO_LOG === true) { logger.write('[INFO] getExpectedFiles -> Entering function.') }

    return maxSequence + 1
  }

  function getFilesLoaded () {
    if (INFO_LOG === true) { logger.write('[INFO] getFilesLoaded -> Entering function.') }

    return filesLoaded
  }
}
