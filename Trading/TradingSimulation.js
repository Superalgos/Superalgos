exports.newTradingSimulation = function newTradingSimulation(bot, logger, UTILITIES) {
    const FULL_LOG = true
    const LOG_FILE_CONTENT = false
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000
    const MODULE_NAME = 'Trading Simulation -> ' + bot.SESSION.name

    const GMT_SECONDS = ':00.000 GMT+0000'

    let thisObject = {
        finalize: finalize,
        runSimulation: runSimulation
    }

    let utilities = UTILITIES.newCloudUtilities(bot, logger)

    return thisObject

    function finalize() {
        thisObject = undefined
    }

    function runSimulation(
        chart,
        dataDependencies,
        timeFrame,
        timeFrameLabel,
        currentDay,
        variable,
        exchangeAPI,
        recordsArray,
        conditionsArray,
        strategiesArray,
        positionsArray,
        callback,
        callBackFunction) {
        try {
            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> Entering function.') }
            let processingDailyFiles
            if (timeFrame > global.dailyFilePeriods[0][0]) {
                processingDailyFiles = false
            } else {
                processingDailyFiles = true
            }

            /* Snapshots of Trigger On and Take Positions */
            let snapshots = {
                headers: undefined,
                triggerOn: [],
                takePosition: [],
                lastTriggerOn: undefined,
                lastTakePosition: undefined
            }

            let tradingSystem = bot.TRADING_SYSTEM
            let tradingEngine = bot.TRADING_ENGINE
            let sessionParameters = bot.SESSION.parameters

            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> sessionParameters.timeRange.config.initialDatetime = ' + sessionParameters.timeRange.config.initialDatetime) }
            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> sessionParameters.timeRange.config.finalDatetime = ' + sessionParameters.timeRange.config.finalDatetime) }

            let timerToCloseStage = 0

            /* Stop Loss Management */

            const MIN_STOP_LOSS_VALUE = 0.0000000001 // We can not let the stop be zero to avoid division by 0 error or infinity numbers as a result.
            const MAX_STOP_LOSS_VALUE = Number.MAX_SAFE_INTEGER

            /* Take Profit Management */

            const MIN_TAKE_PROFIT_VALUE = 0.0000000001 // We can not let the buy order be zero to avoid division by 0 error or infinity numbers as a result.
            const MAX_TAKE_PROFIT_VALUE = Number.MAX_SAFE_INTEGER

            /* Variables for this executioin only */
            let takePositionNow = false
            let closePositionNow = false

            /* In some cases we need to know if we are positioned at the last candle of the calendar day, for that we need these variables. */
            let lastInstantOfTheDay = 0
            if (currentDay) {
                lastInstantOfTheDay = currentDay.valueOf() + ONE_DAY_IN_MILISECONDS - 1
            }

            const TRADING_ENGINE_MODULE = require('./TradingEngine.js')
            let tradingEngineModule = TRADING_ENGINE_MODULE.newTradingEngine(bot, logger)
            tradingEngineModule.initialize()

            const TRADING_ENGINE_MODULE = require('./TradingExecution.js')
            let tradingExecutionModule = TRADING_ENGINE_MODULE.newTradingExecution(bot, logger)
            tradingExecutionModule.initialize()

            const TRADING_RECORDS_MODULE = require('./TradingRecords.js')
            let tradingRecordsModule = TRADING_RECORDS_MODULE.newTradingRecords(bot, logger)
            tradingRecordsModule.initialize()

            const SNAPSHOTS_MODULE = require('./Snapshots.js')
            let snapshotsModule = SNAPSHOTS_MODULE.newSnapshots(bot, logger)
            snapshotsModule.initialize()

            const ANNOUNCEMENTS_MODULE = require('./Announcements.js')
            let announcementsModule = ANNOUNCEMENTS_MODULE.newAnnouncements(bot, logger)
            announcementsModule.initialize()

            const TRADING_SYSTEM_MODULE = require('./TradingSystem.js')
            let tradingSystemModule = TRADING_SYSTEM_MODULE.newTradingSystem(bot, logger)
            tradingSystemModule.initialize()

            /* Main Array and Maps */
            let propertyName = 'at' + sessionParameters.timeFrame.config.label.replace('-', '')
            let candles = chart[propertyName].candles
            let currentChart = chart[propertyName]

            /* Last Candle */
            let lastCandle = candles[candles.length - 1]

            /* Main Simulation Loop: We go thourgh all the candles at this time period. */
            let currentCandleIndex

            /* For Loop Level heartbeat */
            let loopingDay
            let previousLoopingDay

            initializeLoop()

            function initializeLoop() {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> initializeLoop -> Entering function.') }

                if (bot.RESUME === true && tradingEngine.last.candle !== undefined) {
                    /* Estimate the Initial Candle based on the last candle saved at tradingEngine */
                    let firstBegin = candles[0].begin
                    let lastBegin = tradingEngine.last.candle.begin
                    let diff = lastBegin - firstBegin
                    let amount = diff / sessionParameters.timeFrame.config.value

                    currentCandleIndex = Math.trunc(amount) + 1 // Because we need to start from the next candle
                    if (currentCandleIndex < 0 || currentCandleIndex > candles.length - 1) {
                        logger.write(MODULE_NAME, '[ERROR] runSimulation -> initializeLoop -> Cannot resume simulation.')
                        logger.write(MODULE_NAME, '[ERROR] runSimulation -> initializeLoop -> currentCandleIndex = ' + currentCandleIndex)
                        logger.write(MODULE_NAME, '[ERROR] runSimulation -> initializeLoop -> firstBegin = ' + firstBegin)
                        logger.write(MODULE_NAME, '[ERROR] runSimulation -> initializeLoop -> lastBegin = ' + lastBegin)
                        logger.write(MODULE_NAME, '[ERROR] runSimulation -> initializeLoop -> diff = ' + diff)
                        logger.write(MODULE_NAME, '[ERROR] runSimulation -> initializeLoop -> amount = ' + amount)

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                        return
                    }
                } else {
                    /* Estimate Initial Candle based on the timeRage configured for the session. */
                    let firstEnd = candles[0].end
                    let targetEnd = sessionParameters.timeRange.config.initialDatetime.valueOf()
                    let diff = targetEnd - firstEnd
                    let amount = diff / sessionParameters.timeFrame.config.value

                    currentCandleIndex = Math.trunc(amount)
                    if (currentCandleIndex < 0) { currentCandleIndex = 0 }
                    if (currentCandleIndex > candles.length - 1) {
                        /* 
                        This will happen when the sessionParameters.timeRange.config.initialDatetime is beyond the last candle available, 
                        meaning that the dataSet needs to be updated with more up-to-date data. 
                        */
                        currentCandleIndex = candles.length - 1
                    }
                }

                loop()
            }

            function loop() {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Entering function.') }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Processing candle # ' + currentCandleIndex) }

                /* We are going to take snapshots of the values of indicators at key moments of the sumulation. */

                let snapshotKeys = new Map()
                snapshotLoopHeaders = []
                snapshotDataRecord = []
                saveAsLastTriggerOnSnapshot = false
                saveAsLastTakePositionSnapshot = false
                addToSnapshots = false

                let announcementsToBeMade = []
                let candle = candles[currentCandleIndex]

                /* Not processing while out of user-defined time range */
                if (candle.end < sessionParameters.timeRange.config.initialDatetime.valueOf()) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Skipping Candle before the sessionParameters.timeRange.config.initialDatetime.') }
                    controlLoop()
                    return
                }
                if (candle.begin > sessionParameters.timeRange.config.finalDatetime.valueOf()) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Skipping Candle after the sessionParameters.timeRange.config.finalDatetime.') }
                    afterLoop()
                    return
                }

                /* Here we update at the chart data structure the objects for each product representing where we are currently standing at the simulation loop */
                if (processingDailyFiles) {
                    for (let j = 0; j < global.dailyFilePeriods.length; j++) {
                        let mapKey = dailyFilePeriods[j][1]
                        let propertyName = 'at' + mapKey.replace('-', '')
                        let thisChart = chart[propertyName]

                        for (let k = 0; k < dataDependencies.length; k++) {
                            let dataDependencyNode = dataDependencies[k]
                            if (dataDependencyNode.referenceParent.config.codeName !== 'Multi-Period-Daily') { continue }
                            let singularVariableName = dataDependencyNode.referenceParent.parentNode.config.singularVariableName
                            let pluralVariableName = dataDependencyNode.referenceParent.parentNode.config.pluralVariableName
                            let currentElement = getElement(thisChart[pluralVariableName], candle, 'Daily' + '-' + mapKey + '-' + pluralVariableName)
                            thisChart[singularVariableName] = currentElement
                        }
                    }
                }

                /* Finding the Current Element on Market Files */
                for (let j = 0; j < global.marketFilesPeriods.length; j++) {
                    let mapKey = marketFilesPeriods[j][1]
                    let propertyName = 'at' + mapKey.replace('-', '')
                    let thisChart = chart[propertyName]

                    for (let k = 0; k < dataDependencies.length; k++) {
                        let dataDependencyNode = dataDependencies[k]
                        if (dataDependencyNode.referenceParent.config.codeName !== 'Multi-Period-Market') { continue }
                        let singularVariableName = dataDependencyNode.referenceParent.parentNode.config.singularVariableName
                        let pluralVariableName = dataDependencyNode.referenceParent.parentNode.config.pluralVariableName
                        let currentElement = getElement(thisChart[pluralVariableName], candle, 'Market' + '-' + mapKey + '-' + pluralVariableName)
                        thisChart[singularVariableName] = currentElement
                    }
                }

                /* Finding the Current Element on Single Files */
                function isItInside(elementWithTimestamp, elementWithBeginEnd) {
                    if (elementWithTimestamp.timestamp >= elementWithBeginEnd.begin && elementWithTimestamp.timestamp <= elementWithBeginEnd.end) {
                        return true
                    } else {
                        return false
                    }
                }

                let propertyName = 'atAnyTimeFrame'
                let thisChart = chart[propertyName]

                for (let k = 0; k < dataDependencies.length; k++) {
                    let dataDependencyNode = dataDependencies[k]
                    if (dataDependencyNode.referenceParent.config.codeName !== 'Single-File') { continue }
                    let singularVariableName = dataDependencyNode.referenceParent.parentNode.config.singularVariableName
                    let pluralVariableName = dataDependencyNode.referenceParent.parentNode.config.pluralVariableName
                    let elementArray = thisChart[pluralVariableName]
                    let currentElement
                    if (elementArray !== undefined) {
                        currentElement = elementArray[elementArray.length - 1]
                    }
                    thisChart[singularVariableName] = currentElement
                }

                /* While we are processing the previous day. */
                let positionedAtYesterday = false
                if (currentDay) {
                    positionedAtYesterday = (candle.end < currentDay.valueOf())
                }

                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Candle Begin @ ' + (new Date(candle.begin)).toLocaleString()) }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Candle End @ ' + (new Date(candle.end)).toLocaleString()) }

                let ticker = {
                    bid: candle.close,
                    ask: candle.close,
                    last: candle.close
                }

                /* We will produce a simulation level heartbeat in order to inform the user this is running. */
                loopingDay = new Date(Math.trunc(candle.begin / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS)
                if (loopingDay.valueOf() !== previousLoopingDay) {
                    let processingDate = loopingDay.getUTCFullYear() + '-' + utilities.pad(loopingDay.getUTCMonth() + 1, 2) + '-' + utilities.pad(loopingDay.getUTCDate(), 2)

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Simulation ' + bot.sessionKey + ' Loop # ' + currentCandleIndex + ' @ ' + processingDate) }

                    /*  Telling the world we are alive and doing well */
                    let fromDate = new Date(sessionParameters.timeRange.config.initialDatetime.valueOf())
                    let lastDate = new Date(sessionParameters.timeRange.config.finalDatetime.valueOf())

                    let currentDateString = loopingDay.getUTCFullYear() + '-' + utilities.pad(loopingDay.getUTCMonth() + 1, 2) + '-' + utilities.pad(loopingDay.getUTCDate(), 2)
                    let currentDate = new Date(loopingDay)
                    let percentage = global.getPercentage(fromDate, currentDate, lastDate)
                    bot.processHeartBeat(currentDateString, percentage)

                    if (global.areEqualDates(currentDate, new Date()) === false) {
                        logger.newInternalLoop(bot.codeName, bot.process, currentDate, percentage)
                    }
                }
                previousLoopingDay = loopingDay.valueOf()

                tradingEngine.episode.episodeCounters.periods++
                tradingEngine.episode.episodeStatistics.days = tradingEngine.episode.episodeCounters.periods * sessionParameters.timeFrame.config.value / ONE_DAY_IN_MILISECONDS

                if (processingDailyFiles) {
                    /* We skip the candle at the head of the market because currentCandleIndex has not closed yet. */
                    let candlesPerDay = ONE_DAY_IN_MILISECONDS / sessionParameters.timeFrame.config.value
                    if (currentCandleIndex === candles.length - 1) {
                        if ((candles.length < candlesPerDay) || (candles.length > candlesPerDay && candles.length < candlesPerDay * 2)) {
                            /* We are at the head of the market, thus we skip the last candle because it has not close yet. */
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Skipping Candle because it is the last one and has not been closed yet.') }
                            controlLoop()
                            return
                            /* Note here that in the last candle of the first day or the second day it will use an incomplete candle and partially calculated indicators.
                                if we skip these two tradingEngine.episode.episodeCounters.periods, then there will be a hole in the file since the last period will be missing. */
                        }
                    }
                } else { // We are processing Market Files
                    if (currentCandleIndex === candles.length - 1) {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Skipping Candle because it is the last one and has not been closed yet.') }
                        controlLoop()
                        return
                    }
                }


                tradingSystemModule.setCandle(candle)
                tradingSystemModule.setChart(chart)
                tradingSystemModule.evalConditions()
                tradingSystemModule.evalFormulas()



                /* Checks for Minimun and Maximun Balance. We do the check while not inside any strategy only. */
                if (
                    tradingEngine.current.strategy.stageType.value === 'No Stage' &&
                    tradingEngine.current.strategy.index.value === -1
                ) {
                    /* 
                    First thing to do is to check if we are below the minimum balance, or above the maximun balance.
                    If we are, we are not gooing to trigger on again. 
                    */
                    let minimumBalance
                    let maximumBalance
                    let balance

                    if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
                        balance = tradingEngine.current.balance.baseAsset.value
                        minimumBalance = sessionParameters.sessionBaseAsset.config.minimumBalance
                        maximumBalance = sessionParameters.sessionBaseAsset.config.maximumBalance
                    } else {
                        balance = tradingEngine.current.balance.quotedAsset.value
                        minimumBalance = sessionParameters.sessionQuotedAsset.config.minimumBalance
                        maximumBalance = sessionParameters.sessionQuotedAsset.config.maximumBalance
                    }

                    let stopRunningDate = new Date(candle.begin)
                    if (balance <= minimumBalance) {
                        tradingSystem.error = 'Min Balance @ ' + stopRunningDate.toLocaleString()
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> ' + tradingSystem.error) }
                        afterLoop()
                        return
                    }

                    if (balance >= maximumBalance) {
                        tradingSystem.error = 'Max Balance @ ' + stopRunningDate.toLocaleString()
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> ' + tradingSystem.error) }
                        afterLoop()
                        return
                    }
                }

                tradingSystemModule.checkTriggerOn()
                tradingSystemModule.checkTriggerOff()
                takePositionNow = tradingSystemModule.checkTakePosition()

                /* Stop Loss Management */
                if (
                    (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage') &&
                    takePositionNow !== true
                ) {
                    tradingSystemModule.checkStopPhases()
                    tradingSystemModule.calculateStopLoss()
                }

                /* Take Profit Management */
                if (
                    (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage') &&
                    takePositionNow !== true
                ) {
                    tradingSystemModule.checkTakeProfitPhases()
                    tradingSystemModule.calculateTakeProfit()
                }


                tradingEngineModule.updatePositionCounters()
                tradingEngineModule.updateDistanceToEventsCounters()

                /* Checking if Stop or Take Profit were hit */
                if (
                    (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage') &&
                    takePositionNow !== true
                ) {
                    closePositionNow = tradingSystemModule.checkStopLossOrTakeProfitWasHit()
                }



                /* Taking a Position */
                if (
                    takePositionNow === true
                ) {
                    takePositionNow = false
                    tradingEngineModule.getReadyToTakePosition(candle)
                    tradingExecutionModule.takePosition()
                    tradingEngineModule.takePosition()
                }

                /* Closing a Position */
                if (
                    closePositionNow === true
                ) {
                    closePositionNow = false
                    tradingEngineModule.getReadyToClosePosition(candle)
                    tradingExecutionModule.closePosition()
                    tradingEngineModule.closePosition()
                }

                /* Closing the Closing Stage */
                if (tradingEngine.current.strategy.stageType.value === 'Close Stage') {
                    if (candle.begin - 5 * 60 * 1000 > timerToCloseStage) {
                        tradingEngine.current.strategy.end.value = candle.end
                        tradingEngine.current.strategy.endRate.value = candle.min
                        tradingEngine.current.strategy.status.value = 'Closed'

                        tradingEngine.current.strategy.index.value = -1
                        tradingEngine.current.strategy.stageType.value = 'No Stage'

                        timerToCloseStage = 0
                        tradingEngine.current.distanceToEvent.triggerOff.value = 1

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Closing the Closing Stage -> Exiting Close Stage.') }
                    } else {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Closing the Closing Stage -> Waiting for timer.') }
                    }
                }

                snapshotsModule.manageSnapshots()
                tradingRecordsModule.addSimulationRecord()
                tradingRecordsModule.addConditionsRecord()
                tradingRecordsModule.addStrategyRecord()
                tradingRecordsModule.addPositionRecord()

                /* We will remmember the last candle processed, so that if it is the last one of this run we can use it to continue from there next time. */
                tradingEngine.last.candle.begin = candle.begin
                tradingEngine.last.candle.end = candle.end

                /* After everything at the simulation level was done, we will do the annoucements that are pending. */
                makeAnnoucements()


                controlLoop()
                return


                function checkAnnouncements(node, value) {
                    /*
                    Value is an optional parameter that represents the value that the announcement is monitoring for change (for numeric values only).
                    If we do receive this value, we will only make the annoucement if the variance is grater than the user pre-defined value
                    for this variance.
                    */

                    if (node.announcements !== undefined) {
                        for (let i = 0; i < node.announcements.length; i++) {
                            let announcement = node.announcements[i]
                            let key = node.type + '-' + announcement.name + '-' + announcement.id

                            let lastPeriodAnnounced = -1
                            let newAnnouncementRecord = {}

                            for (let j = 0; j < variable.announcements.length; j++) {
                                let announcementRecord = variable.announcements[j]
                                if (announcementRecord.key === key) {
                                    lastPeriodAnnounced = announcementRecord.periods
                                    newAnnouncementRecord = announcementRecord
                                    break
                                }
                            }

                            if (tradingEngine.episode.episodeCounters.periods > lastPeriodAnnounced) {
                                if (isNaN(value) === false) {
                                    /* The Value Variation is what tells us how much the value already announced must change in order to annouce it again. */
                                    let valueVariation

                                    let config = announcement.config
                                    valueVariation = config.valueVariation

                                    if (newAnnouncementRecord.value !== undefined && valueVariation !== undefined) {
                                        let upperLimit = newAnnouncementRecord.value + newAnnouncementRecord.value * valueVariation / 100
                                        let lowerLimit = newAnnouncementRecord.value - newAnnouncementRecord.value * valueVariation / 100
                                        if (value > lowerLimit && value < upperLimit) {
                                            /* There is not enough variation to announce this again. */
                                            return
                                        }
                                    }
                                }

                                /*
                                We store the announcement temporarily at an Array to differ its execution, becasue we need to evaulate its formula
                                and at this point in time the potential variables used at the formula are still not set.
                                */
                                announcement.value = value
                                announcementsToBeMade.push(announcement)

                                /* Next, we will remmeber this announcement was already done, so that it is not announced again in further processing of the same day. */
                                if (newAnnouncementRecord.periods !== undefined) {
                                    newAnnouncementRecord.periods = tradingEngine.episode.episodeCounters.periods
                                    newAnnouncementRecord.value = value
                                } else {
                                    newAnnouncementRecord = {
                                        key: key,
                                        periods: tradingEngine.episode.episodeCounters.periods,
                                        value: value
                                    }
                                    variable.announcements.push(newAnnouncementRecord)
                                }
                            }
                        }
                    }
                }

                function makeAnnoucements() {
                    /* Here we go through all the annoucements that need to be done during this loop, and we just do them. */
                    for (let i = 0; i < announcementsToBeMade.length; i++) {
                        announcement = announcementsToBeMade[i]
                        /* Here we check if there is a formula attached to the annoucement, we evaluate it to get the annoucement text. */
                        let formulaValue
                        if (announcement.formula !== undefined) {
                            try {
                                let value = announcement.value
                                formulaValue = eval(announcement.formula.code)
                            } catch (err) {
                                announcement.formula.error = err.message
                            }
                        }
                        announcement.formulaValue = formulaValue

                        if (bot.SESSION.socialBots !== undefined) {
                            bot.SESSION.socialBots.announce(announcement)
                        }
                    }
                }

                function addCodeToSnapshot(code) {
                    if (code === undefined) { return }

                    try {
                        let instructionsArray = code.split(' ')
                        for (let i = 0; i < instructionsArray.length; i++) {
                            let instruction = instructionsArray[i]
                            instruction = instruction.replace('(', '')
                            instruction = instruction.replace(')', '')
                            instruction = instruction.replace(/</g, '')
                            instruction = instruction.replace(/>/g, '')
                            instruction = instruction.replace(/<=/g, '')
                            instruction = instruction.replace(/>=/g, '')
                            instruction = instruction.replace(/!=/g, '')
                            instruction = instruction.replace(/!==/g, '')
                            instruction = instruction.replace(/==/g, '')
                            instruction = instruction.replace(/===/g, '')
                            instruction = instruction.replace(/{/g, '')
                            instruction = instruction.replace(/}/g, '')
                            if (instruction.indexOf('chart') >= 0) {
                                let parts = instruction.split('.')
                                let timeFrame = parts[1]
                                let product = parts[2]
                                let property
                                checkPrevious(3)
                                function checkPrevious(index) {
                                    property = parts[index]
                                    if (property === 'previous') {
                                        product = product + '.previous'
                                        checkPrevious(index + 1)
                                    }
                                }

                                // Example: chart.at01hs.popularSMA.sma200 - chart.at01hs.popularSMA.sma100  < 10
                                if (timeFrame !== 'atAnyvariable.timeFrame') {
                                    timeFrame = timeFrame.substring(2, 4) + '-' + timeFrame.substring(4, 7)
                                }
                                let key = timeFrame + '-' + product + '-' + property
                                let existingKey = snapshotKeys.get(key)

                                if (existingKey === undefined) { // means that at the current loop this property of this product was not used before.
                                    snapshotKeys.set(key, key)
                                    snapshotLoopHeaders.push(key)

                                    let value = eval(instruction)
                                    snapshotDataRecord.push(value)
                                }
                            }
                        }
                    } catch (err) {
                        logger.write(MODULE_NAME, '[ERROR] runSimulation -> addCodeToSnapshot -> code = ' + code)
                        logger.write(MODULE_NAME, '[ERROR] runSimulation -> addCodeToSnapshot -> err = ' + err.stack)
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                    }
                }
            }

            function controlLoop() {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> controlLoop -> Entering function.') }

                /* Checking if we should continue processing this loop or not. */
                if (bot.STOP_SESSION === true) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this session.') }
                    console.log('[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this session.')
                    afterLoop()
                    return
                }

                if (global.STOP_TASK_GRACEFULLY === true) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this task.') }
                    console.log('[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this task.')
                    afterLoop()
                    return
                }

                currentCandleIndex++
                if (currentCandleIndex < candles.length) {
                    setImmediate(loop) // This will execute the next loop in the next iteration of the NodeJs event loop allowing for other callbacks to be executed.
                } else {
                    afterLoop()
                }
            }

            function afterLoop() {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> afterLoop -> Entering function.') }

                tradingEngineModule.finalize()
                tradingExecutionModule.finalize()
                tradingSystemModule.finalize()
                tradingRecordsModule.finalize()
                snapshotsModule.finalize()
                announcementsModule.finalize()


                callback(tradingSystem, snapshots.headers, snapshots.triggerOn, snapshots.takePosition)
            }

            function getElement(pArray, currentCandle, datasetName) {
                if (pArray === undefined) { return }
                try {
                    let element
                    for (let i = 0; i < pArray.length; i++) {
                        element = pArray[i]

                        if (currentCandle.end === element.end) { // when there is an exact match at the end we take that element
                            return element
                        } else {
                            if (
                                i > 0 &&
                                element.end > currentCandle.end
                            ) {
                                let previousElement = pArray[i - 1]
                                if (previousElement.end < currentCandle.end) {
                                    return previousElement // If one elements goes into the future of currentCandle, then we stop and take the previous element.
                                } else {
                                    return
                                }
                            }
                            if (
                                i === pArray.length - 1 // If we reach the end of the array, then we return the last element.
                                &&
                                element.end < currentCandle.end
                            ) {
                                return element
                            }
                        }
                    }
                    return
                } catch (err) {
                    logger.write(MODULE_NAME, '[ERROR] runSimulation -> getElement -> datasetName = ' + datasetName)
                    logger.write(MODULE_NAME, '[ERROR] runSimulation -> getElement -> err = ' + err.stack)
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                }
            }
        } catch (err) {
            logger.write(MODULE_NAME, '[ERROR] runSimulation -> err = ' + err.stack)
            callBackFunction(global.DEFAULT_FAIL_RESPONSE)
        }
    }
}

