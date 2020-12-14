
function newDailyFiles() {
  const MODULE_NAME = 'Daily Files'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  

  let thisObject = {
    eventHandler: undefined,
    getFileCursor: getFileCursor,
    setDatetime: setDatetime,
    setTimeFrame: setTimeFrame,
    getExpectedFiles: getExpectedFiles,
    getFilesLoaded: getFilesLoaded,
    initialize: initialize,
    finalize: finalize
  }

  let filesLoaded = 0
  let expectedFiles = 0
  let fileCloud
  let fileCursors = new Map()
  let callBackWhenFileReceived

  thisObject.eventHandler = newEventHandler()

  return thisObject

  function finalize() {
    try {
      thisObject.eventHandler.finalize()
      thisObject.eventHandler = undefined

      filesLoaded = undefined
      expectedFiles = undefined
      fileCloud = undefined

      fileCursors.forEach(finalizeEach)

      function finalizeEach(item, key, mapObj) {
        item.finalize()
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
  }

  function initialize(pMine, pBot, pSession, pProduct, pDataset, pExchange, pMarket, pDatetime, pTimeFrame, pHost, pPort, pEventsServerClient, callBackFunction) {
    try {
      callBackWhenFileReceived = callBackFunction

      let exchange = pExchange
      let beginDateRange
      let endDateRange
      let timeFrames

      fileCloud = newFileCloud()
      fileCloud.initialize(pBot, pHost, pPort)

      /* Config Validations */
      if (pDataset.config.validTimeFrames === undefined) {
        if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = Can not initialize Daily Files for bot ' + pBot.name) }
        if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = You need to define validTimeFrames at the Dataset config. ') }
        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        return
      }

      getDataRangeFile()

      function getDataRangeFile() {
        /* First we will get the Data Range */
        fileCloud.getFile(pMine, pBot, pSession, pProduct, pDataset, exchange, pMarket, undefined, undefined, undefined, true, undefined, onDataRangeReceived)

        function onDataRangeReceived(err, pFile) {
          switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
              beginDateRange = pFile.begin
              endDateRange = pFile.end
              break
            }
            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
              return
            }
            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
              if (err.message === 'File does not exist.') {
                beginDateRange = new Date()
                endDateRange = new Date()
                break
              }
              if (err.message === 'Missing Configuration.') {
                if (ERROR_LOG === true) { logger.write('[WARN] initialize -> onFileReceived -> The needed configuration for the dateRange at the dataSet of the product was not found.') }
                if (ERROR_LOG === true) { logger.write('[WARN] initialize -> onFileReceived -> maxDate will be set to current datetime.') }

                endDateRange = new Date()
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
          getTimeFramesFile()
        }
      }

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
          createFileCursors()
        }
      }

      function createFileCursors() {
        try {
          /* Now we will get the daily files */
          for (let i = 0; i < dailyFilePeriods.length; i++) {
            let periodTime = dailyFilePeriods[i][0]
            let periodName = dailyFilePeriods[i][1]

            if (pDataset.config.validTimeFrames.includes(periodName) === false) {
              continue
            }
            if (timeFrames !== undefined) {
              if (timeFrames.includes(periodName) === false) {
                continue
              }
            }

            let fileCursor = newFileCursor()
            fileCursor.eventHandler = thisObject.eventHandler // We share our event handler with each file cursor, so that they can raise events there when files are changed.s
            fileCursor.initialize(fileCloud, pMine, pBot, pSession, pProduct, pDataset, exchange, pMarket, periodName, periodTime, pDatetime, pTimeFrame, beginDateRange, endDateRange, pEventsServerClient, onInitialized)
            function onInitialized(err) {
              try {
                switch (err.result) {
                  case GLOBAL.DEFAULT_OK_RESPONSE.result: {
                    break
                  }
                  case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
                    callBackWhenFileReceived(GLOBAL.DEFAULT_FAIL_RESPONSE)
                    return
                  }
                  default: {
                    callBackWhenFileReceived(err)
                    return
                  }
                }
                fileCursors.set(periodTime, fileCursor)
                expectedFiles = expectedFiles + fileCursor.getExpectedFiles()
              } catch (err) {
                if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onFileReceived -> onInitialized -> err = ' + err.stack) }
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
              }
            }
          }
          loadThemAll()
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> createFileCursors -> err = ' + err.stack) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }

      function loadThemAll() {
        try {
          for (let i = 0; i < dailyFilePeriods.length; i++) {
            let periodTime = dailyFilePeriods[i][0]
            let periodName = dailyFilePeriods[i][1]

            if (pDataset.config.validTimeFrames.includes(periodName) === true) {
              let fileCursor = fileCursors.get(periodTime)
              if (fileCursor !== undefined) {
                fileCursor.reload(onFileReceived)
              }
            }
          }
          callBackWhenFileReceived(GLOBAL.DEFAULT_OK_RESPONSE, thisObject)
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> loadThemAll -> err = ' + err.stack) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function onFileReceived(err) {
    try {
      switch (err.result) {
        case GLOBAL.DEFAULT_OK_RESPONSE.result: {
          break
        }
        case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
          callBackWhenFileReceived(GLOBAL.DEFAULT_FAIL_RESPONSE)
          return
        }
        case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
          callBackWhenFileReceived(err)
          return
        }
        default: {
          callBackWhenFileReceived(err)
          return
        }
      }
      filesLoaded++
      callBackWhenFileReceived(GLOBAL.DEFAULT_OK_RESPONSE, thisObject) // Note that the call back is called for every file loaded at each cursor.
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onFileReceived -> err = ' + err.stack) }
      callBackWhenFileReceived(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function getFileCursor(pPeriod) {
    try {
      return fileCursors.get(pPeriod)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] getFileCursor -> err = ' + err.stack) }
    }
  }

  function setDatetime(pDatetime) {
    try {
      filesLoaded = 0
      expectedFiles = 0
      fileCursors.forEach(setDatetimeToEach)

      function setDatetimeToEach(fileCursor, key, map) {
        fileCursor.setDatetime(pDatetime)
        expectedFiles = expectedFiles + fileCursor.getExpectedFiles()
        fileCursor.reload(onFileReceived)
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] setDatetime -> err = ' + err.stack) }
    }
  }

  function setTimeFrame(pTimeFrame, pDatetime) {
    try {
      filesLoaded = 0
      expectedFiles = 0
      fileCursors.forEach(setTimeFrameToEach)

      function setTimeFrameToEach(fileCursor, key, map) {
        fileCursor.setTimeFrame(pTimeFrame, pDatetime)
        expectedFiles = expectedFiles + fileCursor.getExpectedFiles()
        fileCursor.reload(onFileReceived)
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] setTimeFrame -> err = ' + err.stack) }
    }
  }

  function getExpectedFiles() {
    return expectedFiles
  }

  function getFilesLoaded() {
    return filesLoaded
  }
}
