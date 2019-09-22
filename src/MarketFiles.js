 ﻿
function newMarketFiles () {
  const MODULE_NAME = 'Market Files'
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
      clearInterval(intervalHandle)

      filesLoaded = undefined
      files = undefined
      finalized = true

      thisObject.eventHandler.finalize()
      thisObject.eventHandler = undefined
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
              if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                files.set(periodTime, file)
                filesLoaded++
              } else {
                filesNotLoaded++
              }

              if (filesLoaded + filesNotLoaded === marketFilesPeriods.length) {
                callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, thisObject)
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
      let updatedFiles = 0

            /* Now we will get the market files */

      for (let i = 0; i < marketFilesPeriods.length; i++) {
        let periodTime = marketFilesPeriods[i][0]
        let periodName = marketFilesPeriods[i][1]

        if (thisSet.validPeriods.includes(periodName) === true) {
          fileCloud.getFile(devTeam, bot, thisSet, exchange, market, periodName, undefined, undefined, undefined, onFileReceived)

          function onFileReceived (err, file) {
            try {
              files.set(periodTime, file)
              updatedFiles++

              if (updatedFiles === marketFilesPeriods.length) {
                thisObject.eventHandler.raiseEvent('Files Updated')
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
