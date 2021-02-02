
function newMarketFiles() {
  const MODULE_NAME = 'Market Files'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  

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
  let filesExpected = 0

  let fileCloud

  let files = new Map()

  let market
  let exchange
  let mine
  let bot
  let session
  let dataset
  let product
  let periodName

  thisObject.eventHandler = newEventHandler()

  let finalized = false

  let eventSubscriptionIdDatasetUpdated = []
  let eventsServerClient

  return thisObject

  function finalize() {
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
      mine = undefined
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

  function initialize(
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
      let timeFrames

      exchange = pExchange
      market = pMarket
      mine = pMine
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

      getTimeFramesFile()

      function getTimeFramesFile() {
        /* First we will get the Data Range */
        fileCloud.getFile(pMine, pBot, pSession, pProduct, pDataset, exchange, pMarket, undefined, undefined, undefined, undefined, true, onTimeFramesReceived)

        function onTimeFramesReceived(err, pFile) {
          switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
              timeFrames = pFile
              break
            }
            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
              return
            }
            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
              if (err.message === 'File does not exist.') {
                /* It is ok, we will deal with this later */
                break
              }
              if (err.message === 'Configured to not Support This.') {
                /* It is ok, we will deal with this later */
                break
              }
              if (err.message === 'Missing Configuration.') {
                if (ERROR_LOG === true) { logger.write('[WARN] initialize -> onFileReceived -> The needed configuration to locate the timeFrames is missing at the dataSet.') }
                if (ERROR_LOG === true) { logger.write('[WARN] initialize -> onFileReceived -> Time Frames Filters will be ignored -> Product =  ' + pProduct.config.codeName) }
                break
              }
              callBackFunction(err)
              return
            }
            default: {
              callBackFunction(err)
              return
            }
          }
          getMarketFiles()
        }
      }

      function getMarketFiles() {
        /* Now we will get the market files */
        for (let i = 0; i < marketFilesPeriods.length; i++) {
          let periodTime = marketFilesPeriods[i][0]
          let periodName = marketFilesPeriods[i][1]

          if (dataset.config.validTimeFrames.includes(periodName) === false) {
            filesNotLoaded++
            continue
          }
          if (timeFrames !== undefined) {
            if (timeFrames.includes(periodName) === false) {
              filesNotLoaded++
              continue
            }
          }

          filesExpected++
          fileCloud.getFile(mine, bot, session, product, dataset, exchange, market, periodName, undefined, undefined, undefined, undefined, onFileReceived)

          function onFileReceived(err, file) {
            try {
              if (finalized === true) { return }
              if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                files.set(periodTime, file)
                filesLoaded++
              } else {
                filesNotLoaded++
              }

              if (filesLoaded + filesNotLoaded === marketFilesPeriods.length) {
                let key = mine.config.codeName + '-' + bot.config.codeName + '-' + product.config.codeName + '-' + dataset.config.codeName + '-' + exchange.config.codeName + '-' + market.baseAsset + '/' + market.quotedAsset
                let callerId = key + '-' + periodName + newUniqueId()
                eventsServerClient.listenToEvent(key, 'Dataset Updated', undefined, callerId, onResponse, updateFiles)

                callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, thisObject)

                function onResponse(message) {
                  eventSubscriptionIdDatasetUpdated.push(message.eventSubscriptionId)
                }
              }
            } catch (err) {
              if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onFileReceived -> err = ' + err.stack) }
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
          }
        }

        callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, thisObject)
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function updateFiles(message) {
    try {
      if (finalized === true) { return }
      let updatedFiles = 0

      /* Now we will get the market files */

      for (let i = 0; i < marketFilesPeriods.length; i++) {
        let periodTime = marketFilesPeriods[i][0]
        let periodName = marketFilesPeriods[i][1]

        if (dataset.config.validTimeFrames.includes(periodName) !== true) { continue }
        if (message.event !== undefined) {
          if (message.event.timeFrames !== undefined) {
            if (message.event.timeFrames.includes(periodName) !== true) { continue }
          }
        }
        fileCloud.getFile(mine, bot, session, product, dataset, exchange, market, periodName, undefined, undefined, undefined, undefined, onFileReceived)

        function onFileReceived(err, file) {
          try {
            if (finalized === true) { return }
            files.set(periodTime, file)
            updatedFiles++

            if (updatedFiles === filesExpected) {
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

  function getFile(pPeriod) {
    return files.get(pPeriod)
  }

  function getExpectedFiles() {
    return marketFilesPeriods.length
  }

  function getFilesLoaded() {
    return filesLoaded
  }

  function getFilesNotLoaded() {
    return filesNotLoaded
  }
}
