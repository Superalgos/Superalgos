 ﻿
function newMarketFiles () {
  const MODULE_NAME = 'Market Files'
  const INFO_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    eventHandler: undefined,
    getFile: getFile,
    getExpectedFiles: getExpectedFiles,
    getFilesLoaded: getFilesLoaded,
    getFilesNotLoaded: getFilesNotLoaded,
    initialize: initialize,
    finalize: finalize
  }

  let filesLoaded = 0
  let filesNotLoaded = 0

  let fileCloud

  let files = new Map()

  let market
  let exchange
  let devTeam
  let bot
  let thisSet
  let periodName

  thisObject.eventHandler = newEventHandler()

  let intervalHandle
  let finalized = false

  return thisObject

  function finalize () {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] finalize -> Entering function.') }

      clearInterval(intervalHandle)

      filesLoaded = undefined
      files = undefined
      finalized = true
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
  }

  function initialize (pDevTeam, pBot, pProduct, pSet, pExchange, pMarket, callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> Entering function.') }
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> key = ' + pDevTeam.codeName + '-' + pBot.codeName + '-' + pProduct.codeName) }

      exchange = ecosystem.getExchange(pProduct, pExchange)

      if (exchange === undefined) {
        throw 'Exchange not supoorted by this pProduct of the ecosystem! - pDevTeam.codeName = ' + pDevTeam.codeName + ', pBot.codeName = ' + pBot.codeName + ', pProduct.codeName = ' + pProduct.codeName + ', pExchange = ' + pExchange
      }

      intervalHandle = setInterval(updateFiles, _10_MINUTES_IN_MILISECONDS)

      market = pMarket
      devTeam = pDevTeam
      bot = pBot
      thisSet = pSet

      fileCloud = newFileCloud()
      fileCloud.initialize(pBot)

            /* Now we will get the market files */

      for (let i = 0; i < marketFilesPeriods.length; i++) {
        let periodTime = marketFilesPeriods[i][0]
        let periodName = marketFilesPeriods[i][1]

        if (thisSet.validPeriods.includes(periodName) === true) {
          fileCloud.getFile(devTeam, bot, thisSet, exchange, market, periodName, undefined, undefined, undefined, onFileReceived)

          function onFileReceived (err, file) {
            try {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> Entering function.') }

              if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                files.set(periodTime, file)
                filesLoaded++
              } else {
                filesNotLoaded++
              }

              if (filesLoaded + filesNotLoaded === marketFilesPeriods.length) {
                if (filesLoaded > filesNotLoaded) {
                  callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, thisObject)
                } else {
                  callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE, thisObject)
                }
              }
            } catch (err) {
              if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onFileReceived -> err = ' + err.stack) }
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
          }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function updateFiles () {
    try {
      if (finalized === true) { return }
      let updateFiles = 0

      if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> Entering function.') }

            /* Now we will get the market files */

      for (let i = 0; i < marketFilesPeriods.length; i++) {
        let periodTime = marketFilesPeriods[i][0]
        let periodName = marketFilesPeriods[i][1]

        if (thisSet.validPeriods.includes(periodName) === true) {
          fileCloud.getFile(devTeam, bot, thisSet, exchange, market, periodName, undefined, undefined, undefined, onFileReceived)

          function onFileReceived (err, file) {
            try {
              if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onFileReceived -> Entering function.') }

              switch (err.result) {
                case GLOBAL.DEFAULT_OK_RESPONSE.result: {
                  if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onFileReceived -> Received OK Response.') }
                  break
                }

                case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
                  if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onFileReceived -> Received FAIL Response.') }
                  return
                }

                case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
                  if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onFileReceived -> Received CUSTOM FAIL Response.') }
                  if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onFileReceived -> err.message = ' + err.message) }
                  return
                }

                default: {
                  if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onFileReceived -> Received Unexpected Response.') }
                  return
                }
              }

              files.set(periodTime, file)
              updateFiles++

              if (updateFiles === marketFilesPeriods.length) {
                if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onFileReceived -> All files received. ') }
                if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onFileReceived -> devTeam = ' + devTeam.codeName) }
                if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onFileReceived -> bot = ' + bot.codeName) }
                if (INFO_LOG === true) { logger.write('[INFO] updateFiles -> onFileReceived -> thisSet = ' + thisSet.codeName) }

                thisObject.eventHandler.raiseEvent('Files Updated', undefined)
              }
            } catch (err) {
              if (ERROR_LOG === true) { logger.write('[ERROR] updateFiles -> onFileReceived -> err = ' + err.stack) }
            }
          }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] updateFiles -> err = ' + err.stack) }
    }
  }

  function getFile (pPeriod) {
    return files.get(pPeriod)
  }

  function getExpectedFiles () {
    return marketFilesPeriods.length
  }

  function getFilesLoaded () {
    return filesLoaded
  }

  function getFilesNotLoaded () {
    return filesNotLoaded
  }
}
