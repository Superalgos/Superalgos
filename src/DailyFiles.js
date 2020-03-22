 ﻿
function newDailyFiles () {
  const MODULE_NAME = 'Daily Files'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

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

  function finalize () {
    try {
      thisObject.eventHandler.finalize()
      thisObject.eventHandler = undefined

      filesLoaded = undefined
      expectedFiles = undefined
      fileCloud = undefined

      fileCursors.forEach(finalizeEach)

      function finalizeEach (item, key, mapObj) {
        item.finalize()
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
  }

  function initialize (pDataMine, pBot, pSession, pProduct, pDataset, pExchange, pMarket, pDatetime, pTimeFrame, callBackFunction) {
    try {
      callBackWhenFileReceived = callBackFunction

      let exchange = pExchange

      fileCloud = newFileCloud()
      fileCloud.initialize(pBot)

      /* Some Validations */
      if (pDataset.code.validTimeFrames === undefined) {
        if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = Can not initialize Market Files for bot ' + pBot.name) }
        if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = You need to define validTimeFrames at the Dataset config. ') }
        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        return
      }

            /* First we will get the Data Range */

      fileCloud.getFile(pDataMine, pBot, pSession, pDataset, exchange, pMarket, undefined, undefined, undefined, true, onDataRangeReceived)

      function onDataRangeReceived (err, pFile) {
        try {
          let beginDateRange
          let endDateRange

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
                           /* If none of the previous conditions are met, the we return the err to the caller. */
              callBackFunction(err)
              return
            }
            default: {
              callBackFunction(err)
              return
            }
          }
                    /* Now we will get the daily files */
          for (i = 0; i < dailyFilePeriods.length; i++) {
            let periodTime = dailyFilePeriods[i][0]
            let periodName = dailyFilePeriods[i][1]

            if (pDataset.code.validTimeFrames.includes(periodName) === true) {
              let fileCursor = newFileCursor()
              fileCursor.eventHandler = thisObject.eventHandler // We share our event handler with each file cursor, so that they can raise events there when files are changed.s
              fileCursor.initialize(fileCloud, pDataMine, pBot, pSession, pProduct, pDataset, exchange, pMarket, periodName, periodTime, pDatetime, pTimeFrame, beginDateRange, endDateRange, onInitialized)
              function onInitialized (err) {
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
          }
          loadThemAll()

          function loadThemAll () {
            try {
              for (i = 0; i < dailyFilePeriods.length; i++) {
                let periodTime = dailyFilePeriods[i][0]
                let periodName = dailyFilePeriods[i][1]

                if (pDataset.code.validTimeFrames.includes(periodName) === true) {
                  let fileCursor = fileCursors.get(periodTime)
                  fileCursor.reload(onFileReceived)
                }
              }
            } catch (err) {
              if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onFileReceived -> loadThemAll -> err = ' + err.stack) }
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
          }
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

  function onFileReceived (err) {
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

  function getFileCursor (pPeriod) {
    try {
      return fileCursors.get(pPeriod)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] getFileCursor -> err = ' + err.stack) }
    }
  }

  function setDatetime (pDatetime) {
    try {
      filesLoaded = 0
      expectedFiles = 0
      fileCursors.forEach(setDatetimeToEach)

      function setDatetimeToEach (fileCursor, key, map) {
        fileCursor.setDatetime(pDatetime)
        expectedFiles = expectedFiles + fileCursor.getExpectedFiles()
        fileCursor.reload(onFileReceived)
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] setDatetime -> err = ' + err.stack) }
    }
  }

  function setTimeFrame (pTimeFrame, pDatetime) {
    try {
      filesLoaded = 0
      expectedFiles = 0
      fileCursors.forEach(setTimeFrameToEach)

      function setTimeFrameToEach (fileCursor, key, map) {
        fileCursor.setTimeFrame(pTimeFrame, pDatetime)
        expectedFiles = expectedFiles + fileCursor.getExpectedFiles()
        fileCursor.reload(onFileReceived)
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] setTimeFrame -> err = ' + err.stack) }
    }
  }

  function getExpectedFiles () {
    return expectedFiles
  }

  function getFilesLoaded () {
    return filesLoaded
  }
}
