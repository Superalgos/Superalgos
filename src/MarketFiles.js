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
  let dataMine
  let bot
  let session
  let dataset
  let product
  let periodName

  thisObject.eventHandler = newEventHandler()

  let intervalHandle
  let finalized = false

  let eventSubscriptionIdDatasetUpdated = []
  let eventsServerClient

  return thisObject

  function finalize () {
    try {
      for (let i = 0; i < eventSubscriptionIdDatasetUpdated.length; i++) {
        eventsServerClient.stopListening('Dataset Updated', eventSubscriptionIdDatasetUpdated[i])
      }

      thisObject.eventHandler.finalize()
      thisObject.eventHandler = undefined

      filesLoaded = undefined
      files = undefined

      market = undefined
      exchange = undefined
      dataMine = undefined
      bot = undefined
      session = undefined
      dataset = undefined
      product = undefined
      periodName = undefined
      eventsServerClient = undefined

      finalized = true
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
  }

  function initialize (
    pDataMine,
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
      dataMine = pDataMine
      bot = pBot
      session = pSession
      dataset = pDataset
      product = pProduct
      eventsServerClient = pEventsServerClient

      fileCloud = newFileCloud()
      fileCloud.initialize(pBot, pHost, pPort)

      /* Some Validations */
      if (dataset.config.validTimeFrames === undefined) {
        if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = Can not initialize Market Files for bot ' + pBot.name) }
        if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = You need to define validTimeFrames at the Dataset config. ') }
        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        return
      }

            /* Now we will get the market files */

      for (let i = 0; i < marketFilesPeriods.length; i++) {
        let periodTime = marketFilesPeriods[i][0]
        let periodName = marketFilesPeriods[i][1]

        if (dataset.config.validTimeFrames.includes(periodName) === true) {
          fileCloud.getFile(dataMine, bot, session, product, dataset, exchange, market, periodName, undefined, undefined, undefined, undefined, onFileReceived)

          function onFileReceived (err, file) {
            try {
              if (finalized === true) { return }
              if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                files.set(periodTime, file)
                filesLoaded++
              } else {
                filesNotLoaded++
              }

              if (filesLoaded + filesNotLoaded === marketFilesPeriods.length) {
                let key = dataMine.config.codeName + '-' + bot.config.codeName + '-' + product.config.codeName + '-' + dataset.config.codeName + '-' + exchange.name + '-' + market.baseAsset + '/' + market.quotedAsset
                let callerId = key + '-' + periodName + newUniqueId()
                eventsServerClient.listenToEvent(key, 'Dataset Updated', undefined, callerId, onResponse, updateFiles)

                callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, thisObject)

                function onResponse (message) {
                  eventSubscriptionIdDatasetUpdated.push(message.eventSubscriptionId)
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

  function updateFiles (message) {
    try {
      if (finalized === true) { return }
      let updatedFiles = 0
      if (message.event === undefined) { return }

            /* Now we will get the market files */

      for (let i = 0; i < marketFilesPeriods.length; i++) {
        let periodTime = marketFilesPeriods[i][0]
        let periodName = marketFilesPeriods[i][1]

        if (dataset.config.validTimeFrames.includes(periodName) !== true) { continue }
        if (message.event.timeFrames !== undefined) {
          if (message.event.timeFrames.includes(periodName) !== true) { continue }
        }
        fileCloud.getFile(dataMine, bot, session, product, dataset, exchange, market, periodName, undefined, undefined, undefined, undefined, onFileReceived)

        function onFileReceived (err, file) {
          try {
            if (finalized === true) { return }
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
