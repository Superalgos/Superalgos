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

                const TRADING_SYSTEM_MODULE = require('./TradingSystem.js')
                let tradingSystemModule = TRADING_SYSTEM_MODULE.newTradingSystem(bot, logger)
                tradingSystemModule.initialize(chart)
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
                tradingSystemModule.checkTakePosition()
                tradingSystemModule.finalize()

                /* Stop Loss Management */
                if (
                    (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage') &&
                    takePositionNow !== true
                ) {
                    checkStopPhases()
                    calculateStopLoss()
                }

                function checkStopPhases() {
                    let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]

                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let parentNode
                    let j = tradingEngine.current.strategy.index.value
                    let stageKey
                    let initialDefinitionKey = ''
                    let p

                    if (tradingEngine.current.position.stopLoss.stopLossStage.value === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.stopLoss !== undefined) {
                                parentNode = openStage.initialDefinition
                                initialDefinitionKey = '-' + 'initialDefinition'
                                stageKey = 'openStage'
                                p = tradingEngine.current.position.stopLoss.stopLossPhase.value
                            }
                        }
                    }

                    if (tradingEngine.current.position.stopLoss.stopLossStage.value === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.stopLoss !== undefined) {
                            parentNode = manageStage
                            stageKey = 'manageStage'
                            p = tradingEngine.current.position.stopLoss.stopLossPhase.value - 1
                        }
                    }

                    if (parentNode !== undefined) {
                        let phase = parentNode.stopLoss.phases[p]

                        /* Check the next Phase Event. */
                        let nextPhaseEvent = phase.nextPhaseEvent
                        if (nextPhaseEvent !== undefined) {
                            for (let k = 0; k < nextPhaseEvent.situations.length; k++) {
                                let situation = nextPhaseEvent.situations[k]
                                let passed
                                if (situation.conditions.length > 0) {
                                    passed = true
                                }

                                for (let m = 0; m < situation.conditions.length; m++) {
                                    let condition = situation.conditions[m]
                                    let key = j + '-' + stageKey + initialDefinitionKey + '-' + 'stopLoss' + '-' + p + '-' + k + '-' + m

                                    let value = false
                                    if (conditions.get(key) !== undefined) {
                                        value = conditions.get(key).value
                                    }

                                    if (value === false) { passed = false }
                                }

                                if (passed) {
                                    tradingEngine.current.position.stopLoss.stopLossPhase.value++
                                    tradingEngine.current.position.stopLoss.stopLossStage.value = 'Manage Stage'
                                    if (tradingEngine.current.position.takeProfit.takeProfitPhase.value > 0) {
                                        tradingEngine.current.strategy.stageType.value = 'Manage Stage'
                                        checkAnnouncements(manageStage, 'Take Profit')
                                    }

                                    checkAnnouncements(nextPhaseEvent)
                                    return
                                }
                            }
                        }

                        /* Check the Move to Phase Events. */
                        for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                            let moveToPhaseEvent = phase.moveToPhaseEvents[n]
                            if (moveToPhaseEvent !== undefined) {
                                for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {
                                    let situation = moveToPhaseEvent.situations[k]
                                    let passed
                                    if (situation.conditions.length > 0) {
                                        passed = true
                                    }

                                    for (let m = 0; m < situation.conditions.length; m++) {

                                        let condition = situation.conditions[m]
                                        let key = j + '-' + stageKey + initialDefinitionKey + '-' + 'stopLoss' + '-' + p + '-' + n + '-' + k + '-' + m

                                        let value = false
                                        if (conditions.get(key) !== undefined) {
                                            value = conditions.get(key).value
                                        }

                                        if (value === false) { passed = false }
                                    }

                                    if (passed) {

                                        let moveToPhase = moveToPhaseEvent.referenceParent
                                        if (moveToPhase !== undefined) {
                                            for (let q = 0; q < parentNode.stopLoss.phases.length; q++) {
                                                if (parentNode.stopLoss.phases[q].id === moveToPhase.id) {
                                                    tradingEngine.current.position.stopLoss.stopLossPhase.value = q + 1
                                                }
                                            }
                                        } else {
                                            moveToPhaseEvent.error = 'This Node needs to reference a Phase.'
                                            continue
                                        }

                                        tradingEngine.current.position.stopLoss.stopLossStage.value = 'Manage Stage'
                                        if (tradingEngine.current.position.takeProfit.takeProfitPhase.value > 0) {
                                            tradingEngine.current.strategy.stageType.value = 'Manage Stage'
                                            checkAnnouncements(manageStage, 'Take Profit')
                                        }

                                        checkAnnouncements(moveToPhaseEvent)
                                        return
                                    }
                                }
                            }
                        }
                    }
                }

                function calculateStopLoss() {
                    let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]
                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let phase
                    let key

                    if (tradingEngine.current.position.stopLoss.stopLossStage.value === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.stopLoss !== undefined) {
                                phase = openStage.initialDefinition.stopLoss.phases[tradingEngine.current.position.stopLoss.stopLossPhase.value]
                                key = tradingEngine.current.strategy.index.value + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'stopLoss' + '-' + (tradingEngine.current.position.stopLoss.stopLossPhase.value)
                            }
                        }
                    }

                    if (tradingEngine.current.position.stopLoss.stopLossStage.value === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.stopLoss !== undefined) {
                            phase = manageStage.stopLoss.phases[tradingEngine.current.position.stopLoss.stopLossPhase.value - 1]
                            key = tradingEngine.current.strategy.index.value + '-' + 'manageStage' + '-' + 'stopLoss' + '-' + (tradingEngine.current.position.stopLoss.stopLossPhase.value - 1)
                        }
                    }

                    if (phase !== undefined) {
                        if (phase.formula !== undefined) {
                            let previousValue = tradingEngine.current.position.stopLoss.value

                            tradingEngine.current.position.stopLoss.value = formulas.get(key)

                            if (tradingEngine.current.position.stopLoss.value !== previousValue) {
                                checkAnnouncements(phase, tradingEngine.current.position.stopLoss.value)
                            }
                        }
                    }
                }

                /* Take Profit Management */
                if (
                    (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage') &&
                    takePositionNow !== true
                ) {
                    checkTakeProfitPhases()
                    calculateTakeProfit()
                }

                function checkTakeProfitPhases() {
                    let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]

                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let parentNode
                    let j = tradingEngine.current.strategy.index.value
                    let stageKey
                    let initialDefinitionKey = ''
                    let p

                    if (tradingEngine.current.position.takeProfit.takeProfitStage.value === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.takeProfit !== undefined) {
                                parentNode = openStage.initialDefinition
                                initialDefinitionKey = '-' + 'initialDefinition'
                                stageKey = 'openStage'
                                p = tradingEngine.current.position.takeProfit.takeProfitPhase.value
                            }
                        }
                    }

                    if (tradingEngine.current.position.takeProfit.takeProfitStage.value === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.takeProfit !== undefined) {
                            parentNode = manageStage
                            stageKey = 'manageStage'
                            p = tradingEngine.current.position.takeProfit.takeProfitPhase.value - 1
                        }
                    }

                    if (parentNode !== undefined) {
                        let phase = parentNode.takeProfit.phases[p]
                        if (phase === undefined) { return } // trying to jump to a phase that does not exists.

                        /* Check the next Phase Event. */
                        let nextPhaseEvent = phase.nextPhaseEvent
                        if (nextPhaseEvent !== undefined) {
                            for (let k = 0; k < nextPhaseEvent.situations.length; k++) {
                                let situation = nextPhaseEvent.situations[k]
                                let passed
                                if (situation.conditions.length > 0) {
                                    passed = true
                                }

                                for (let m = 0; m < situation.conditions.length; m++) {
                                    let condition = situation.conditions[m]
                                    let key = j + '-' + stageKey + initialDefinitionKey + '-' + 'takeProfit' + '-' + p + '-' + k + '-' + m

                                    let value = false
                                    if (conditions.get(key) !== undefined) {
                                        value = conditions.get(key).value
                                    }

                                    if (value === false) { passed = false }
                                }

                                if (passed) {
                                    tradingEngine.current.position.takeProfit.takeProfitPhase.value++
                                    tradingEngine.current.position.takeProfit.takeProfitStage.value = 'Manage Stage'
                                    if (tradingEngine.current.position.stopLoss.stopLossPhase.value > 0) {
                                        tradingEngine.current.strategy.stageType.value = 'Manage Stage'
                                        checkAnnouncements(manageStage, 'Stop')
                                    }

                                    checkAnnouncements(nextPhaseEvent)
                                    return
                                }
                            }
                        }

                        /* Check the Move to Phase Events. */
                        for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                            let moveToPhaseEvent = phase.moveToPhaseEvents[n]
                            if (moveToPhaseEvent !== undefined) {
                                for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {
                                    let situation = moveToPhaseEvent.situations[k]
                                    let passed
                                    if (situation.conditions.length > 0) {
                                        passed = true
                                    }

                                    for (let m = 0; m < situation.conditions.length; m++) {

                                        let condition = situation.conditions[m]
                                        let key = j + '-' + stageKey + initialDefinitionKey + '-' + 'takeProfit' + '-' + p + '-' + n + '-' + k + '-' + m

                                        let value = false
                                        if (conditions.get(key) !== undefined) {
                                            value = conditions.get(key).value
                                        }

                                        if (value === false) { passed = false }
                                    }

                                    if (passed) {

                                        let moveToPhase = moveToPhaseEvent.referenceParent
                                        if (moveToPhase !== undefined) {
                                            for (let q = 0; q < parentNode.takeProfit.phases.length; q++) {
                                                if (parentNode.takeProfit.phases[q].id === moveToPhase.id) {
                                                    tradingEngine.current.position.takeProfit.takeProfitPhase.value = q + 1
                                                }
                                            }
                                        } else {
                                            moveToPhaseEvent.error = 'This Node needs to reference a Phase.'
                                            continue
                                        }

                                        tradingEngine.current.position.takeProfit.takeProfitStage.value = 'Manage Stage'
                                        if (tradingEngine.current.position.stopLoss.stopLossPhase.value > 0) {
                                            tradingEngine.current.strategy.stageType.value = 'Manage Stage'
                                            checkAnnouncements(manageStage, 'Stop')
                                        }

                                        checkAnnouncements(moveToPhaseEvent)
                                        return
                                    }
                                }
                            }
                        }
                    }
                }

                function calculateTakeProfit() {
                    let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]
                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let phase
                    let key

                    if (tradingEngine.current.position.takeProfit.takeProfitStage.value === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.takeProfit !== undefined) {
                                phase = openStage.initialDefinition.takeProfit.phases[tradingEngine.current.position.takeProfit.takeProfitPhase.value]
                                key = tradingEngine.current.strategy.index.value + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'takeProfit' + '-' + (tradingEngine.current.position.takeProfit.takeProfitPhase.value)
                            }
                        }
                    }

                    if (tradingEngine.current.position.takeProfit.takeProfitStage.value === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.takeProfit !== undefined) {
                            phase = manageStage.takeProfit.phases[tradingEngine.current.position.takeProfit.takeProfitPhase.value - 1]
                            key = tradingEngine.current.strategy.index.value + '-' + 'manageStage' + '-' + 'takeProfit' + '-' + (tradingEngine.current.position.takeProfit.takeProfitPhase.value - 1)
                        }
                    }

                    if (phase !== undefined) {
                        if (phase.formula !== undefined) {
                            let previousValue = tradingEngine.current.position.stopLoss.value

                            tradingEngine.current.position.takeProfit.value = formulas.get(key)

                            if (tradingEngine.current.position.takeProfit.value !== previousValue) {
                                checkAnnouncements(phase, tradingEngine.current.position.takeProfit.value)
                            }
                        }
                    }
                }

                /* Keeping Position Counters Up-to-date */
                if (
                    (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage')
                ) {
                    if (takePositionNow === true) {
                        tradingEngine.current.position.positionCounters.periods.value = 0
                    }

                    tradingEngine.current.position.positionCounters.periods.value++
                    tradingEngine.current.position.positionStatistics.days.value = tradingEngine.current.position.positionCounters.periods.value * sessionParameters.timeFrame.config.value / ONE_DAY_IN_MILISECONDS
                } else {
                    tradingEngine.current.position.positionCounters.periods.value = 0
                    tradingEngine.current.position.positionStatistics.days.value = 0
                }

                /* Keeping Distance Counters Up-to-date */
                if (
                    tradingEngine.current.distanceToEvent.triggerOn.value > 0 // with this we avoind counting before the first event happens.
                ) {
                    tradingEngine.current.distanceToEvent.triggerOn.value++
                }

                if (
                    tradingEngine.current.distanceToEvent.triggerOff.value > 0 // with this we avoind counting before the first event happens.
                ) {
                    tradingEngine.current.distanceToEvent.triggerOff.value++
                }

                if (
                    tradingEngine.current.distanceToEvent.takePosition.value > 0 // with this we avoind counting before the first event happens.
                ) {
                    tradingEngine.current.distanceToEvent.takePosition.value++
                }

                if (
                    tradingEngine.current.distanceToEvent.closePosition.value > 0 // with this we avoind counting before the first event happens.
                ) {
                    tradingEngine.current.distanceToEvent.closePosition.value++
                }

                /* Checking if Stop or Take Profit were hit */
                if (
                    (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage') &&
                    takePositionNow !== true
                ) {
                    let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]

                    /* Checking what happened since the last execution. We need to know if the Stop Loss
                        or our Take Profit were hit. */

                    /* Stop Loss condition: Here we verify if the Stop Loss was hitted or not. */

                    if ((sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset && candle.max >= tradingEngine.current.position.stopLoss.value) || (sessionParameters.sessionBaseAsset.name !== bot.market.marketBaseAsset && candle.min <= tradingEngine.current.position.stopLoss.value)) {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Stop Loss was hit.') }
                        /*
                        Hit Point Validation
 
                        This prevents misscalculations when a formula places the stop loss in this case way beyond the market price.
                        If we take the stop loss value at those situation would be a huge distortion of facts.
                        */

                        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
                            if (tradingEngine.current.position.stopLoss.value < candle.min) {
                                tradingEngine.current.position.stopLoss.value = candle.min
                            }
                        } else {
                            if (tradingEngine.current.position.stopLoss.value > candle.max) {
                                tradingEngine.current.position.stopLoss.value = candle.max
                            }
                        }

                        let slippedStopLoss = tradingEngine.current.position.stopLoss.value

                        /* Apply the Slippage */
                        let slippageAmount = slippedStopLoss * bot.VALUES_TO_USE.slippage.stopLoss / 100

                        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
                            slippedStopLoss = slippedStopLoss + slippageAmount
                        } else {
                            slippedStopLoss = slippedStopLoss - slippageAmount
                        }

                        closeRate = slippedStopLoss

                        tradingEngine.current.strategy.stageType.value = 'Close Stage'
                        checkAnnouncements(strategy.closeStage, 'Stop')

                        tradingEngine.current.position.stopLoss.stopLossStage.value = 'No Stage'
                        tradingEngine.current.position.takeProfit.takeProfitStage.value = 'No Stage'
                        tradingEngine.current.position.end.value = candle.end
                        tradingEngine.current.position.status.value = 1
                        tradingEngine.current.position.exitType.value = 1
                        tradingEngine.current.position.endRate.value = closeRate

                        closePositionNow = true
                    }

                    /* Take Profit condition: Here we verify if the Take Profit was hit or not. */

                    if ((sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset && candle.min <= tradingEngine.current.position.takeProfit.value) || (sessionParameters.sessionBaseAsset.name !== bot.market.marketBaseAsset && candle.max >= tradingEngine.current.position.takeProfit.value)) {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Take Profit was hit.') }
                        /*
                        Hit Point Validation:
 
                        This prevents misscalculations when a formula places the take profit in this case way beyond the market price.
                        If we take the stop loss value at those situation would be a huge distortion of facts.
                        */

                        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
                            if (tradingEngine.current.position.takeProfit.value > candle.max) {
                                tradingEngine.current.position.takeProfit.value = candle.max
                            }
                        } else {
                            if (tradingEngine.current.position.takeProfit.value < candle.min) {
                                tradingEngine.current.position.takeProfit.value = candle.min
                            }
                        }

                        let slippedTakeProfit = tradingEngine.current.position.takeProfit.value
                        /* Apply the Slippage */
                        let slippageAmount = slippedTakeProfit * bot.VALUES_TO_USE.slippage.takeProfit / 100

                        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
                            slippedTakeProfit = slippedTakeProfit + slippageAmount
                        } else {
                            slippedTakeProfit = slippedTakeProfit - slippageAmount
                        }

                        closeRate = slippedTakeProfit

                        tradingEngine.current.strategy.stageType.value = 'Close Stage'
                        checkAnnouncements(strategy.closeStage, 'Take Profit')

                        tradingEngine.current.position.stopLoss.stopLossStage.value = 'No Stage'
                        tradingEngine.current.position.takeProfit.takeProfitStage.value = 'No Stage'

                        tradingEngine.current.position.end.value = candle.end
                        tradingEngine.current.position.status.value = 1
                        tradingEngine.current.position.exitType.value = 2
                        tradingEngine.current.position.endRate.value = closeRate

                        closePositionNow = true
                        addToSnapshots = true
                    }
                }

                /* Taking a Position */
                if (
                    takePositionNow === true
                ) {
                    takePositionNow = false
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> takePositionNow -> Entering code block.') }

                    /* Inicializing this counter */
                    tradingEngine.current.distanceToEvent.takePosition.value = 1

                    /* Position size and rate */
                    let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]

                    tradingEngine.current.position.size.value = strategy.positionSize
                    tradingEngine.current.position.rate.value = strategy.positionRate

                    /* We take what was calculated at the formula and apply the slippage. */
                    let slippageAmount = tradingEngine.current.position.rate.value * bot.VALUES_TO_USE.slippage.positionRate / 100

                    if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
                        tradingEngine.current.position.rate.value = tradingEngine.current.position.rate.value - slippageAmount
                    } else {
                        tradingEngine.current.position.rate.value = tradingEngine.current.position.rate.value + slippageAmount
                    }

                    if (bot.startMode === 'Live') {
                        logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> Taking a Position in Live Mode.')
                        logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> strategy.positionSize = ' + strategy.positionSize)
                        logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> strategy.positionRate = ' + strategy.positionRate)
                        logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> slippageAmount = ' + slippageAmount)
                        logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> tradingEngine.current.position.rate.value = ' + tradingEngine.current.position.rate.value)
                    }

                    /* Update the trade record information. */
                    tradingEngine.current.position.begin.value = candle.begin
                    tradingEngine.current.position.beginRate.value = tradingEngine.current.position.rate.value

                    /* Check if we need to execute. */
                    if (currentCandleIndex > candles.length - 10) { /* Only at the last candles makes sense to check if we are in live mode or not. */
                        /* Check that we are in LIVE MODE */
                        if (bot.startMode === 'Live') {
                            /* We see if we need to put the actual order at the exchange. */
                            if (variable.executionContext !== undefined) {
                                switch (variable.executionContext.status) {
                                    case 'Without a Position': { // We need to put the order because It was not put yet.
                                        if (strategy.openStage !== undefined) {
                                            if (strategy.openStage.openExecution !== undefined) {
                                                putOpeningOrder()
                                                return
                                            }
                                        }
                                        break
                                    }
                                    case 'Position Closed': { // Waiting for a confirmation that the position was closed.
                                        if (strategy.openStage !== undefined) {
                                            if (strategy.openStage.openExecution !== undefined) {
                                                putOpeningOrder()
                                                return
                                            }
                                        }
                                        break
                                    }
                                    case 'Taking Position': { // Waiting for a confirmation that the position was taken.
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> takePositionNow -> Exiting code block because status is Taking Position.') }
                                        break
                                    }
                                    case 'In a Position': { // This should mean that we already put the order at the exchange.
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> takePositionNow -> Exiting code block because status is In a Position.') }
                                        break
                                    }
                                }
                            } else { // The context does not exist so it means we are not in a position.
                                if (strategy.openStage !== undefined) {
                                    if (strategy.openStage.openExecution !== undefined) {
                                        putOpeningOrder()
                                        return
                                    }
                                }
                            }
                        } else {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> takePositionNow -> Not trading live.') }
                        }
                    } else {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> takePositionNow -> Not the last closed candle.') }
                    }

                    takePositionAtSimulation()

                    return

                    function putOpeningOrder() {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> Entering function.') }

                        /* We wont take a position unless we are withing the sessionParameters.timeRange.config.initialDatetime and the sessionParameters.timeRange.config.finalDatetime range */
                        if (sessionParameters.timeRange.config.initialDatetime !== undefined) {
                            if (candle.end < sessionParameters.timeRange.config.initialDatetime.valueOf()) {
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> Not placing the trade at the exchange because current candle ends before the start date.  -> sessionParameters.timeRange.config.initialDatetime = ' + sessionParameters.timeRange.config.initialDatetime) }
                                takePositionAtSimulation()
                                return
                            }
                        }

                        /* We wont take a position if we are past the final datetime */
                        if (sessionParameters.timeRange.config.finalDatetime !== undefined) {
                            if (candle.begin > sessionParameters.timeRange.config.finalDatetime.valueOf()) {
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> putOpeningOrder -> Not placing the trade at the exchange because current candle begins after the end date. -> sessionParameters.timeRange.config.finalDatetime = ' + sessionParameters.timeRange.config.finalDatetime) }
                                takePositionAtSimulation()
                                return
                            }
                        }

                        /* Mechanism to avoid putting the same order over and over again at different executions of the simulation engine. */
                        if (variable.executionContext !== undefined) {
                            if (variable.executionContext.periods !== undefined) {
                                if (tradingEngine.episode.episodeCounters.periods <= variable.executionContext.periods) {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> Not placing the trade at the exchange because it was already placed at a previous execution.') }
                                    takePositionAtSimulation()
                                    return
                                }
                            }
                        }

                        /* We are not going to place orders based on outdated information. The next filter prevents firing orders when backtesting. */
                        if (currentDay) {
                            let today = new Date(Math.trunc((new Date().valueOf()) / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS)
                            let processDay = new Date(Math.trunc(currentDay.valueOf() / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS)
                            if (today.valueOf() !== processDay.valueOf()) {
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> Not placing the trade at the exchange because the current candle belongs to the previous day and that is considered simulation and not live trading.') }
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> today = ' + today) }
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> processDay = ' + processDay) }
                                takePositionAtSimulation()
                                return
                            }
                        }

                        let orderPrice
                        let amountA
                        let amountB
                        let orderSide

                        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
                            orderSide = 'sell'

                            orderPrice = tradingEngine.current.position.rate.value

                            amountA = tradingEngine.current.position.size.value * orderPrice
                            amountB = tradingEngine.current.position.size.value
                        } else {
                            orderSide = 'buy'

                            orderPrice = tradingEngine.current.position.rate.value

                            amountA = tradingEngine.current.position.size.value
                            amountB = tradingEngine.current.position.size.value / orderPrice
                        }

                        variable.executionContext = {
                            status: 'Taking Position',
                            periods: tradingEngine.episode.episodeCounters.periods
                        }

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> Ready to create order.') }
                        exchangeAPI.createOrder(bot.market, orderSide, orderPrice, amountA, amountB, onOrderCreated)

                        function onOrderCreated(err, order) {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> Entering function.') }

                            try {
                                switch (err.result) {
                                    case global.DEFAULT_OK_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> DEFAULT_OK_RESPONSE ') }
                                        variable.executionContext = {
                                            status: 'In a Position',
                                            periods: tradingEngine.episode.episodeCounters.periods,
                                            amountA: amountA,
                                            amountB: amountB,
                                            orderId: order.id
                                        }
                                        takePositionAtSimulation()
                                        return
                                    }
                                    case global.DEFAULT_FAIL_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> DEFAULT_FAIL_RESPONSE ') }
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[ERROR] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> Message = ' + err.message) }
                                        strategy.openStage.openExecution.error = err.message
                                        afterLoop()
                                        return
                                    }
                                    case global.DEFAULT_RETRY_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> DEFAULT_RETRY_RESPONSE ') }
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[ERROR] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> Message = ' + err.message) }
                                        strategy.openStage.openExecution.error = err.message
                                        afterLoop()
                                        return
                                    }
                                }
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[ERROR] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> Unexpected Response -> Message = ' + err.message) }
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                                return
                            } catch (err) {
                                logger.write(MODULE_NAME, '[ERROR] runSimulation  -> loop -> putOpeningOrder -> onOrderCreated ->  err = ' + err.stack)
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                                return
                            }
                        }
                    }

                    function takePositionAtSimulation() {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> takePositionAtSimulation -> Entering function.') }

                        /* Continue with the simulation */
                        calculateTakeProfit()
                        calculateStopLoss()

                        tradingEngine.previous.balance.baseAsset.value = tradingEngine.current.balance.baseAsset.value
                        tradingEngine.previous.balance.quotedAsset.value = tradingEngine.current.balance.quotedAsset.value

                        tradingEngine.last.position.profitLoss.value = 0
                        tradingEngine.last.position.ROI.value = 0

                        let feePaid = 0

                        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
                            feePaid = tradingEngine.current.position.size.value * tradingEngine.current.position.rate.value * bot.VALUES_TO_USE.feeStructure.taker / 100

                            tradingEngine.current.balance.quotedAsset.value = tradingEngine.current.balance.quotedAsset.value + tradingEngine.current.position.size.value * tradingEngine.current.position.rate.value - feePaid
                            tradingEngine.current.balance.baseAsset.value = tradingEngine.current.balance.baseAsset.value - tradingEngine.current.position.size.value
                        } else {
                            feePaid = tradingEngine.current.position.size.value / tradingEngine.current.position.rate.value * bot.VALUES_TO_USE.feeStructure.taker / 100

                            tradingEngine.current.balance.baseAsset.value = tradingEngine.current.balance.baseAsset.value + tradingEngine.current.position.size.value / tradingEngine.current.position.rate.value - feePaid
                            tradingEngine.current.balance.quotedAsset.value = tradingEngine.current.balance.quotedAsset.value - tradingEngine.current.position.size.value
                        }

                        addRecords()
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> takePositionAtSimulation -> Exiting Loop Body after taking position at simulation.') }
                        controlLoop()
                        return
                    }
                }

                if (closePositionNow === true) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Closing a Position -> Entering code block.') }

                    closePositionNow = false

                    /* Inicializing this counter */
                    tradingEngine.current.distanceToEvent.closePosition.value = 1

                    /* Position size and rate */
                    let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]

                    if (currentCandleIndex > candles.length - 10) { /* Only at the last candles makes sense to check if we are in live mode or not. */
                        /* Check that we are in LIVE MODE */
                        if (bot.startMode === 'Live') {
                            /* We see if we need to put the actual order at the exchange. */
                            if (variable.executionContext !== undefined) {
                                switch (variable.executionContext.status) {
                                    case 'Without a Position': { // No way to close anything at the exchange.
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Closing a Position -> Exiting code block because status is Without a Position.') }
                                        break
                                    }
                                    case 'In a Position': { // This should mean that we already put the order at the exchange.
                                        if (strategy.closeStage !== undefined) {
                                            if (strategy.closeStage.closeExecution !== undefined) {
                                                putClosingOrder()
                                                return
                                            }
                                        }
                                        break
                                    }
                                    case 'Closing Position': { // Waiting for a confirmation that the position was taken.
                                        if (strategy.closeStage !== undefined) {
                                            if (strategy.closeStage.closeExecution !== undefined) {
                                                putClosingOrder()
                                                return
                                            }
                                        }
                                        break
                                    }

                                    case 'Position Closed': { //
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Closing a Position -> Exiting code block because status is Position Closed.') }
                                        break
                                    }
                                }
                            }
                        }
                    } else {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Closing a Position -> Not within the last 10 candles.') }
                    }

                    closePositionAtSimulation()
                    return

                    function putClosingOrder() {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> putClosingOrder -> Entering function.') }

                        /* Mechanism to avoid putting the same order over and over again at different executions of the simulation engine. */
                        if (variable.executionContext !== undefined) {
                            if (variable.executionContext.periods !== undefined) {
                                if (tradingEngine.episode.episodeCounters.periods <= variable.executionContext.periods) {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putClosingOrder -> Exiting function because this closing was already submited at a previous execution.') }
                                    closePositionAtSimulation()
                                    return
                                }
                            }
                        }

                        let orderPrice
                        let amountA
                        let amountB
                        let orderSide

                        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
                            orderSide = 'buy'

                            orderPrice = ticker.last + 100 // This is provisional and totally arbitrary, until we have a formula on the designer that defines this stuff.

                            amountA = tradingEngine.current.balance.quotedAsset.value
                            amountB = tradingEngine.current.balance.quotedAsset.value / orderPrice
                        } else {
                            orderSide = 'sell'

                            orderPrice = ticker.last - 100 // This is provisional and totally arbitrary, until we have a formula on the designer that defines this stuff.

                            amountA = tradingEngine.current.balance.baseAsset.value * orderPrice
                            amountB = tradingEngine.current.balance.baseAsset.value
                        }

                        variable.executionContext = {
                            status: 'Closing Position',
                            periods: tradingEngine.episode.episodeCounters.periods
                        }

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putClosingOrder -> About to close position at the exchange.') }
                        exchangeAPI.createOrder(bot.market, orderSide, orderPrice, amountA, amountB, onOrderCreated)

                        function onOrderCreated(err, order) {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putClosingOrder -> onOrderCreated -> Entering function.') }

                            try {
                                switch (err.result) {
                                    case global.DEFAULT_OK_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putClosingOrder -> onOrderCreated -> DEFAULT_OK_RESPONSE ') }
                                        variable.executionContext = {
                                            status: 'Position Closed',
                                            periods: tradingEngine.episode.episodeCounters.periods,
                                            amountA: amountA,
                                            amountB: amountB,
                                            orderId: order.id
                                        }
                                        closePositionAtSimulation()
                                        return
                                    }
                                    case global.DEFAULT_FAIL_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putClosingOrder -> onOrderCreated -> DEFAULT_FAIL_RESPONSE ') }
                                        /* We will assume that the problem is temporary, and expect that it will work at the next execution. */
                                        strategy.closeStage.closeExecution.error = err.message
                                        afterLoop()
                                        return
                                    }
                                    case global.DEFAULT_RETRY_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> DEFAULT_RETRY_RESPONSE ') }
                                        strategy.closeStage.closeExecution.error = err.message
                                        afterLoop()
                                        return
                                    }
                                }
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[ERROR] runSimulation -> loop -> putClosingOrder -> onOrderCreated -> Unexpected Response -> Message = ' + err.message) }
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                                return
                            } catch (err) {
                                logger.write(MODULE_NAME, '[ERROR] runSimulation  -> loop -> putClosingOrder -> onOrderCreated ->  err = ' + err.stack)
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                                return
                            }
                        }
                    }

                    function closePositionAtSimulation() {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> closePositionAtSimulation -> Entering function.') }

                        tradingEngine.episode.positionCounters.positions.value++

                        let feePaid = 0

                        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
                            strategy.positionSize = tradingEngine.current.balance.quotedAsset.value / closeRate
                            strategy.positionRate = closeRate

                            feePaid = tradingEngine.current.balance.quotedAsset.value / closeRate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            tradingEngine.current.balance.baseAsset.value = tradingEngine.current.balance.baseAsset.value + tradingEngine.current.balance.quotedAsset.value / closeRate - feePaid
                            tradingEngine.current.balance.quotedAsset.value = 0
                        } else {
                            strategy.positionSize = tradingEngine.current.balance.baseAsset.value * closeRate
                            strategy.positionRate = closeRate

                            feePaid = tradingEngine.current.balance.baseAsset.value * closeRate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            tradingEngine.current.balance.quotedAsset.value = tradingEngine.current.balance.quotedAsset.value + tradingEngine.current.balance.baseAsset.value * closeRate - feePaid
                            tradingEngine.current.balance.baseAsset.value = 0
                        }

                        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
                            tradingEngine.last.position.profitLoss.value = tradingEngine.current.balance.baseAsset.value - tradingEngine.previous.balance.baseAsset.value
                            tradingEngine.last.position.ROI.value = tradingEngine.last.position.profitLoss.value * 100 / tradingEngine.current.position.size.value
                            if (isNaN(tradingEngine.last.position.ROI.value)) { tradingEngine.last.position.ROI.value = 0 }
                            tradingEngine.episode.episodeStatistics.profitLoss.value = tradingEngine.current.balance.baseAsset.value - sessionParameters.sessionBaseAsset.config.initialBalance
                        } else {
                            tradingEngine.last.position.profitLoss.value = tradingEngine.current.balance.quotedAsset.value - tradingEngine.previous.balance.quotedAsset.value
                            tradingEngine.last.position.ROI.value = tradingEngine.last.position.profitLoss.value * 100 / tradingEngine.current.position.size.value
                            if (isNaN(tradingEngine.last.position.ROI.value)) { tradingEngine.last.position.ROI.value = 0 }
                            tradingEngine.episode.episodeStatistics.profitLoss.value = tradingEngine.current.balance.quotedAsset.value - sessionParameters.sessionQuotedAsset.config.initialBalance
                        }

                        tradingEngine.current.position.positionStatistics.ROI.value = tradingEngine.last.position.ROI.value

                        if (tradingEngine.last.position.profitLoss.value > 0) {
                            tradingEngine.episode.episodeCounters.hits.value++
                        } else {
                            tradingEngine.episode.episodeCounters.fails.value++
                        }

                        if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
                            tradingEngine.episode.episodeStatistics.ROI.value = (sessionParameters.sessionBaseAsset.config.initialBalance + tradingEngine.episode.episodeStatistics.profitLoss.value) / sessionParameters.sessionBaseAsset.config.initialBalance - 1
                            tradingEngine.episode.episodeStatistics.hitRatio.value = tradingEngine.episode.episodeCounters.hits.value / tradingEngine.episode.positionCounters.positions.value
                            tradingEngine.episode.episodeStatistics.anualizedRateOfReturn.value = tradingEngine.episode.episodeStatistics.ROI.value / tradingEngine.episode.episodeStatistics.days * 365
                        } else {
                            tradingEngine.episode.episodeStatistics.ROI.value = (sessionParameters.sessionQuotedAsset.config.initialBalance + tradingEngine.episode.episodeStatistics.profitLoss.value) / sessionParameters.sessionQuotedAsset.config.initialBalance - 1
                            tradingEngine.episode.episodeStatistics.hitRatio.value = tradingEngine.episode.episodeCounters.hits.value / tradingEngine.episode.positionCounters.positions.value
                            tradingEngine.episode.episodeStatistics.anualizedRateOfReturn.value = tradingEngine.episode.episodeStatistics.ROI.value / tradingEngine.episode.episodeStatistics.days * 365
                        }

                        addRecords()

                        tradingEngine.current.position.stopLoss.value = 0
                        tradingEngine.current.position.takeProfit.value = 0

                        tradingEngine.current.position.rate.value = 0
                        tradingEngine.current.position.size.value = 0

                        timerToCloseStage = candle.begin
                        tradingEngine.current.position.stopLoss.stopLossStage.value = 'No Stage'
                        tradingEngine.current.position.takeProfit.takeProfitStage.value = 'No Stage'
                        tradingEngine.current.position.stopLoss.stopLossPhase.value = -1
                        tradingEngine.current.position.takeProfit.takeProfitPhase.value = -1

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> closePositionAtSimulation -> Exiting Loop Body after closing position at simulation.') }
                        controlLoop()
                        return
                    }
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

                /* Not a buy or sell condition */

                addRecords()
                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Exiting Loop Body after adding a record.') }
                controlLoop()
                return

                function addRecords() {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> addRecords -> Entering function.') }

                    manageSnapshots()
                    addSimulationRecord()
                    addConditionsRecord()
                    addStrategyRecord()
                    addPositionRecord()

                    /* We will remmember the last candle processed, so that if it is the last one of this run we can use it to continue from there next time. */
                    tradingEngine.last.candle.begin = candle.begin
                    tradingEngine.last.candle.end = candle.end

                    /* After everything at the simulation level was done, we will do the annoucements that are pending. */
                    makeAnnoucements()

                    function manageSnapshots() {
                        /* Snapshots Management (before we generate the trade record and delete that info) */
                        if (saveAsLastTriggerOnSnapshot === true) {
                            snapshots.lastTriggerOn = snapshotDataRecord
                            saveAsLastTriggerOnSnapshot = false
                        }

                        if (saveAsLastTakePositionSnapshot === true) {
                            snapshots.lastTakePosition = snapshotDataRecord
                            saveAsLastTakePositionSnapshot = false
                        }

                        if (addToSnapshots === true) {
                            let closeValues = [
                                tradingEngine.episode.positionCounters.positions.value,                                   // Position Number
                                (new Date(candle.begin)).toISOString(),                             // Datetime
                                tradingSystem.strategies[tradingEngine.current.strategy.index.value].name,     // Strategy Name
                                tradingEngine.current.strategy.situationName.value,                            // Trigger On Situation
                                tradingEngine.current.position.situationName.value,                            // Take Position Situation
                                hitOrFial(),                                                        // Result
                                tradingEngine.last.position.ROI.value,                                         // ROI
                                exitType()                                                          // Exit Type
                            ]

                            function hitOrFial() {
                                if (tradingEngine.last.position.ROI.value > 0) { return 'HIT' } else { return 'FAIL' }
                            }

                            function exitType() {
                                switch (tradingEngine.current.position.exitType.value) {
                                    case 1: return 'Stop'
                                    case 2: return 'Take Profit'
                                }
                            }


                            if (positionedAtYesterday === false) {
                                snapshots.triggerOn.push(closeValues.concat(snapshots.lastTriggerOn))
                                snapshots.takePosition.push(closeValues.concat(snapshots.lastTakePosition))
                            }
                            snapshots.lastTriggerOn = undefined
                            snapshots.lastTakePosition = undefined
                            addToSnapshots = false
                        }

                        let closeHeaders = ['Trade Number', 'Close Datetime', 'Strategy', 'Trigger On Situation', 'Take Position Situation', 'Result', 'ROI', 'Exit Type']
                        if (snapshots.headers === undefined) {
                            snapshots.headers = closeHeaders.concat(JSON.parse(JSON.stringify(snapshotLoopHeaders)))
                        }
                    }

                    function addSimulationRecord() {
                        /* Simulation Record */
                        let simulationRecord

                        if (tradingEngine.current.balance.baseAsset.value === Infinity) {
                            tradingEngine.current.balance.baseAsset.value = Number.MAX_SAFE_INTEGER
                        }

                        if (tradingEngine.current.balance.quotedAsset.value === Infinity) {
                            tradingEngine.current.balance.quotedAsset.value = Number.MAX_SAFE_INTEGER
                        }

                        simulationRecord = [
                            candle.begin,
                            candle.end,
                            tradingEngine.current.balance.baseAsset.value,
                            tradingEngine.current.balance.quotedAsset.value,
                            tradingEngine.episode.episodeStatistics.profitLoss.value,
                            tradingEngine.last.position.profitLoss.value,
                            tradingEngine.current.position.stopLoss.value,
                            tradingEngine.episode.positionCounters.positions.value,
                            tradingEngine.episode.episodeCounters.hits.value,
                            tradingEngine.episode.episodeCounters.fails.value,
                            tradingEngine.episode.episodeStatistics.hitRatio.value,
                            tradingEngine.episode.episodeStatistics.ROI.value,
                            tradingEngine.episode.episodeCounters.periods,
                            tradingEngine.episode.episodeStatistics.days,
                            tradingEngine.episode.episodeStatistics.anualizedRateOfReturn.value,
                            tradingEngine.current.position.rate.value,
                            tradingEngine.last.position.ROI.value,
                            tradingEngine.current.position.takeProfit.value,
                            tradingEngine.current.position.stopLoss.stopLossPhase.value,
                            tradingEngine.current.position.takeProfit.takeProfitPhase.value,
                            tradingEngine.current.position.size.value,
                            sessionParameters.sessionBaseAsset.config.initialBalance,
                            sessionParameters.sessionBaseAsset.config.minimumBalance,
                            sessionParameters.sessionBaseAsset.config.maximumBalance,
                            sessionParameters.sessionQuotedAsset.config.initialBalance,
                            sessionParameters.sessionQuotedAsset.config.minimumBalance,
                            sessionParameters.sessionQuotedAsset.config.maximumBalance,
                            '"' + sessionParameters.sessionBaseAsset.name + '"',
                            '"' + sessionParameters.sessionQuotedAsset.name + '"',
                            '"' + bot.market.marketBaseAsset + '"',
                            '"' + bot.market.marketQuotedAsset + '"',
                            tradingEngine.current.position.positionCounters.periods.value,
                            tradingEngine.current.position.positionStatistics.days.value
                        ]

                        recordsArray.push(simulationRecord)
                    }

                    function addConditionsRecord() {
                        /* Prepare the information for the Conditions File */
                        let conditionsRecord = [
                            candle.begin,
                            candle.end,
                            tradingEngine.current.strategy.index.value,
                            tradingEngine.current.position.stopLoss.stopLossPhase.value,
                            tradingEngine.current.position.takeProfit.takeProfitPhase.value,
                            conditionsValues,
                            formulasErrors,
                            formulasValues
                        ]

                        conditionsArray.push(conditionsRecord)
                    }

                    function addStrategyRecord() {
                        /*
                        Lets see if there will be an open strategy ...
                        Except if we are at the head of the market (remember we skipped the last candle for not being closed.)
                        */
                        if (tradingEngine.current.strategy.begin.value !== 0 && tradingEngine.current.strategy.end.value === 0 && currentCandleIndex === candles.length - 2 && lastCandle.end !== lastInstantOfTheDay) {
                            tradingEngine.current.strategy.status.value = 'Open'
                            tradingEngine.current.strategy.end.value = candle.end
                        }

                        /* Prepare the information for the Strategies File */
                        if (tradingEngine.current.strategy.begin.value !== 0 && tradingEngine.current.strategy.end.value !== 0) {
                            let strategyRecord = [
                                tradingEngine.current.strategy.begin.value,
                                tradingEngine.current.strategy.end.value,
                                tradingEngine.current.strategy.status.value,
                                tradingEngine.current.strategy.index.value,
                                tradingEngine.current.strategy.beginRate.value,
                                tradingEngine.current.strategy.endRate.value,
                                '"' + tradingEngine.current.strategy.situationName.value + '"',
                                '"' + tradingEngine.current.strategy.strategyName.value + '"'
                            ]

                            strategiesArray.push(strategyRecord)

                            inializeCurrentStrategy()
                        }
                    }

                    function addPositionRecord() {
                        /*
                        Lets see if there will be an open trade ...
                        Except if we are at the head of the market (remember we skipped the last candle for not being closed.)
                        */
                        if (tradingEngine.current.position.begin.value !== 0 &&
                            tradingEngine.current.position.end.value === 0 &&
                            currentCandleIndex === candles.length - 2 &&
                            lastCandle.end !== lastInstantOfTheDay) {

                            /* This means the trade is open */
                            tradingEngine.current.position.status.value = 2
                            tradingEngine.current.position.end.value = candle.end
                            tradingEngine.current.position.endRate.value = candle.close

                            /* Here we will calculate the ongoing ROI */
                            if (sessionParameters.sessionBaseAsset.name === bot.market.marketBaseAsset) {
                                tradingEngine.current.position.positionStatistics.ROI.value = (tradingEngine.current.position.rate.value - candle.close) / tradingEngine.current.position.rate.value * 100
                            } else {
                                tradingEngine.current.position.positionStatistics.ROI.value = (candle.close - tradingEngine.current.position.rate.value) / tradingEngine.current.position.rate.value * 100
                            }
                        }

                        /* Prepare the information for the Positions File */
                        if (tradingEngine.current.position.begin.value !== 0 && tradingEngine.current.position.end.value !== 0) {
                            let positionRecord = [
                                tradingEngine.current.position.begin.value,
                                tradingEngine.current.position.end.value,
                                tradingEngine.current.position.status.value,
                                tradingEngine.current.position.positionStatistics.ROI.value,
                                tradingEngine.current.position.beginRate.value,
                                tradingEngine.current.position.endRate.value,
                                tradingEngine.current.position.exitType.value,
                                '"' + tradingEngine.current.position.situationName.value + '"'
                            ]

                            positionsArray.push(positionRecord)

                            initializeCurrentPosition()
                        }
                    }
                }

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

                /*
                Before returning we need to see if we have to record some of our counters at the variable.
                To do that, the condition to be met is that this execution must include all candles of the current day.
                */

                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> callback -> recordsArray.length = ' + recordsArray.length) }

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

