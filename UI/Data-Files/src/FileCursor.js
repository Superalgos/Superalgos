
function newFileCursor() {
  const MODULE_NAME = 'File Cursor'
  const INFO_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  

  let cursorDate

  let thisObject = {
    eventHandler: undefined, // received from parent
    reload: reload,
    setDatetime: setDatetime,
    setTimeFrame: setTimeFrame,
    files: new Map(),
    getExpectedFiles: getExpectedFiles,
    initialize: initialize,
    finalize: finalize
  }

  let minCursorSize = 10
  let maxCursorSize = 30

  let market
  let exchange
  let fileCloud
  let mine
  let bot
  let session
  let product
  let dataset
  let periodName
  let timeFrame
  let beginDateRange
  let endDateRange
  let eventsServerClient

  let finalized = false

  let eventSubscriptionIdDatasetUpdated
  let eventSubscriptionIdDataRangeUpdated

  return thisObject

  function finalize() {
    try {
      eventsServerClient.stopListening('Dataset Updated', eventSubscriptionIdDatasetUpdated)
      eventsServerClient.stopListening('Data Range Updated', eventSubscriptionIdDataRangeUpdated)

      thisObject.eventHandler = undefined

      market = undefined
      exchange = undefined
      fileCloud = undefined
      mine = undefined
      bot = undefined
      session = undefined
      product = undefined
      dataset = undefined
      periodName = undefined
      timeFrame = undefined
      beginDateRange = undefined
      endDateRange = undefined
      eventsServerClient = undefined

      thisObject.files = undefined
      cursorDate = undefined
      fileCloud = undefined
      periodName = undefined
      timeFrame = undefined
      finalized = true
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
  }

  function initialize(
    pFileCloud,
    pMine,
    pBot,
    pSession,
    pProduct,
    pDataset,
    pExchange,
    pMarket,
    pPeriodName,
    pTimeFrame,
    pCursorDate,
    pCurrentTimeFrame,
    pBeginDateRange,
    pEndDateRange,
    pEventsServerClient,
    callBackFunction) {
    try {
      market = pMarket
      exchange = pExchange
      fileCloud = pFileCloud
      mine = pMine
      bot = pBot
      session = pSession
      product = pProduct
      dataset = pDataset
      periodName = pPeriodName
      cursorDate = removeTime(pCursorDate)
      timeFrame = pTimeFrame
      beginDateRange = pBeginDateRange
      endDateRange = pEndDateRange
      eventsServerClient = pEventsServerClient

      let key = mine.config.codeName + '-' + bot.config.codeName + '-' + product.config.codeName + '-' + dataset.config.codeName + '-' + exchange.config.codeName + '-' + market.baseAsset + '/' + market.quotedAsset
      let callerId = key + '-' + periodName + newUniqueId()
      eventsServerClient.listenToEvent(key, 'Dataset Updated', undefined, callerId, onResponseDataSet, updateFiles)

      key = mine.config.codeName + '-' + bot.config.codeName + '-' + product.config.codeName + '-' + exchange.config.codeName + '-' + market.baseAsset + '/' + market.quotedAsset
      callerId = key + '-' + periodName + newUniqueId()
      eventsServerClient.listenToEvent(key, 'Data Range Updated', undefined, callerId, onResponseDataRange, updateDataRange)

      callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)

      function onResponseDataSet(message) {
        eventSubscriptionIdDatasetUpdated = message.eventSubscriptionId
      }

      function onResponseDataRange(message) {
        eventSubscriptionIdDataRangeUpdated = message.eventSubscriptionId
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function updateDataRange(message) {
    try {
      if (finalized === true) { return }

      if (message.event === undefined || message.event.dateRange === undefined) { return }

      beginDateRange = new Date(message.event.dateRange.begin)
      endDateRange = new Date(message.event.dateRange.end)

      let minDate = beginDateRange.valueOf()
      let maxDate = endDateRange.valueOf() + ONE_DAY_IN_MILISECONDS

      for (let key of thisObject.files.keys()) {
        let keyDate = new Date(key)

        if (keyDate.valueOf() < minDate || keyDate.valueOf() > maxDate) {
          thisObject.files.delete(key)
          thisObject.eventHandler.raiseEvent('Files Updated')
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] updateDataRange -> err = ' + err.stack) }
    }
  }

  function updateFiles(message) {
    try {
      if (finalized === true) { return }

      if (message.event === undefined || message.event.lastFile === undefined) { return }

      let targetDate = new Date(message.event.lastFile)
      let dateString
      let file

      dateString = targetDate.getUTCFullYear() + '-' + pad(targetDate.getUTCMonth() + 1, 2) + '-' + pad(targetDate.getUTCDate(), 2)

      fileCloud.getFile(mine, bot, session, product, dataset, exchange, market, periodName, targetDate, undefined, undefined, undefined, onFileReceived)

      function onFileReceived(err, file) {
        try {
          if (finalized === true) { return }

          if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
            thisObject.files.set(dateString, file)
            thisObject.eventHandler.raiseEvent('Files Updated')
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] updateFiles -> onFileReceived -> err = ' + err.stack) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] updateFiles -> err = ' + err.stack) }
    }
  }

  function setTimeFrame(pTimeFrame, pDatetime) {
    try {
      if (finalized === true) { return }

      /*

      We are implementing here an algorithm designed to save bandwidth, memory and processing power at the browser.
      We say there is a saving mode where the cursor is running at a minimum size. When the end user aproaches the time period the cursor
      is set, then it should exit the saving mode and go to its actual size.

      To do this we are going to measure the distance from the Time Frame received to the one the cursors was initialized with.
      If these periods are consecutive, it means that the cursor should exit saving mode and load its full size.

      */

      cursorDate = removeTime(pDatetime) // Adjust the cursor date to the one received.

      let positionA

      for (let i = 0; i < dailyFilePeriods.length; i++) {
        let period = dailyFilePeriods[i]

        if (period[0] === pTimeFrame) {
          positionA = i
        }

        if (period[0] === timeFrame) {
          positionB = i
        }
      }

      if (Math.abs(positionB - positionA) <= 1) {
        exitSavingMode()
      } else {
        enterSavingMode()
      }

      function enterSavingMode() {
        try {
          switch (timeFrame) {

            case _45_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 3
                maxCursorSize = 30
              }
              break
            case _40_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 3
                maxCursorSize = 20
              }
              break
            case _30_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 3
                maxCursorSize = 15
              }
              break
            case _20_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 3
                maxCursorSize = 15
              }
              break
            case _15_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 3
                maxCursorSize = 15
              }
              break
            case _10_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 3
                maxCursorSize = 15
              }
              break
            case _5_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 3
                maxCursorSize = 15
              }
              break
            case _4_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 3
                maxCursorSize = 15
              }
              break
            case _3_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 3
                maxCursorSize = 15
              }
              break
            case _2_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 3
                maxCursorSize = 15
              }
              break
            case _1_MINUTE_IN_MILISECONDS:
              {
                minCursorSize = 3
                maxCursorSize = 15
              }
              break
            default:
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] setTimeFrame -> enterSavingMode -> err = ' + err.stack) }
        }
      }

      function exitSavingMode() {
        try {
          switch (timeFrame) {

            case _45_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 15
                maxCursorSize = 30
              }
              break
            case _40_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 13
                maxCursorSize = 20
              }
              break
            case _30_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 11
                maxCursorSize = 15
              }
              break
            case _20_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 9
                maxCursorSize = 15
              }
              break
            case _15_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 7
                maxCursorSize = 15
              }
              break
            case _10_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 7
                maxCursorSize = 15
              }
              break
            case _5_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 5
                maxCursorSize = 15
              }
              break
            case _4_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 5
                maxCursorSize = 15
              }
              break
            case _3_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 5
                maxCursorSize = 15
              }
              break
            case _2_MINUTES_IN_MILISECONDS:
              {
                minCursorSize = 5
                maxCursorSize = 15
              }
              break
            case _1_MINUTE_IN_MILISECONDS:
              {
                minCursorSize = 5
                maxCursorSize = 15
              }
              break
            default:
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] setTimeFrame -> exitSavingMode -> err = ' + err.stack) }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] setTimeFrame -> err = ' + err.stack) }
    }
  }

  function setDatetime(pDatetime) {
    try {
      if (finalized === true) { return }

      if (pDatetime === undefined) {
        if (ERROR_LOG === true) { logger.write('[ERROR] setDatetime -> Received undefined datetime.') }
        return
      }

      cursorDate = removeTime(pDatetime)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] setDatetime -> err = ' + err.stack) }
    }
  }

  function reload(callBackFunction) {
    try {
      if (finalized === true) { return }

      getFiles(callBackFunction)

      collectGarbage(callBackFunction)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] reload -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function getFiles(callBackFunction) {
    try {
      if (finalized === true) { return }

      let i = 0
      let j = 0

      let dateString

      getNextFile()

      function getNextFile() {
        try {
          let targetDate = new Date(cursorDate)
          targetDate.setUTCDate(targetDate.getUTCDate() + j)

          /* Small algorith to allow load first the current date, then alternate between the most forwad and the most backwards ones. */
          if (j === 0) { j++ } else {
            if (j < 0) {
              j = -j
              j++
            } else {
              j = -j
            }
          }

          let compareTargetDate = new Date(targetDate.valueOf())

          if (beginDateRange !== undefined) {
            let compareBeginDate = removeTime(beginDateRange)

            if (compareTargetDate.valueOf() < compareBeginDate.valueOf()) {
              controlLoop()
              return
            }
          }

          if (endDateRange !== undefined) {
            let compareEndDate = removeTime(endDateRange)

            if (compareTargetDate.valueOf() >= compareEndDate.valueOf()) {
              controlLoop()
              return
            }
          }

          dateString = targetDate.getUTCFullYear() + '-' + pad(targetDate.getUTCMonth() + 1, 2) + '-' + pad(targetDate.getUTCDate(), 2)

          let currentDay = Math.trunc((new Date()).valueOf() / (24 * 60 * 60 * 1000))
          let targetDay = Math.trunc(targetDate.valueOf() / (24 * 60 * 60 * 1000))

          if (targetDay > currentDay) {
            controlLoop()
          } else {
            if (thisObject.files.get(dateString) === undefined) {
              // We dont reload files we already have.

              fileCloud.getFile(mine, bot, session, product, dataset, exchange, market, periodName, targetDate, undefined, undefined, undefined, onFileReceived)
            } else {
              controlLoop()
            }
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] getFiles -> getNextFile -> err = ' + err.stack) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }

      function onFileReceived(err, file) {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] getFiles -> onFileReceived -> Entering function.') }

          switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] getFiles -> onFileReceived -> Received OK Response.') }
              break
            }

            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] getFiles -> onFileReceived -> Received FAIL Response.') }
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
              return
            }

            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] getFiles -> onFileReceived -> Received CUSTOM FAIL Response.') }
              if (INFO_LOG === true) { logger.write('[INFO] getFiles -> onFileReceived -> err.message = ' + err.message) }

              if (err.message === 'File does not exist.') {
                controlLoop()
                return
              } else {
                callBackFunction(err)
                return
              }
            }

            default: {
              if (INFO_LOG === true) { logger.write('[INFO] getFiles -> onFileReceived -> Received Unexpected Response.') }
              callBackFunction(err)
              return
            }
          }

          thisObject.files.set(dateString, file)

          controlLoop()
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] getFiles -> onFileReceived -> err = ' + err.stack) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }

      function controlLoop() {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] getFiles -> controlLoop -> Entering function.') }

          if (callBackFunction !== undefined) {
            callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
          }

          i++

          if (i < minCursorSize) {
            getNextFile()
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] getFiles -> controlLoop -> err = ' + err.stack) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] getFiles -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function collectGarbage(callBackFunction) {
    try {
      if (finalized === true) { return }

      date = removeTime(cursorDate)

      let minDate = date.valueOf() - maxCursorSize * ONE_DAY_IN_MILISECONDS / 2
      let maxDate = date.valueOf() + maxCursorSize * ONE_DAY_IN_MILISECONDS / 2

      for (let key of thisObject.files.keys()) {
        let keyDate = new Date(key)

        if (keyDate.valueOf() < minDate || keyDate.valueOf() > maxDate) {
          thisObject.files.delete(key)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] collectGarbage -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function getExpectedFiles() {
    if (finalized === true) { return }
    if (INFO_LOG === true) { logger.write('[INFO] getExpectedFiles -> Entering function.') }

    return minCursorSize
  }
}
