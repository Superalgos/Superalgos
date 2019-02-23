 ﻿
function newCloudVM () {
  const MODULE_NAME = 'CloudVM'
  const INFO_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  var thisObject = {
    onBotPlayPressed: onBotPlayPressed,
    onBotStopPressed: onBotStopPressed
  }

  let root = newRoot()
  let intervalHandler
  let previousBotCode = ''
  let errorsCheckingForBotCodeChanges = 0

  return thisObject

  function onBotPlayPressed (pUI_COMMANDS) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] onBotPlayPressed -> Entering function.') }

      window.SHALL_BOT_STOP = false
      errorsCheckingForBotCodeChanges = 0

      window.CURRENT_ENVIRONMENT = 'Develop'
      window.CURRENT_EXECUTION_AT = 'Browser'
      window.STORAGE_PERMISSIONS = ecosystem.getStoragePermissions()

      window.EXCHANGE_NAME = 'Poloniex'
      window.MARKET = {
        assetA: 'USDT',
        assetB: 'BTC'
      }

            /*
            When running at the browser, the AACloud VM will look for this data, in this case it does not contain any key or secret, since the browser only know the
            session token the user received when he logged in.
            */

      window.EXCHANGE_KEYS = {
        Poloniex: {
          Key: '',
          Secret: ''
        }
      }

      root.initialize(pUI_COMMANDS, onInitialized)

      function onInitialized () {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] onBotPlayPressed -> Entering function.') }

          root.start()

          intervalHandler = setInterval(checkForChangesInBotCode, 10000)
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] onBotPlayPressed -> onInitialized -> err.message = ' + err.message) }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onBotPlayPressed -> err.message = ' + err.message) }
    }
  }

  function onBotStopPressed () {
    if (INFO_LOG === true) { logger.write('[INFO] onBotStopPressed -> Entering function.') }

    window.SHALL_BOT_STOP = true
    errorsCheckingForBotCodeChanges = 0
  }

  function checkForChangesInBotCode () {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] checkForChangesInBotCode -> Entering function.') }

      let botFunction = newUserBot

      if (botFunction !== undefined) {
        let currentBotCode = botFunction.toString()

        if (previousBotCode !== '') {
          if (currentBotCode !== previousBotCode) {
            console.log('CloudVM -> Bot code changes detected.')

            let path = window.canvasApp.urlPrefix
                            + 'AABrowserAPI' + '/'
                            + 'saveBotCode' + '/'
                            + window.DEV_TEAM + '/'
                            + 'members' + '/'
                            + window.USER_LOGGED_IN + '/'
                            + window.CURRENT_BOT_REPO + '/'
                            + window.CURRENT_PROCESS + '/'
                            + 'User.Bot.js'

            callServer(currentBotCode, path, onServerResponse)

            function onServerResponse (err) {
              err = JSON.parse(err)

              if (INFO_LOG === true) { logger.write('[INFO] checkForChangesInBotCode -> onServerResponse -> Entering function.') }

              if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                if (ERROR_LOG === true) { logger.write('[ERROR] checkForChangesInBotCode -> onServerResponse -> err.message = ' + err.message) }
                console.log('CloudVM -> Changes in code NOT saved. Plase check the error log and try again.')
                return
              }

              console.log('CloudVM -> Changes in code saved.')
            }
          }
        }

        previousBotCode = currentBotCode
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] checkForChangesInBotCode -> err.message = ' + err.message) }
      errorsCheckingForBotCodeChanges++

      if (errorsCheckingForBotCodeChanges > 2) {
        if (ERROR_LOG === true) { logger.write('[ERROR] checkForChangesInBotCode -> Giving up.') }

        clearInterval(intervalHandler)
      }
    }
  }
}
