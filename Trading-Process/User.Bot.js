exports.newUserBot = function newUserBot (bot, logger) {
  /*
    Creating a new instance from the platform of this bot:
    - bot: An instance of the bot configuration
    - logger: An instance of the platform logger that allows both: to save logs
        on cloud execution and shows logs on the browser console on browser execution
  */

  // Variable used for logs, which will be passed to the logger instance
  const MODULE_NAME = 'User Bot'
  // Debug log level
  const FULL_LOG = true
  // Info log level
  const LOG_INFO = true

  /*
    The reference to the Trading Platform Advanced Algos Assistant that will
    allow to:
        dataDependencies: Retrieve all dependencies to other bots defined on the configuration
        putPosition: Put a buy or sell position at the exchange (only limit orders at this point)
        movePosition: Move an existing position
        getPositions: Obtain all the positions existing on the exchange
        getBalance: Obtain the total balance on the exchange known by the platform (at this point 0.001 BTC)
        getAvailableBalance: Obtain the current available balance on the exchange known by the platform
        getInvestment: Obtain initial investment known by the platform (at this point 0.001 BTC)
        getProfits: Get current profits at this point in time
        getCombinedProfits: Get current profits
        getROI: Get current ROI
        getMarketRate: Get current market rate
        getTicker: Gets the current highest bid and lowest ask on the exchange
        sendMessage: Put a visual message on the platform (different zoom levels [1-10] can be handled)
        rememberThis: Store a string variable across executions by key value pairs
        remindMeOf: Get a stored string value by key
        sendEmail: Send an email during execution as notifications
  */
  let assistant

  /*
    This is a dependency example to other bots, in this case to the the
    LRC Indicator.
  */
  let gaussStorage

  /*
    This objects returns two public functions that will be used to integrate
    with the platform.
  */
  let thisObject = {
    initialize: initialize,
    start: start
  }
  return thisObject

  /*
    The initialize function must be implemented by all trading bots.
      pAssistant: the instance of the platform which methods will allow to put getPositions
      pGenes: This variable will be used during initialization to get the parameters
        from the platform. At the moment it is not used but in future releases
        it will allow to create different clones of the Algobot, to form an Algonet.
  */
  function initialize (pAssistant, pGenes, callBackFunction) {
    try {
      if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] initialize -> Entering function.') }

      // Integration with platform logger, when running on cloud
      logger.fileName = MODULE_NAME

      /*
        We keep a local reference to the assistant that allows to put
        positions on the exchange, created and managed by the platform
      */
      assistant = pAssistant

      /*
        On 'assistant.dataDependencies.dataSets' we will receive the data files
        retrieved for those defined on the bot configuration.
        Note that the key is:
          TeamName-BotName-BotProductFolder-BotProcessName-BotDataSetVersion

        In this case, this particular bot will use Gauss indicator; other
        indicators are available. You can use any indicator you want,
        or create a new one if you should need to.
      */
      let key = 'AAVikings-AAGauss-LRC-Points-Multi-Period-Daily-dataSet.V1'
      gaussStorage = assistant.dataDependencies.dataSets.get(key)

      /*
        Once Completed we must return the global.DEFAULT_OK_RESPONSE
      */
      callBackFunction(global.DEFAULT_OK_RESPONSE)

    } catch (err) {
      logger.write(MODULE_NAME, '[ERROR] initialize -> onDone -> err = ' + err.message)
      callBackFunction(global.DEFAULT_FAIL_RESPONSE)
    }
  }

  /*
    The start function is called by the platform for executing the bot every 1 minute
  */
  function start (callBackFunction) {
    if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> Entering function.') }

    /*
      This breakpoint will be called once the web platform reaches the graphical stop point.
      You can find more details on how this works here:
        https://advancedalgos.net/documentation-interface.shtml
    */
  	if (global.AT_BREAKPOINT === true) {
  		if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> Plot Breakpoint Hit."); } // Place breakpoint in this line
  	}

    const market = global.MARKET
    const CHANNEL_DOWN = -1
    const CHANNEL_UP = 1
    const NO_CHANNEL = 0

    /*
      Here we call the main function that will check buy, sell or move conditions.
    */
    businessLogic(onDone)

    /*
      This function will be called after we complete all validations and operations,
      we make sure everything was ok before returning the control to the platform.
        The platform will check this 3 situations:
          global.DEFAULT_OK_RESPONSE: Proceed with normal execution
          global.DEFAULT_RETRY_RESPONSE: Retry after 10 seconds
          global.DEFAULT_FAIL_RESPONSE: Finish in failure state
            (this allows us to check the logs and fix execution errors when they occur)
    */
    function onDone (err) {
      try {
        switch (err.result) {
          case global.DEFAULT_OK_RESPONSE.result: {
            logger.write(MODULE_NAME, '[INFO] start -> onDone -> Execution finished well. :-)')
            callBackFunction(global.DEFAULT_OK_RESPONSE)
            return
          }
          case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
            logger.write(MODULE_NAME, '[ERROR] start -> onDone -> Retry Later. Requesting Execution Retry.')
            callBackFunction(global.DEFAULT_RETRY_RESPONSE)
            return
          }
          case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
            logger.write(MODULE_NAME, '[ERROR] start -> onDone -> Operation Failed. Aborting the process. err = ' + err.message)
            callBackFunction(global.DEFAULT_FAIL_RESPONSE)
            return
          }
        }
      } catch (err) {
        logger.write(MODULE_NAME, '[ERROR] start -> onDone -> err = ' + err.message)
        callBackFunction(global.DEFAULT_FAIL_RESPONSE)
      }
    }

    /*
      We will check the direction of the channel and based on that create a buy or sell
      position in the market.
      Here is a detailed explanation of the bot:
        https://github.com/AAVikings/AAArtudito-Trading-Bot/blob/master/README.md
    */
    function businessLogic (callBack) {
      if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> businessLogic -> Entering function.') }

      // Simulation for forcing buy or sell on each execution without checking the rules
      let forceBuyAndSell = false
      if(forceBuyAndSell){
        if (Math.random(1) <= 0.5){
          createBuyPosition(callBack);
        }else{
          createSellPosition(callBack);
        }
      }else{
        // Here we really check the bot business logic
        getChannelTilt(firstTiltCheck);
      }

      function firstTiltCheck (err, channelTilt) {
        try {
          if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> businessLogic -> firstTiltCheck  -> Entering Function.') }

          if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
            logger.write(MODULE_NAME, '[ERROR] start -> businessLogic -> firstTiltCheck -> err = ' + err.message)
            callBack(global.DEFAULT_FAIL_RESPONSE)
          } else {
            if (channelTilt == 1) {
              createBuyPosition(callBack)
            } else if (channelTilt == -1) {
              createSellPosition(callBack)
            } else {
              if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> businessLogic -> firstTiltCheck -> Nothing to do, there isn't a buy or sell opportunity.") }
              callBack(global.DEFAULT_OK_RESPONSE)
            }
          }
        } catch (err) {
          logger.write(MODULE_NAME, '[ERROR] start -> businessLogic -> firstTiltCheck -> err = ' + err.message)
          callBackFunction(global.DEFAULT_FAIL_RESPONSE)
        }
      }
      }

    /*
      Here we will get the file from the indicator bot, that already has all values calculated.
      This will provide more efficiency and allow other bots to consume the services as well.
    */
    function getChannelTilt (callBack) {
      if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> businessLogic -> getChannelTilt -> Entering function.') }

      let lrcPoint, previousLRCPoint
      let queryDate = new Date(bot.processDatetime)
      getLRCPointsFile(queryDate, onLRCPointsFileReceived)

      function onLRCPointsFileReceived (err, lrcPointsFile) {
        try {
          if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> businessLogic -> getChannelTilt -> onLRCPointsFileReceived.') }

          let lastIndexLrcPointsFile = lrcPointsFile.length - 1
          let lastAvailableDateTime = lrcPointsFile[lastIndexLrcPointsFile][0]

          if (bot.processDatetime.valueOf() <= lastAvailableDateTime || !isExecutionToday()) {
            for (let i = 0; i < lrcPointsFile.length; i++) {
              if (bot.processDatetime.valueOf() >= lrcPointsFile[i][0] && bot.processDatetime.valueOf() < lrcPointsFile[i][1]) {
                lrcPoint = {
                  begin: lrcPointsFile[i][0],
                  end: lrcPointsFile[i][1],
                  min: lrcPointsFile[i][2],
                  mid: lrcPointsFile[i][3],
                  max: lrcPointsFile[i][4]
                }

                if (i >= 1) {
                  let previous = i - 1
                  previousLRCPoint = {
                    begin: lrcPointsFile[previous][0],
                    end: lrcPointsFile[previous][1],
                    min: lrcPointsFile[previous][2],
                    mid: lrcPointsFile[previous][3],
                    max: lrcPointsFile[previous][4]
                  }

                  applyBotRules(lrcPoint, previousLRCPoint, callBack)
                } else {
                  queryDate.setDate(queryDate.getDate() - 1)
                  getLRCPointsFile(queryDate, onPreviousLRCPointsFileReceived)
                }
                return
              }
            }

            logger.write(MODULE_NAME, '[ERROR] start -> businessLogic -> getChannelTilt -> onLRCPointsFileReceived. The expected LRC Point was not found: ' + bot.processDatetime.valueOf())
            callBack(global.DEFAULT_FAIL_RESPONSE)
          } else {
            // Running live we will process last available LRCPoint only if it's delayed 25 minutes top
            let maxTolerance = 25 * 60 * 1000
            if (bot.processDatetime.valueOf() <= (lastAvailableDateTime + maxTolerance)) {
              lrcPoint = {
                begin: lrcPointsFile[lastIndexLrcPointsFile][0],
                end: lrcPointsFile[lastIndexLrcPointsFile][1],
                min: lrcPointsFile[lastIndexLrcPointsFile][2],
                mid: lrcPointsFile[lastIndexLrcPointsFile][3],
                max: lrcPointsFile[lastIndexLrcPointsFile][4]
              }

              if (lastIndexLrcPointsFile >= 1) {
                let previous = lastIndexLrcPointsFile - 1
                previousLRCPoint = {
                  begin: lrcPointsFile[previous][0],
                  end: lrcPointsFile[previous][1],
                  min: lrcPointsFile[previous][2],
                  mid: lrcPointsFile[previous][3],
                  max: lrcPointsFile[previous][4]
                }

                applyBotRules(lrcPoint, previousLRCPoint, callBack)
              } else {
                queryDate.setDate(queryDate.getDate() - 1)
                getLRCPointsFile(queryDate, onPreviousLRCPointsFileReceived)
              }
            } else {
              if (LOG_INFO === true) logger.write(MODULE_NAME, '[WARN] start -> getChannelTilt -> onLRCPointsFileReceived. Available candle older than 5 minutes. Skipping execution.')

              callBack(global.DEFAULT_OK_RESPONSE, NO_CHANNEL)
            }
          }
        } catch (err) {
          logger.write(MODULE_NAME, '[ERROR] start -> getChannelTilt -> onLRCPointsFileReceived -> err = ' + err.message)
          callBackFunction(global.DEFAULT_FAIL_RESPONSE)
        }
      }

      /*
        Depending on the time requested, the necessary information could be on the
        file from the day before.
      */
      function onPreviousLRCPointsFileReceived (err, lrcPointsFile) {
        if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> getChannelTilt -> onLRCPointsFileReceived.') }

        let previous = lrcPointsFile.length - 1
        previousLRCPoint = {
          begin: lrcPointsFile[previous][0],
          end: lrcPointsFile[previous][1],
          min: lrcPointsFile[previous][2],
          mid: lrcPointsFile[previous][3],
          max: lrcPointsFile[previous][4]
        }

        applyBotRules(lrcPoint, previousLRCPoint, callBack)
      }
    }

    /*
      We have all the information needed to proceed to applying all the rules.
    */
    function applyBotRules (lrcPoint, previousLRCPoint, callBack) {
      if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> applyBotRules -> Entering Function.') }

      let channelTilt = NO_CHANNEL
      let ruleApplied = ''

      if (lrcPoint.max < lrcPoint.mid && lrcPoint.min > lrcPoint.mid && lrcPoint.mid < lrcPoint.min) {
        if (lrcPoint.min > previousLRCPoint.min && lrcPoint.mid > previousLRCPoint.mid && lrcPoint.max > previousLRCPoint.max) {
          // The channel points UP
          channelTilt = CHANNEL_UP
          ruleApplied += 'Rule_1.'
        }
      }

      if (lrcPoint.min < lrcPoint.mid && lrcPoint.max > lrcPoint.mid && lrcPoint.mid < lrcPoint.max) {
        if (lrcPoint.min < previousLRCPoint.min && lrcPoint.mid < previousLRCPoint.mid && lrcPoint.max < previousLRCPoint.max) {
          // The channel points DOWN
          channelTilt = CHANNEL_DOWN
          ruleApplied += 'Rule_2.'
        }
      }

      if (lrcPoint.min < previousLRCPoint.min && lrcPoint.mid <= previousLRCPoint.mid) {
        // 15 AND 30 changed direction from up to down
          channelTilt = CHANNEL_DOWN
          ruleApplied += 'Rule_3a.'
      }

      if (lrcPoint.min > previousLRCPoint.min && lrcPoint.mid >= previousLRCPoint.mid) {
        // 15 AND 30 changed direction from down to up
        channelTilt = CHANNEL_UP
        ruleApplied += 'Rule_3b.'
      }

      let logMessage = bot.processDatetime.toISOString() + '. Rule: ' + ruleApplied + '. Tilt: ' + channelTilt + ' (' + Number(lrcPoint.min).toLocaleString() + '|' + Number(lrcPoint.mid).toLocaleString() + '|' + Number(lrcPoint.max).toLocaleString() + ')'
      if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> getChannelTilt -> applyBotRules -> Results: ' + logMessage) }

      callBack(global.DEFAULT_OK_RESPONSE, channelTilt)
    }

    /*
      Here we will get the file from the indicator bot, that already has all values calculated.
      This will provide more efficiency and allow other bots to consume the services as well.
    */
    function getLRCPointsFile (dateTime, callback) {
      if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] start -> businessLogic -> getLRCPointsFile -> Entering function.') }

      let datePath = dateTime.getUTCFullYear() + '/' + pad(dateTime.getUTCMonth() + 1, 2) + '/' + pad(dateTime.getUTCDate(), 2)
      let filePath = 'LRC-Points/Multi-Period-Daily/30-min/' + datePath
      let fileName = market.assetA + '_' + market.assetB + '.json'

      /*
        bot.botCache: allows us to keep a map (key value pairs) between executions,
          so we don't need to go to the storage to retrieve this value.
        If the value already exist on the cache we will get it from there,
        otherwise it will be retrieved from the bot storage.
      */
      if (bot.startMode === 'Backtest' && bot.botCache.has(filePath)) {
        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] start -> businessLogic -> getLRCPointsFile -> Getting the file from local cache.') }

        cleanUpCache(bot.botCache, 'LRC-Points/Multi-Period-Daily/30-min', dateTime)
        callback(global.DEFAULT_OK_RESPONSE, bot.botCache.get(filePath))
      } else {
        /*
          The structure of the indicator files and the retrieved file itself 
          is explained on the indicator bot readme file.
        */
        gaussStorage.getTextFile(filePath, fileName, onFileReceived)
      }

      function onFileReceived (err, text) {
        if (err.result === global.DEFAULT_OK_RESPONSE.result) {
          if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] start -> getChannelTilt -> getLRCPointsFile -> onFileReceived > Entering Function.') }

          let lrcPointsFile = JSON.parse(text)
          bot.botCache.set(filePath, lrcPointsFile)
          callback(global.DEFAULT_OK_RESPONSE, lrcPointsFile)
        } else {
          logger.write(MODULE_NAME, '[ERROR] start -> getChannelTilt -> getLRCPointsFile -> onFileReceived -> Failed to get the file. Will abort the process and request a retry.')
          callBackFunction(global.DEFAULT_RETRY_RESPONSE)
          return
        }
      }

      function cleanUpCache (fileCache, path, dateTimeCacheFile) {
        let date = new Date(dateTimeCacheFile)
        date.setDate(date.getDate() - 2)
        let datePath = date.getUTCFullYear() + '/' + pad(date.getUTCMonth() + 1, 2) + '/' + pad(date.getUTCDate(), 2)
        let cachePosition = path + '/' + datePath

        // Remove and go back one day
        if (fileCache.has(cachePosition)) {
          fileCache.delete(cachePosition)
          date.setDate(date.getDate() - 1)
          cleanUpCache(fileCache, date)
        }
      }
    }

    function createBuyPosition (callBack) {
      try {
          if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> businessLogic -> createBuyPosition -> Entering function.') }

          // We get the current positions we have at the exchange
          let positions = assistant.getPositions()
          let assetABalance = assistant.getAvailableBalance().assetA
          let currentRate = assistant.getTicker().ask // *.9
          let amountA = assistant.getAvailableBalance().assetA
          let amountB = Number((amountA / currentRate).toFixed(8))

          if (positions.length > 0 && positions[0].type === 'buy' && positions[0].status !== 'executed') {
            if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> businessLogic -> createBuyPosition -> Moving an existing BUY position to a new price: $' + Number(currentRate).toLocaleString()) }

            let message = 'Moving an existing buy position to a new price: $' + Number(currentRate).toLocaleString()
            message += '. Combined ROI on current execution: ' + getCombinedProfit() + '%. '
            assistant.sendMessage(6, 'Moving Position', message)
            message = bot.processDatetime.toISOString() + ' - ' + message
            assistant.sendEmail('Alerts', message, bot.emailSubscriptions)
            assistant.movePosition(positions[0], currentRate, callBack)
          } else if (assetABalance > 0) {
            if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> businessLogic -> createBuyPosition -> Artuditu put a new BUY position at price: $' + Number(currentRate).toLocaleString()) }

            let message = 'Creating a new buy position. Price: $' + Number(currentRate).toLocaleString()
            message += '. Combined ROI on current execution: ' + getCombinedProfit() + '%. '
            assistant.sendMessage(7, 'Buying', message)
            message = bot.processDatetime.toISOString() + ' - ' + message
            assistant.sendEmail('Alerts', message, bot.emailSubscriptions)
            assistant.putPosition('buy', currentRate, amountA, amountB, callBack)
          } else {
            if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> businessLogic -> createBuyPosition -> Not enough available balance to buy.') }

            callBack(global.DEFAULT_OK_RESPONSE)
          }
        } catch (err) {
          logger.write(MODULE_NAME, '[ERROR] start -> businessLogic -> createBuyPosition -> err = ' + err.message)
          callBackFunction(global.DEFAULT_FAIL_RESPONSE)
        }
    }

    function createSellPosition (callBack) {
      try{
          if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> businessLogic -> createSellPosition -> Entering function.') }

          // We get the current positions we have at the exchange
          let positions = assistant.getPositions()
          let assetBBalance = assistant.getAvailableBalance().assetB
          let currentRate = assistant.getTicker().bid // *1.1
          let amountB = assistant.getAvailableBalance().assetB
          let amountA = amountB * currentRate

          if (positions.length > 0 && positions[0].type === 'sell' && positions[0].status !== 'executed') {
            if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> businessLogic -> createSellPosition -> Artuditu is moving an existing SELL position to a new price: $' + Number(currentRate).toLocaleString()) }

            let message = 'Moving an existing sell position to a new price: $' + Number(currentRate).toLocaleString()
            message += '. Combined ROI on current execution: ' + getCombinedProfit() + '%. '
            assistant.sendMessage(6, 'Moving Position', message)
            message = bot.processDatetime.toISOString() + ' - ' + message
            assistant.sendEmail('Alerts', message, bot.emailSubscriptions)
            assistant.movePosition(positions[0], currentRate, callBack)
          } else if (assetBBalance > 0) {
            if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> businessLogic -> createSellPosition -> Artuditu put a new SELL position at price: $' + Number(currentRate).toLocaleString()) }

            let message = 'Creating a new sell position. Price: $' + Number(currentRate).toLocaleString()
            message += '. Combined ROI on current execution: ' + getCombinedProfit() + '%. '
            assistant.sendMessage(7, 'Selling', message)
            message = bot.processDatetime.toISOString() + ' - ' + message
            assistant.sendEmail('Alerts', message, bot.emailSubscriptions)
            assistant.putPosition('sell', currentRate, amountA, amountB, callBack)
          } else {
            if (LOG_INFO === true) { logger.write(MODULE_NAME, '[INFO] start -> businessLogic -> createSellPosition -> There is not enough available balance to sell.') }

            callBack(global.DEFAULT_OK_RESPONSE)
          }
        } catch (err) {
          logger.write(MODULE_NAME, '[ERROR] start -> businessLogic -> createBuyPosition -> err = ' + err.message)
          callBackFunction(global.DEFAULT_FAIL_RESPONSE)
        }
    }

    function pad (str, max) {
      str = str.toString()
      return str.length < max ? pad('0' + str, max) : str
    }

    function isExecutionToday () {
      let localDate = new Date()
      let today = new Date(Date.UTC(
                localDate.getUTCFullYear(),
                localDate.getUTCMonth(),
                localDate.getUTCDate()))

      return (today.getUTCFullYear() === bot.processDatetime.getUTCFullYear()
                && today.getUTCMonth() === bot.processDatetime.getUTCMonth()
                && today.getUTCDate() === bot.processDatetime.getUTCDate())
    }

    function getCombinedProfit () {
      if (assistant.getCombinedProfits() !== undefined) {
        if (assistant.getCombinedProfits().assetA > 0) {
          return Number(assistant.getCombinedProfits().assetA).toLocaleString()
        } else {
          return Number(assistant.getCombinedProfits().assetB).toLocaleString()
        }
      }
    }
  }
}
