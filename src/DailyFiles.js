 ﻿
function newDailyFiles () {
  const MODULE_NAME = 'Daily Files'
  const INFO_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    getFileCursor: getFileCursor,
    setDatetime: setDatetime,
    setTimePeriod: setTimePeriod,
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

  return thisObject

  function finalize () {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] finalize -> Entering function.') }

      filesLoaded = undefined
      expectedFiles = undefined
      fileCloud = undefined

      fileCursors.forEach(finalizeEach)

      function finalizeEach (item, key, mapObj) {
        if (INFO_LOG === true) { logger.write('[INFO] finalize -> finalizeEach -> Entering function.') }

        item.finalize()
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err) }
    }
  }

  function initialize (pDevTeam, pBot, pProduct, pSet, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> Entering function.') }
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> key = ' + pDevTeam.codeName + '-' + pBot.codeName + '-' + pProduct.codeName) }

      callBackWhenFileReceived = callBackFunction

      let exchange = ecosystem.getExchange(pProduct, pExchange)

      if (exchange === undefined) {
        throw 'Exchange not supoorted by this product of the ecosystem! - pDevTeam.codeName = ' + pDevTeam.codeName + ', pBot.codeName = ' + pBot.codeName + ', pProduct.codeName = ' + pProduct.codeName + ', pExchange = ' + pExchange
      }

      fileCloud = newFileCloud()
      fileCloud.initialize(pBot)

            /* First we will get the Data Range */

      fileCloud.getFile(pDevTeam, pBot, pSet, exchange, pMarket, undefined, undefined, undefined, true, onDataRangeReceived)

      function onDataRangeReceived (err, pFile) {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> Entering function.') }

          let beginDateRange
          let endDateRange

          switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> Received OK Response.') }

              beginDateRange = new Date(pFile.begin)
              endDateRange = new Date(pFile.end)

              break
            }

            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> Received FAIL Response.') }
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
              return
            }

            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> Received CUSTOM FAIL Response.') }
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> err.message = ' + err.message) }

              if (err.message === 'File does not exist.') {
                if (INFO_LOG === true) { logger.write('[WARN] initialize -> onFileReceived -> No Date Range file found. maxDate will be set to current datetime. ') }

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
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> Received Unexpected Response.') }
              callBackFunction(err)
              return
            }
          }

                    /* Now we will get the daily files */

          for (i = 0; i < dailyFilePeriods.length; i++) {
            let periodTime = dailyFilePeriods[i][0]
            let periodName = dailyFilePeriods[i][1]

            if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> periodTime = ' + periodTime) }
            if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> periodName = ' + periodName) }

            if (pSet.validPeriods.includes(periodName) === true) {
              let fileCursor = newFileCursor()
              fileCursor.initialize(fileCloud, pDevTeam, pBot, pSet, exchange, pMarket, periodName, periodTime, pDatetime, pTimePeriod, beginDateRange, endDateRange, onInitialized)

              function onInitialized (err) {
                try {
                  if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> onInitialized -> Entering function.') }

                  switch (err.result) {
                    case GLOBAL.DEFAULT_OK_RESPONSE.result: {

                        if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> onInitialized -> Received OK Response.') }
                        break
                      }

                    case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {

                        if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> onInitialized -> Received FAIL Response.') }
                        callBackWhenFileReceived(GLOBAL.DEFAULT_FAIL_RESPONSE)
                        return
                      }
                    default: {

                        if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> onInitialized -> Received Unexpected Response.') }
                        callBackWhenFileReceived(err)
                        return
                      }
                  }

                  fileCursors.set(periodTime, fileCursor)

                  if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> onInitialized -> expectedFiles = ' + expectedFiles) }

                  expectedFiles = expectedFiles + fileCursor.getExpectedFiles()

                  if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> onInitialized -> expectedFiles = ' + expectedFiles) }
                } catch (err) {
                  if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onFileReceived -> onInitialized -> err = ' + err) }
                  callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                }
              }
            }
          }

          loadThemAll()

          function loadThemAll () {
            try {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> loadThemAll -> Entering function.') }

              for (i = 0; i < dailyFilePeriods.length; i++) {
                let periodTime = dailyFilePeriods[i][0]
                let periodName = dailyFilePeriods[i][1]

                if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> loadThemAll -> periodTime = ' + periodTime) }
                if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileReceived -> loadThemAll -> periodName = ' + periodName) }

                if (pSet.validPeriods.includes(periodName) === true) {
                  let fileCursor = fileCursors.get(periodTime)
                  fileCursor.reload(onFileReceived)
                }
              }
            } catch (err) {
              if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onFileReceived -> loadThemAll -> err = ' + err) }
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onFileReceived -> err = ' + err) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function onFileReceived (err) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] onFileReceived -> Entering function.') }

      switch (err.result) {
        case GLOBAL.DEFAULT_OK_RESPONSE.result: {
          if (INFO_LOG === true) { logger.write('[INFO] onFileReceived -> Received OK Response.') }
          break
        }

        case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
          if (INFO_LOG === true) { logger.write('[INFO] onFileReceived -> Received FAIL Response.') }
          callBackWhenFileReceived(GLOBAL.DEFAULT_FAIL_RESPONSE)
          return
        }

        case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
          if (INFO_LOG === true) { logger.write('[INFO] onFileReceived -> Received CUSTOM FAIL Response.') }
          if (INFO_LOG === true) { logger.write('[INFO] onFileReceived -> err.message = ' + err.message) }

          callBackWhenFileReceived(err)
          return
        }

        default: {
          if (INFO_LOG === true) { logger.write('[INFO] onFileReceived -> Received Unexpected Response.') }
          callBackWhenFileReceived(err)
          return
        }
      }

      filesLoaded++

      if (INFO_LOG === true) { logger.write('[INFO] onFileReceived -> filesLoaded = ' + filesLoaded) }

      callBackWhenFileReceived(GLOBAL.DEFAULT_OK_RESPONSE, thisObject) // Note that the call back is called for every file loaded at each cursor.
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onFileReceived -> err = ' + err) }
      callBackWhenFileReceived(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function getFileCursor (pPeriod) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] getFileCursor -> Entering function.') }

      return fileCursors.get(pPeriod)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] getFileCursor -> err = ' + err) }
    }
  }

  function setDatetime (pDatetime) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] setDatetime -> Entering function.') }

      filesLoaded = 0
      expectedFiles = 0

      fileCursors.forEach(setDatetimeToEach)

      function setDatetimeToEach (fileCursor, key, map) {
        fileCursor.setDatetime(pDatetime)

        if (INFO_LOG === true) { logger.write('[INFO] setDatetime -> expectedFiles = ' + expectedFiles) }

        expectedFiles = expectedFiles + fileCursor.getExpectedFiles()

        if (INFO_LOG === true) { logger.write('[INFO] setDatetime -> expectedFiles = ' + expectedFiles) }

        fileCursor.reload(onFileReceived)
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] setDatetime -> err = ' + err) }
    }
  }

  function setTimePeriod (pTimePeriod, pDatetime) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] setTimePeriod -> Entering function.') }

      filesLoaded = 0
      expectedFiles = 0

      fileCursors.forEach(setTimePeriodToEach)

      function setTimePeriodToEach (fileCursor, key, map) {
        fileCursor.setTimePeriod(pTimePeriod, pDatetime)

        if (INFO_LOG === true) { logger.write('[INFO] setTimePeriod -> expectedFiles = ' + expectedFiles) }

        expectedFiles = expectedFiles + fileCursor.getExpectedFiles()

        if (INFO_LOG === true) { logger.write('[INFO] setTimePeriod -> expectedFiles = ' + expectedFiles) }

        fileCursor.reload(onFileReceived)
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] setTimePeriod -> err = ' + err) }
    }
  }

  function getExpectedFiles () {
    if (INFO_LOG === true) { logger.write('[INFO] getExpectedFiles -> Entering function.') }
    if (INFO_LOG === true) { logger.write('[INFO] getExpectedFiles -> expectedFiles = ' + expectedFiles) }

    return expectedFiles
  }

  function getFilesLoaded () {
    if (INFO_LOG === true) { logger.write('[INFO] getFilesLoaded -> Entering function.') }
    if (INFO_LOG === true) { logger.write('[INFO] getFilesLoaded -> filesLoaded = ' + filesLoaded) }

    return filesLoaded
  }
}
