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

            if (variable.isInitialized !== true || bot.RESUME === false) {
                variable.isInitialized = true

                variable.episode = {}                       // An Episode represents each execution of the Simulation
                variable.episode.count = {}                 // Everything in here means the total count since the begining of the episode.
                variable.episode.stat = {}                  // Everything in here means the statistics calculated since the begining of the episode.

                variable.current = {}                       // Everything in here means that is happening right now.
                variable.current.balance = {}               // Balances at the current candle of the Simulation.
                variable.current.distance = {}              // Everything in here means the distance, measured in periods to whatever happened in the past, usually events.
                variable.current.distance.toEvent = {}      // Distance to Events that already happened.
                variable.current.strategy = {}              // Everything in here are variables related to the current strategy being executed.
                variable.current.position = {}              // Everything in here are variables related to the current position being executed.

                variable.current.balance.baseAsset = bot.VALUES_TO_USE.initialBalanceA
                variable.current.balance.quotedAsset = bot.VALUES_TO_USE.initialBalanceB
                variable.current.distance.toEvent.triggerOn = 0
                variable.current.distance.toEvent.triggerOff = 0
                variable.current.distance.toEvent.takePosition = 0
                variable.current.distance.toEvent.closePosition = 0

                variable.last = {}                          // Everything in here means that it already happened.
                variable.last.position = {}                 // Las values of variables at the last position.

                variable.last.position.profitLoss = 0
                variable.last.position.ROI = 0

                variable.previous = {}                      // Everything in here means the the value that was current before a new current value was set.
                variable.previous.balance = {}              // Balances values previous to the current ones.

                variable.previous.balance.baseAsset = 0
                variable.previous.balance.quotedAsset = 0

                variable.episode.parameters = {}            // Parameters give you access to information received by the Simulation as parameters.
                variable.episode.parameters.initial = {}    // Everything in here means the status at the begining of the episode received as a parameter of the Sumulation.
                variable.episode.parameters.minimum = {}    // Everything in here means the minimum in the whole episode received as a parameter of the Sumulation.
                variable.episode.parameters.maximum = {}    // Everything in here means the maximum in the whole episode received as a parameter of the Sumulation.
                variable.episode.parameters.initial.balance = {}
                variable.episode.parameters.minimum.balance = {}
                variable.episode.parameters.maximum.balance = {}

                variable.episode.parameters.baseAsset = bot.VALUES_TO_USE.baseAsset
                variable.episode.parameters.quotedAsset = bot.VALUES_TO_USE.quotedAsset
                variable.episode.parameters.marketBaseAsset = bot.market.baseAsset
                variable.episode.parameters.marketQuotedAsset = bot.market.quotedAsset
                variable.episode.parameters.timeFrame = timeFrame               // The numeric value of the time frame, in milliseconds
                variable.episode.parameters.timeFrameLabel = timeFrameLabel     // The alpha-numeric value of the time frame

                variable.episode.parameters.initial.balance.baseAsset = bot.VALUES_TO_USE.initialBalanceA
                variable.episode.parameters.minimum.balance.baseAsset = bot.VALUES_TO_USE.minimumBalanceA
                variable.episode.parameters.maximum.balance.baseAsset = bot.VALUES_TO_USE.maximumBalanceA

                variable.episode.parameters.initial.balance.quotedAsset = bot.VALUES_TO_USE.initialBalanceB
                variable.episode.parameters.minimum.balance.quotedAsset = bot.VALUES_TO_USE.minimumBalanceB
                variable.episode.parameters.maximum.balance.quotedAsset = bot.VALUES_TO_USE.maximumBalanceB

                variable.episode.count.positions = 0
                variable.episode.count.fails = 0
                variable.episode.count.hits = 0
                variable.episode.count.periods = 0

                variable.episode.stat.profitLoss = 0
                variable.episode.stat.hitRatio = 0
                variable.episode.stat.days = 0
                variable.episode.stat.ROI = 0
                variable.episode.stat.anualizedRateOfReturn = 0

                inializeCurrentStrategy()
                initializeCurrentPosition()

                variable.announcements = []
            }

            function inializeCurrentStrategy() {

                variable.current.strategy.name = ''
                variable.current.strategy.index = -1
                variable.current.strategy.stage = 'No Stage'
                variable.current.strategy.begin = 0
                variable.current.strategy.end = 0
                variable.current.strategy.status = 0
                variable.current.strategy.number = 0
                variable.current.strategy.beginRate = 0
                variable.current.strategy.endRate = 0
                variable.current.strategy.situationName = ''

            }

            function initializeCurrentPosition() {

                variable.current.position.begin = 0
                variable.current.position.end = 0
                variable.current.position.rate = 0
                variable.current.position.size = 0
                variable.current.position.status = 0
                variable.current.position.exitType = 0
                variable.current.position.beginRate = 0
                variable.current.position.endRate = 0
                variable.current.position.situationName = ''

                variable.current.position.stat = {}
                variable.current.position.stat.ROI = 0
                variable.current.position.stat.days = 0

                variable.current.position.count = {}
                variable.current.position.count.periods = 0

                variable.current.position.stopLoss = {}
                variable.current.position.stopLoss.value = 0
                variable.current.position.stopLoss.phase = -1
                variable.current.position.stopLoss.stage = 'No Stage'

                variable.current.position.takeProfit = {}
                variable.current.position.takeProfit.value = 0
                variable.current.position.takeProfit.phase = -1
                variable.current.position.takeProfit.stage = 'No Stage'

            }

            /* Main Array and Maps */
            let propertyName = 'at' + variable.episode.parameters.timeFrameLabel.replace('-', '')
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

                if (bot.RESUME === true && variable.last.candle !== undefined) {
                    /* Estimate the Initial Candle based on the last candle saved at variable */
                    let firstBegin = candles[0].begin
                    let lastBegin = variable.last.candle.begin
                    let diff = lastBegin - firstBegin
                    let amount = diff / variable.episode.parameters.timeFrame

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
                    let amount = diff / variable.episode.parameters.timeFrame

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

                variable.episode.count.periods++
                variable.episode.stat.days = variable.episode.count.periods * variable.episode.parameters.timeFrame / ONE_DAY_IN_MILISECONDS

                if (processingDailyFiles) {
                    /* We skip the candle at the head of the market because currentCandleIndex has not closed yet. */
                    let candlesPerDay = ONE_DAY_IN_MILISECONDS / variable.episode.parameters.timeFrame
                    if (currentCandleIndex === candles.length - 1) {
                        if ((candles.length < candlesPerDay) || (candles.length > candlesPerDay && candles.length < candlesPerDay * 2)) {
                            /* We are at the head of the market, thus we skip the last candle because it has not close yet. */
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Skipping Candle because it is the last one and has not been closed yet.') }
                            controlLoop()
                            return
                            /* Note here that in the last candle of the first day or the second day it will use an incomplete candle and partially calculated indicators.
                                if we skip these two variable.episode.count.periods, then there will be a hole in the file since the last period will be missing. */
                        }
                    }
                } else { // We are processing Market Files
                    if (currentCandleIndex === candles.length - 1) {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Skipping Candle because it is the last one and has not been closed yet.') }
                        controlLoop()
                        return
                    }
                }

                let conditions = new Map()       // Here we store the conditions values that will be use in the simulator for decision making.
                let formulas = new Map()
                let conditionsValues = [] // Here we store the conditions values that will be written on file for the plotter.
                let formulasErrors = [] // Here we store the errors produced by all phase formulas.
                let formulasValues = [] // Here we store the values produced by all phase formulas.

                /* We define and evaluate all conditions to be used later during the simulation loop. */
                for (let j = 0; j < tradingSystem.strategies.length; j++) {
                    let strategy = tradingSystem.strategies[j]

                    let positionSize = 0
                    let positionRate = 0

                    /* Continue with the rest of the formulas and conditions */

                    let triggerStage = strategy.triggerStage

                    if (triggerStage !== undefined) {
                        if (triggerStage.triggerOn !== undefined) {
                            for (let k = 0; k < triggerStage.triggerOn.situations.length; k++) {
                                let situation = triggerStage.triggerOn.situations[k]

                                for (let m = 0; m < situation.conditions.length; m++) {
                                    let condition = situation.conditions[m]
                                    let key = j + '-' + 'triggerStage' + '-' + 'triggerOn' + '-' + k + '-' + m

                                    if (condition.javascriptCode !== undefined) {
                                        newCondition(key, condition.javascriptCode, chart)
                                    }
                                }
                            }
                        }

                        if (triggerStage.triggerOff !== undefined) {
                            for (let k = 0; k < triggerStage.triggerOff.situations.length; k++) {
                                let situation = triggerStage.triggerOff.situations[k]

                                for (let m = 0; m < situation.conditions.length; m++) {
                                    let condition = situation.conditions[m]
                                    let key = j + '-' + 'triggerStage' + '-' + 'triggerOff' + '-' + k + '-' + m

                                    if (condition.javascriptCode !== undefined) {
                                        newCondition(key, condition.javascriptCode, chart)
                                    }
                                }
                            }
                        }

                        if (triggerStage.takePosition !== undefined) {
                            for (let k = 0; k < triggerStage.takePosition.situations.length; k++) {
                                let situation = triggerStage.takePosition.situations[k]

                                for (let m = 0; m < situation.conditions.length; m++) {
                                    let condition = situation.conditions[m]
                                    let key = j + '-' + 'triggerStage' + '-' + 'takePosition' + '-' + k + '-' + m

                                    if (condition.javascriptCode !== undefined) {
                                        newCondition(key, condition.javascriptCode, chart)
                                    }
                                }
                            }
                        }
                    }

                    let openStage = strategy.openStage

                    if (openStage !== undefined) {
                        /* Default Values */
                        if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                            positionSize = variable.current.balance.baseAsset
                            positionRate = candle.close
                        } else {
                            positionSize = variable.current.balance.quotedAsset
                            positionRate = candle.close
                        }

                        let initialDefinition = openStage.initialDefinition

                        if (initialDefinition !== undefined) {
                            if (variable.current.position.size !== 0) {
                                positionSize = variable.current.position.size
                            } else {
                                if (initialDefinition.positionSize !== undefined) {
                                    if (initialDefinition.positionSize.formula !== undefined) {
                                        try {
                                            let code = initialDefinition.positionSize.formula.code
                                            positionSize = eval(code)
                                            addCodeToSnapshot(code)
                                        } catch (err) {
                                            initialDefinition.positionSize.formula.error = err.message
                                        }
                                        if (isNaN(positionSize)) {
                                            if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                                                positionSize = variable.current.balance.baseAsset
                                            } else {
                                                positionSize = variable.current.balance.quotedAsset
                                            }
                                        } else {
                                            if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                                                if (positionSize > variable.current.balance.baseAsset) { positionSize = variable.current.balance.baseAsset }
                                            } else {
                                                if (positionSize > variable.current.balance.quotedAsset) { positionSize = variable.current.balance.quotedAsset }
                                            }
                                        }
                                    }
                                }
                            }

                            if (variable.current.position.rate !== 0) {
                                positionRate = variable.current.position.rate
                            } else {
                                if (initialDefinition.positionRate !== undefined) {
                                    if (initialDefinition.positionRate.formula !== undefined) {
                                        try {
                                            let code = initialDefinition.positionRate.formula.code
                                            positionRate = eval(initialDefinition.positionRate.formula.code)
                                            addCodeToSnapshot(code)
                                        } catch (err) {
                                            initialDefinition.positionRate.formula.error = err.message
                                        }
                                        if (isNaN(positionRate)) {
                                            if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                                                positionRate = candle.close
                                            } else {
                                                positionRate = candle.close
                                            }
                                        }
                                    }
                                }
                            }

                            if (initialDefinition.stopLoss !== undefined) {
                                for (let p = 0; p < initialDefinition.stopLoss.phases.length; p++) {
                                    let phase = initialDefinition.stopLoss.phases[p]

                                    /* Evaluate Formula */
                                    let formulaValue
                                    let formulaError = ''

                                    if (phase.formula !== undefined) {
                                        try {
                                            let code = phase.formula.code
                                            formulaValue = eval(code)
                                            addCodeToSnapshot(code)
                                            if (formulaValue === Infinity) {
                                                formulaError = 'Formula evaluates to Infinity.'
                                                formulaValue = MAX_STOP_LOSS_VALUE
                                                if (variable.current.position.stopLoss.stage === 'Open Stage') {
                                                    formulaError = 'WARNING: Formula evaluates to Infinity.'
                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[WARN] runSimulation -> loop -> initialDefinition.stopLoss -> MAX_STOP_LOSS_VALUE -> formulaError = ' + formulaError) }
                                                }
                                            }
                                        } catch (err) {
                                            if (phase.formula.code.indexOf('previous') > 0 && err.message.indexOf('of undefined') > 0) {
                                                /*
                                                    We are not going to set an error for the casess we are using previous and the error is that the indicator is undefined.
                                                */
                                            } else {
                                                formulaError = err.message
                                            }
                                        }
                                        if (isNaN(formulaValue)) { formulaValue = 0 }
                                        if (formulaValue < MIN_STOP_LOSS_VALUE) {
                                            formulaValue = MIN_STOP_LOSS_VALUE
                                            if (variable.current.position.stopLoss.stage === 'Open Stage') {
                                                formulaError = 'WARNING: Formula is evaluating below the MIN_STOP_LOSS_VALUE.'
                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[WARN] runSimulation -> loop -> initialDefinition.stopLoss -> MIN_STOP_LOSS_VALUE -> formulaError = ' + formulaError) }
                                            }
                                        }

                                        formulasErrors.push('"' + formulaError + '"')
                                        formulasValues.push(formulaValue)
                                        let key = j + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'stopLoss' + '-' + p
                                        formulas.set(key, formulaValue)
                                    }

                                    /* next phase event */
                                    let nextPhaseEvent = phase.nextPhaseEvent
                                    if (nextPhaseEvent !== undefined) {

                                        for (let k = 0; k < nextPhaseEvent.situations.length; k++) {

                                            let situation = nextPhaseEvent.situations[k]

                                            for (let m = 0; m < situation.conditions.length; m++) {

                                                let condition = situation.conditions[m]
                                                let key = j + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'stopLoss' + '-' + p + '-' + k + '-' + m

                                                if (condition.javascriptCode !== undefined) {
                                                    newCondition(key, condition.javascriptCode, chart)
                                                }
                                            }
                                        }
                                    }

                                    /* move to phase events */
                                    for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                                        let moveToPhaseEvent = phase.moveToPhaseEvents[n]
                                        if (moveToPhaseEvent !== undefined) {

                                            for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {

                                                let situation = moveToPhaseEvent.situations[k]

                                                for (let m = 0; m < situation.conditions.length; m++) {

                                                    let condition = situation.conditions[m]
                                                    let key = j + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'stopLoss' + '-' + p + '-' + n + '-' + k + '-' + m

                                                    if (condition.javascriptCode !== undefined) {
                                                        newCondition(key, condition.javascriptCode, chart)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            if (initialDefinition.takeProfit !== undefined) {
                                for (let p = 0; p < initialDefinition.takeProfit.phases.length; p++) {
                                    let phase = initialDefinition.takeProfit.phases[p]

                                    /* Evaluate Formula */
                                    let formulaValue
                                    let formulaError = ''

                                    if (phase.formula !== undefined) {
                                        try {
                                            let code = phase.formula.code
                                            formulaValue = eval(code)
                                            addCodeToSnapshot(code)
                                            if (formulaValue === Infinity) {
                                                formulaValue = MAX_TAKE_PROFIT_VALUE
                                                if (variable.current.position.takeProfit.stage === 'Open Stage') {
                                                    formulaError = 'WARNING: Formula evaluates to Infinity.'
                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[WARN] runSimulation -> loop -> initialDefinition.takeProfit -> MAX_TAKE_PROFIT_VALUE -> formulaError = ' + formulaError) }
                                                }
                                            }
                                        } catch (err) {
                                            if (phase.formula.code.indexOf('previous') > 0 && err.message.indexOf('of undefined') > 0) {
                                                /*
                                                    We are not going to set an error for the casess we are using previous and the error is that the indicator is undefined.
                                                */
                                            } else {
                                                formulaError = err.message
                                            }
                                        }
                                        if (isNaN(formulaValue)) { formulaValue = 0 }
                                        if (formulaValue < MIN_TAKE_PROFIT_VALUE) {
                                            formulaValue = MIN_TAKE_PROFIT_VALUE
                                            if (variable.current.position.takeProfit.stage === 'Open Stage') {
                                                formulaError = 'WARNING: Formula is evaluating below the MIN_TAKE_PROFIT_VALUE.'
                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[WARN] runSimulation -> loop -> initialDefinition.takeProfit -> MIN_TAKE_PROFIT_VALUE -> formulaError = ' + formulaError) }
                                            }
                                        }

                                        formulasErrors.push('"' + formulaError + '"')
                                        formulasValues.push(formulaValue)
                                        let key = j + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'takeProfit' + '-' + p
                                        formulas.set(key, formulaValue)
                                    }

                                    /* next phase event */
                                    let nextPhaseEvent = phase.nextPhaseEvent
                                    if (nextPhaseEvent !== undefined) {

                                        for (let k = 0; k < nextPhaseEvent.situations.length; k++) {

                                            let situation = nextPhaseEvent.situations[k]

                                            for (let m = 0; m < situation.conditions.length; m++) {

                                                let condition = situation.conditions[m]
                                                let key = j + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'takeProfit' + '-' + p + '-' + k + '-' + m

                                                if (condition.javascriptCode !== undefined) {
                                                    newCondition(key, condition.javascriptCode, chart)
                                                }
                                            }
                                        }
                                    }

                                    /* move to phase events */
                                    for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                                        let moveToPhaseEvent = phase.moveToPhaseEvents[n]
                                        if (moveToPhaseEvent !== undefined) {

                                            for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {

                                                let situation = moveToPhaseEvent.situations[k]

                                                for (let m = 0; m < situation.conditions.length; m++) {

                                                    let condition = situation.conditions[m]
                                                    let key = j + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'takeProfit' + '-' + p + '-' + n + '-' + k + '-' + m

                                                    if (condition.javascriptCode !== undefined) {
                                                        newCondition(key, condition.javascriptCode, chart)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        strategy.positionSize = positionSize
                        strategy.positionRate = positionRate
                    }

                    let manageStage = strategy.manageStage

                    if (manageStage !== undefined) {
                        if (manageStage.stopLoss !== undefined) {
                            for (let p = 0; p < manageStage.stopLoss.phases.length; p++) {
                                let phase = manageStage.stopLoss.phases[p]

                                /* Evaluate Formula */
                                let formulaValue
                                let formulaError = ''

                                if (phase.formula !== undefined) {
                                    try {
                                        let code = phase.formula.code
                                        formulaValue = eval(code)
                                        addCodeToSnapshot(code)
                                        if (formulaValue === Infinity) {
                                            formulaError = ''
                                            formulaValue = MAX_STOP_LOSS_VALUE
                                            if (variable.current.position.stopLoss.stage === 'Manage Stage') {
                                                formulaError = 'WARNING: Formula evaluates to Infinity.'
                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[WARN] runSimulation -> loop -> manageStage.stopLoss -> MAX_STOP_LOSS_VALUE -> formulaError = ' + formulaError) }
                                            }
                                        }
                                    } catch (err) {
                                        if (phase.formula.code.indexOf('previous') > 0 && err.message.indexOf('of undefined') > 0) {
                                            /*
                                                We are not going to set an error for the casess we are using previous and the error is that the indicator is undefined.
                                            */
                                        } else {
                                            formulaError = err.message
                                        }
                                    }
                                    if (isNaN(formulaValue)) { formulaValue = 0 }
                                    if (formulaValue < MIN_STOP_LOSS_VALUE) {
                                        formulaValue = MIN_STOP_LOSS_VALUE
                                        if (variable.current.position.stopLoss.stage === 'Manage Stage') {
                                            formulaError = 'WARNING: Formula is evaluating below the MIN_STOP_LOSS_VALUE.'
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[WARN] runSimulation -> loop -> manageStage.stopLoss -> MIN_STOP_LOSS_VALUE -> formulaError = ' + formulaError) }
                                        }
                                    }

                                    formulasErrors.push('"' + formulaError + '"')
                                    formulasValues.push(formulaValue)
                                    let key = j + '-' + 'manageStage' + '-' + 'stopLoss' + '-' + p
                                    formulas.set(key, formulaValue)
                                }

                                /* next phase event */
                                let nextPhaseEvent = phase.nextPhaseEvent
                                if (nextPhaseEvent !== undefined) {
                                    for (let k = 0; k < nextPhaseEvent.situations.length; k++) {

                                        let situation = nextPhaseEvent.situations[k]

                                        for (let m = 0; m < situation.conditions.length; m++) {

                                            let condition = situation.conditions[m]
                                            let key = j + '-' + 'manageStage' + '-' + 'stopLoss' + '-' + p + '-' + k + '-' + m

                                            if (condition.javascriptCode !== undefined) {
                                                newCondition(key, condition.javascriptCode, chart)
                                            }
                                        }
                                    }
                                }

                                /* move to phase events */
                                for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                                    let moveToPhaseEvent = phase.moveToPhaseEvents[n]
                                    if (moveToPhaseEvent !== undefined) {

                                        for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {

                                            let situation = moveToPhaseEvent.situations[k]

                                            for (let m = 0; m < situation.conditions.length; m++) {

                                                let condition = situation.conditions[m]
                                                let key = j + '-' + 'manageStage' + '-' + 'stopLoss' + '-' + p + '-' + n + '-' + k + '-' + m

                                                if (condition.javascriptCode !== undefined) {
                                                    newCondition(key, condition.javascriptCode, chart)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if (manageStage.takeProfit !== undefined) {
                            for (let p = 0; p < manageStage.takeProfit.phases.length; p++) {
                                let phase = manageStage.takeProfit.phases[p]

                                /* Evaluate Formula */
                                let formulaValue
                                let formulaError = ''

                                if (phase.formula !== undefined) {
                                    try {
                                        let code = phase.formula.code
                                        formulaValue = eval(code)
                                        addCodeToSnapshot(code)
                                        if (formulaValue === Infinity) {
                                            formulaError = 'Formula evaluates to Infinity.'
                                            formulaValue = MAX_TAKE_PROFIT_VALUE
                                            if (variable.current.position.takeProfit.stage === 'Manage Stage') {
                                                formulaError = 'WARNING: Formula evaluates to Infinity.'
                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[WARN] runSimulation -> loop -> manageStage.takeProfit -> MAX_TAKE_PROFIT_VALUE -> formulaError = ' + formulaError) }
                                            }
                                        }
                                    } catch (err) {
                                        if (phase.formula.code.indexOf('previous') > 0 && err.message.indexOf('of undefined') > 0) {
                                            /*
                                                We are not going to set an error for the casess we are using previous and the error is that the indicator is undefined.
                                            */
                                        } else {
                                            formulaError = err.message
                                        }
                                    }
                                    if (isNaN(formulaValue)) { formulaValue = 0 }
                                    if (formulaValue < MIN_TAKE_PROFIT_VALUE) {
                                        formulaValue = MIN_TAKE_PROFIT_VALUE
                                        if (variable.current.position.takeProfit.stage === 'Manage Stage') {
                                            formulaError = 'WARNING: Formula is evaluating below the MIN_TAKE_PROFIT_VALUE.'
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[WARN] runSimulation -> loop -> manageStage.takeProfit -> MIN_TAKE_PROFIT_VALUE -> formulaError = ' + formulaError) }
                                        }
                                    }

                                    formulasErrors.push('"' + formulaError + '"')
                                    formulasValues.push(formulaValue)
                                    let key = j + '-' + 'manageStage' + '-' + 'takeProfit' + '-' + p
                                    formulas.set(key, formulaValue)
                                }

                                /* next phase event */
                                let nextPhaseEvent = phase.nextPhaseEvent
                                if (nextPhaseEvent !== undefined) {
                                    for (let k = 0; k < nextPhaseEvent.situations.length; k++) {

                                        let situation = nextPhaseEvent.situations[k]

                                        for (let m = 0; m < situation.conditions.length; m++) {

                                            let condition = situation.conditions[m]
                                            let key = j + '-' + 'manageStage' + '-' + 'takeProfit' + '-' + p + '-' + k + '-' + m

                                            if (condition.javascriptCode !== undefined) {
                                                newCondition(key, condition.javascriptCode, chart)
                                            }
                                        }
                                    }
                                }

                                /* move to phase events */
                                for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                                    let moveToPhaseEvent = phase.moveToPhaseEvents[n]
                                    if (moveToPhaseEvent !== undefined) {

                                        for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {

                                            let situation = moveToPhaseEvent.situations[k]

                                            for (let m = 0; m < situation.conditions.length; m++) {

                                                let condition = situation.conditions[m]
                                                let key = j + '-' + 'manageStage' + '-' + 'takeProfit' + '-' + p + '-' + n + '-' + k + '-' + m

                                                if (condition.javascriptCode !== undefined) {
                                                    newCondition(key, condition.javascriptCode, chart)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    function newCondition(key, node, chart) {
                        let condition
                        let value

                        try {
                            let code = node.code
                            value = eval(code)
                            addCodeToSnapshot(code)
                        } catch (err) {
                            /*
                                One possible error is that the conditions references a .previous that is undefined. For this
                                reason and others, we will simply set the value to false.
                            */
                            value = false

                            if (node.code.indexOf('previous') > -1 && err.message.indexOf('of undefined') > -1 ||
                                node.code.indexOf('chart') > -1 && err.message.indexOf('of undefined') > -1
                            ) {
                                /*
                                    We are not going to set an error for the casess we are using previous and the error is that the indicator is undefined.
                                */
                            } else {
                                node.error = err.message + ' @ ' + (new Date(candle.begin)).toLocaleString()
                            }
                        }

                        condition = {
                            key: key,
                            value: value
                        }

                        conditions.set(condition.key, condition)

                        if (condition.value) {
                            conditionsValues.push(1)
                        } else {
                            conditionsValues.push(0)
                        }
                    }
                }

                /* Trigger On Conditions */
                if (
                    variable.current.strategy.stage === 'No Stage' &&
                    variable.current.strategy.index === -1
                ) {
                    let minimumBalance
                    let maximumBalance
                    let balance

                    if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                        balance = variable.current.balance.baseAsset
                        minimumBalance = variable.episode.parameters.minimum.balance.baseAsset
                        maximumBalance = variable.episode.parameters.maximum.balance.baseAsset
                    } else {
                        balance = variable.current.balance.quotedAsset
                        minimumBalance = variable.episode.parameters.minimum.balance.quotedAsset
                        maximumBalance = variable.episode.parameters.maximum.balance.quotedAsset
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

                    /*
                    Here we need to pick a strategy, or if there is not suitable strategy for the current
                    market conditions, we pass until the next period.
 
                    To pick a new strategy we will evaluate what we call the trigger on. Once we enter
                    into one strategy, we will ignore market conditions for others. However there is also
                    a strategy trigger off which can be hit before taking a position. If hit, we would
                    be outside a strategy again and looking for the condition to enter all over again.
 
                    */

                    for (let j = 0; j < tradingSystem.strategies.length; j++) {
                        if (
                            variable.current.strategy.stage !== 'No Stage' ||
                            variable.current.strategy.index !== -1
                        ) { continue }

                        let strategy = tradingSystem.strategies[j]

                        let triggerStage = strategy.triggerStage

                        if (triggerStage !== undefined) {
                            if (triggerStage.triggerOn !== undefined) {
                                for (let k = 0; k < triggerStage.triggerOn.situations.length; k++) {
                                    let situation = triggerStage.triggerOn.situations[k]
                                    let passed
                                    if (situation.conditions.length > 0) {
                                        passed = true
                                    }

                                    for (let m = 0; m < situation.conditions.length; m++) {

                                        let condition = situation.conditions[m]
                                        let key = j + '-' + 'triggerStage' + '-' + 'triggerOn' + '-' + k + '-' + m

                                        let value = false
                                        if (conditions.get(key) !== undefined) {
                                            value = conditions.get(key).value
                                        }

                                        if (value === false) { passed = false }
                                    }

                                    if (passed) {

                                        variable.current.strategy.stage = 'Trigger Stage'
                                        checkAnnouncements(triggerStage)

                                        variable.current.strategy.index = j
                                        variable.current.strategy.begin = candle.begin
                                        variable.current.strategy.beginRate = candle.min
                                        variable.current.strategy.endRate = candle.min // In case the strategy does not get exited
                                        variable.current.strategy.situationName = situation.name
                                        variable.current.strategy.name = strategy.name

                                        variable.current.distance.toEvent.triggerOn = 1

                                        checkAnnouncements(triggerStage.triggerOn)
                                        saveAsLastTriggerOnSnapshot = true

                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Switching to Trigger Stage because conditions at Trigger On Event were met.') }
                                        break
                                    }
                                }
                            }
                        }
                    }
                }

                /* Trigger Off Condition */
                if (variable.current.strategy.stage === 'Trigger Stage') {
                    let strategy = tradingSystem.strategies[variable.current.strategy.index]

                    let triggerStage = strategy.triggerStage

                    if (triggerStage !== undefined) {
                        if (triggerStage.triggerOff !== undefined) {
                            for (let k = 0; k < triggerStage.triggerOff.situations.length; k++) {
                                let situation = triggerStage.triggerOff.situations[k]
                                let passed
                                if (situation.conditions.length > 0) {
                                    passed = true
                                }

                                for (let m = 0; m < situation.conditions.length; m++) {
                                    let condition = situation.conditions[m]
                                    let key = variable.current.strategy.index + '-' + 'triggerStage' + '-' + 'triggerOff' + '-' + k + '-' + m

                                    let value = false
                                    if (conditions.get(key) !== undefined) {
                                        value = conditions.get(key).value
                                    }

                                    if (value === false) { passed = false }
                                }

                                if (passed) {
                                    variable.current.strategy.number = variable.current.strategy.index
                                    variable.current.strategy.end = candle.end
                                    variable.current.strategy.endRate = candle.min
                                    variable.current.strategy.status = 1 // This means the strategy is closed, i.e. that has a begin and end.
                                    variable.current.strategy.stage = 'No Stage'
                                    variable.current.strategy.index = -1

                                    variable.current.distance.toEvent.triggerOff = 1

                                    checkAnnouncements(triggerStage.triggerOff)

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Switching to No Stage because conditions at the Trigger Off Event were met.') }
                                    break
                                }
                            }
                        }
                    }
                }

                /* Take Position Condition */
                if (variable.current.strategy.stage === 'Trigger Stage') {
                    let strategy = tradingSystem.strategies[variable.current.strategy.index]

                    let triggerStage = strategy.triggerStage

                    if (triggerStage !== undefined) {
                        if (triggerStage.takePosition !== undefined) {
                            for (let k = 0; k < triggerStage.takePosition.situations.length; k++) {
                                let situation = triggerStage.takePosition.situations[k]
                                let passed
                                if (situation.conditions.length > 0) {
                                    passed = true
                                }

                                for (let m = 0; m < situation.conditions.length; m++) {
                                    let condition = situation.conditions[m]
                                    let key = variable.current.strategy.index + '-' + 'triggerStage' + '-' + 'takePosition' + '-' + k + '-' + m

                                    let value = false
                                    if (conditions.get(key) !== undefined) {
                                        value = conditions.get(key).value
                                    }

                                    if (value === false) { passed = false }
                                }

                                if (passed) {
                                    variable.current.strategy.stage = 'Open Stage'
                                    checkAnnouncements(strategy.openStage)

                                    variable.current.position.stopLoss.stage = 'Open Stage'
                                    variable.current.position.takeProfit.stage = 'Open Stage'
                                    variable.current.position.stopLoss.phase = 0
                                    variable.current.position.takeProfit.phase = 0

                                    takePositionNow = true
                                    variable.current.position.situationName = situation.name

                                    checkAnnouncements(triggerStage.takePosition)
                                    saveAsLastTakePositionSnapshot = true

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Conditions at the Take Position Event were met.') }
                                    break
                                }
                            }
                        }
                    }
                }

                /* Stop Loss Management */
                if (
                    (variable.current.strategy.stage === 'Open Stage' || variable.current.strategy.stage === 'Manage Stage') &&
                    takePositionNow !== true
                ) {
                    checkStopPhases()
                    calculateStopLoss()
                }

                function checkStopPhases() {
                    let strategy = tradingSystem.strategies[variable.current.strategy.index]

                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let parentNode
                    let j = variable.current.strategy.index
                    let stageKey
                    let initialDefinitionKey = ''
                    let p

                    if (variable.current.position.stopLoss.stage === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.stopLoss !== undefined) {
                                parentNode = openStage.initialDefinition
                                initialDefinitionKey = '-' + 'initialDefinition'
                                stageKey = 'openStage'
                                p = variable.current.position.stopLoss.phase
                            }
                        }
                    }

                    if (variable.current.position.stopLoss.stage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.stopLoss !== undefined) {
                            parentNode = manageStage
                            stageKey = 'manageStage'
                            p = variable.current.position.stopLoss.phase - 1
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
                                    variable.current.position.stopLoss.phase++
                                    variable.current.position.stopLoss.stage = 'Manage Stage'
                                    if (variable.current.position.takeProfit.phase > 0) {
                                        variable.current.strategy.stage = 'Manage Stage'
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
                                                    variable.current.position.stopLoss.phase = q + 1
                                                }
                                            }
                                        } else {
                                            moveToPhaseEvent.error = 'This Node needs to reference a Phase.'
                                            continue
                                        }

                                        variable.current.position.stopLoss.stage = 'Manage Stage'
                                        if (variable.current.position.takeProfit.phase > 0) {
                                            variable.current.strategy.stage = 'Manage Stage'
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
                    let strategy = tradingSystem.strategies[variable.current.strategy.index]
                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let phase
                    let key

                    if (variable.current.position.stopLoss.stage === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.stopLoss !== undefined) {
                                phase = openStage.initialDefinition.stopLoss.phases[variable.current.position.stopLoss.phase]
                                key = variable.current.strategy.index + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'stopLoss' + '-' + (variable.current.position.stopLoss.phase)
                            }
                        }
                    }

                    if (variable.current.position.stopLoss.stage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.stopLoss !== undefined) {
                            phase = manageStage.stopLoss.phases[variable.current.position.stopLoss.phase - 1]
                            key = variable.current.strategy.index + '-' + 'manageStage' + '-' + 'stopLoss' + '-' + (variable.current.position.stopLoss.phase - 1)
                        }
                    }

                    if (phase !== undefined) {
                        if (phase.formula !== undefined) {
                            let previousValue = variable.current.position.stopLoss.value

                            variable.current.position.stopLoss.value = formulas.get(key)

                            if (variable.current.position.stopLoss.value !== previousValue) {
                                checkAnnouncements(phase, variable.current.position.stopLoss.value)
                            }
                        }
                    }
                }

                /* Take Profit Management */
                if (
                    (variable.current.strategy.stage === 'Open Stage' || variable.current.strategy.stage === 'Manage Stage') &&
                    takePositionNow !== true
                ) {
                    checkTakeProfitPhases()
                    calculateTakeProfit()
                }

                function checkTakeProfitPhases() {
                    let strategy = tradingSystem.strategies[variable.current.strategy.index]

                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let parentNode
                    let j = variable.current.strategy.index
                    let stageKey
                    let initialDefinitionKey = ''
                    let p

                    if (variable.current.position.takeProfit.stage === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.takeProfit !== undefined) {
                                parentNode = openStage.initialDefinition
                                initialDefinitionKey = '-' + 'initialDefinition'
                                stageKey = 'openStage'
                                p = variable.current.position.takeProfit.phase
                            }
                        }
                    }

                    if (variable.current.position.takeProfit.stage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.takeProfit !== undefined) {
                            parentNode = manageStage
                            stageKey = 'manageStage'
                            p = variable.current.position.takeProfit.phase - 1
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
                                    variable.current.position.takeProfit.phase++
                                    variable.current.position.takeProfit.stage = 'Manage Stage'
                                    if (variable.current.position.stopLoss.phase > 0) {
                                        variable.current.strategy.stage = 'Manage Stage'
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
                                                    variable.current.position.takeProfit.phase = q + 1
                                                }
                                            }
                                        } else {
                                            moveToPhaseEvent.error = 'This Node needs to reference a Phase.'
                                            continue
                                        }

                                        variable.current.position.takeProfit.stage = 'Manage Stage'
                                        if (variable.current.position.stopLoss.phase > 0) {
                                            variable.current.strategy.stage = 'Manage Stage'
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
                    let strategy = tradingSystem.strategies[variable.current.strategy.index]
                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let phase
                    let key

                    if (variable.current.position.takeProfit.stage === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.takeProfit !== undefined) {
                                phase = openStage.initialDefinition.takeProfit.phases[variable.current.position.takeProfit.phase]
                                key = variable.current.strategy.index + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'takeProfit' + '-' + (variable.current.position.takeProfit.phase)
                            }
                        }
                    }

                    if (variable.current.position.takeProfit.stage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.takeProfit !== undefined) {
                            phase = manageStage.takeProfit.phases[variable.current.position.takeProfit.phase - 1]
                            key = variable.current.strategy.index + '-' + 'manageStage' + '-' + 'takeProfit' + '-' + (variable.current.position.takeProfit.phase - 1)
                        }
                    }

                    if (phase !== undefined) {
                        if (phase.formula !== undefined) {
                            let previousValue = variable.current.position.stopLoss.value

                            variable.current.position.takeProfit.value = formulas.get(key)

                            if (variable.current.position.takeProfit.value !== previousValue) {
                                checkAnnouncements(phase, variable.current.position.takeProfit.value)
                            }
                        }
                    }
                }

                /* Keeping Position Counters Up-to-date */
                if (
                    (variable.current.strategy.stage === 'Open Stage' || variable.current.strategy.stage === 'Manage Stage')
                ) {
                    if (takePositionNow === true) {
                        variable.current.position.count.periods = 0
                    }

                    variable.current.position.count.periods++
                    variable.current.position.stat.days = variable.current.position.count.periods * variable.episode.parameters.timeFrame / ONE_DAY_IN_MILISECONDS
                } else {
                    variable.current.position.count.periods = 0
                    variable.current.position.stat.days = 0
                }

                /* Keeping Distance Counters Up-to-date */
                if (
                    variable.current.distance.toEvent.triggerOn > 0 // with this we avoind counting before the first event happens.
                ) {
                    variable.current.distance.toEvent.triggerOn++
                }

                if (
                    variable.current.distance.toEvent.triggerOff > 0 // with this we avoind counting before the first event happens.
                ) {
                    variable.current.distance.toEvent.triggerOff++
                }

                if (
                    variable.current.distance.toEvent.takePosition > 0 // with this we avoind counting before the first event happens.
                ) {
                    variable.current.distance.toEvent.takePosition++
                }

                if (
                    variable.current.distance.toEvent.closePosition > 0 // with this we avoind counting before the first event happens.
                ) {
                    variable.current.distance.toEvent.closePosition++
                }

                /* Checking if Stop or Take Profit were hit */
                if (
                    (variable.current.strategy.stage === 'Open Stage' || variable.current.strategy.stage === 'Manage Stage') &&
                    takePositionNow !== true
                ) {
                    let strategy = tradingSystem.strategies[variable.current.strategy.index]

                    /* Checking what happened since the last execution. We need to know if the Stop Loss
                        or our Take Profit were hit. */

                    /* Stop Loss condition: Here we verify if the Stop Loss was hitted or not. */

                    if ((variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset && candle.max >= variable.current.position.stopLoss.value) || (variable.episode.parameters.baseAsset !== variable.episode.parameters.marketBaseAsset && candle.min <= variable.current.position.stopLoss.value)) {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Stop Loss was hit.') }
                        /*
                        Hit Point Validation
 
                        This prevents misscalculations when a formula places the stop loss in this case way beyond the market price.
                        If we take the stop loss value at those situation would be a huge distortion of facts.
                        */

                        if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                            if (variable.current.position.stopLoss.value < candle.min) {
                                variable.current.position.stopLoss.value = candle.min
                            }
                        } else {
                            if (variable.current.position.stopLoss.value > candle.max) {
                                variable.current.position.stopLoss.value = candle.max
                            }
                        }

                        let slippedStopLoss = variable.current.position.stopLoss.value

                        /* Apply the Slippage */
                        let slippageAmount = slippedStopLoss * bot.VALUES_TO_USE.slippage.stopLoss / 100

                        if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                            slippedStopLoss = slippedStopLoss + slippageAmount
                        } else {
                            slippedStopLoss = slippedStopLoss - slippageAmount
                        }

                        closeRate = slippedStopLoss

                        variable.current.strategy.stage = 'Close Stage'
                        checkAnnouncements(strategy.closeStage, 'Stop')

                        variable.current.position.stopLoss.stage = 'No Stage'
                        variable.current.position.takeProfit.stage = 'No Stage'
                        variable.current.position.end = candle.end
                        variable.current.position.status = 1
                        variable.current.position.exitType = 1
                        variable.current.position.endRate = closeRate

                        closePositionNow = true
                    }

                    /* Take Profit condition: Here we verify if the Take Profit was hit or not. */

                    if ((variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset && candle.min <= variable.current.position.takeProfit.value) || (variable.episode.parameters.baseAsset !== variable.episode.parameters.marketBaseAsset && candle.max >= variable.current.position.takeProfit.value)) {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Take Profit was hit.') }
                        /*
                        Hit Point Validation:
 
                        This prevents misscalculations when a formula places the take profit in this case way beyond the market price.
                        If we take the stop loss value at those situation would be a huge distortion of facts.
                        */

                        if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                            if (variable.current.position.takeProfit.value > candle.max) {
                                variable.current.position.takeProfit.value = candle.max
                            }
                        } else {
                            if (variable.current.position.takeProfit.value < candle.min) {
                                variable.current.position.takeProfit.value = candle.min
                            }
                        }

                        let slippedTakeProfit = variable.current.position.takeProfit.value
                        /* Apply the Slippage */
                        let slippageAmount = slippedTakeProfit * bot.VALUES_TO_USE.slippage.takeProfit / 100

                        if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                            slippedTakeProfit = slippedTakeProfit + slippageAmount
                        } else {
                            slippedTakeProfit = slippedTakeProfit - slippageAmount
                        }

                        closeRate = slippedTakeProfit

                        variable.current.strategy.stage = 'Close Stage'
                        checkAnnouncements(strategy.closeStage, 'Take Profit')

                        variable.current.position.stopLoss.stage = 'No Stage'
                        variable.current.position.takeProfit.stage = 'No Stage'

                        variable.current.position.end = candle.end
                        variable.current.position.status = 1
                        variable.current.position.exitType = 2
                        variable.current.position.endRate = closeRate

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
                    variable.current.distance.toEvent.takePosition = 1

                    /* Position size and rate */
                    let strategy = tradingSystem.strategies[variable.current.strategy.index]

                    variable.current.position.size = strategy.positionSize
                    variable.current.position.rate = strategy.positionRate

                    /* We take what was calculated at the formula and apply the slippage. */
                    let slippageAmount = variable.current.position.rate * bot.VALUES_TO_USE.slippage.positionRate / 100

                    if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                        variable.current.position.rate = variable.current.position.rate - slippageAmount
                    } else {
                        variable.current.position.rate = variable.current.position.rate + slippageAmount
                    }

                    if (bot.startMode === 'Live') {
                        logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> Taking a Position in Live Mode.')
                        logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> strategy.positionSize = ' + strategy.positionSize)
                        logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> strategy.positionRate = ' + strategy.positionRate)
                        logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> slippageAmount = ' + slippageAmount)
                        logger.write(MODULE_NAME, '[PERSIST] runSimulation -> loop -> takePositionNow -> variable.current.position.rate = ' + variable.current.position.rate)
                    }

                    /* Update the trade record information. */
                    variable.current.position.begin = candle.begin
                    variable.current.position.beginRate = variable.current.position.rate

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
                                if (variable.episode.count.periods <= variable.executionContext.periods) {
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

                        if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                            orderSide = 'sell'

                            orderPrice = variable.current.position.rate

                            amountA = variable.current.position.size * orderPrice
                            amountB = variable.current.position.size
                        } else {
                            orderSide = 'buy'

                            orderPrice = variable.current.position.rate

                            amountA = variable.current.position.size
                            amountB = variable.current.position.size / orderPrice
                        }

                        variable.executionContext = {
                            status: 'Taking Position',
                            periods: variable.episode.count.periods
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
                                            periods: variable.episode.count.periods,
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

                        variable.previous.balance.baseAsset = variable.current.balance.baseAsset
                        variable.previous.balance.quotedAsset = variable.current.balance.quotedAsset

                        variable.last.position.profitLoss = 0
                        variable.last.position.ROI = 0

                        let feePaid = 0

                        if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                            feePaid = variable.current.position.size * variable.current.position.rate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            variable.current.balance.quotedAsset = variable.current.balance.quotedAsset + variable.current.position.size * variable.current.position.rate - feePaid
                            variable.current.balance.baseAsset = variable.current.balance.baseAsset - variable.current.position.size
                        } else {
                            feePaid = variable.current.position.size / variable.current.position.rate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            variable.current.balance.baseAsset = variable.current.balance.baseAsset + variable.current.position.size / variable.current.position.rate - feePaid
                            variable.current.balance.quotedAsset = variable.current.balance.quotedAsset - variable.current.position.size
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
                    variable.current.distance.toEvent.closePosition = 1

                    /* Position size and rate */
                    let strategy = tradingSystem.strategies[variable.current.strategy.index]

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
                                if (variable.episode.count.periods <= variable.executionContext.periods) {
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

                        if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                            orderSide = 'buy'

                            orderPrice = ticker.last + 100 // This is provisional and totally arbitrary, until we have a formula on the designer that defines this stuff.

                            amountA = variable.current.balance.quotedAsset
                            amountB = variable.current.balance.quotedAsset / orderPrice
                        } else {
                            orderSide = 'sell'

                            orderPrice = ticker.last - 100 // This is provisional and totally arbitrary, until we have a formula on the designer that defines this stuff.

                            amountA = variable.current.balance.baseAsset * orderPrice
                            amountB = variable.current.balance.baseAsset
                        }

                        variable.executionContext = {
                            status: 'Closing Position',
                            periods: variable.episode.count.periods
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
                                            periods: variable.episode.count.periods,
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

                        variable.episode.count.positions++

                        let feePaid = 0

                        if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                            strategy.positionSize = variable.current.balance.quotedAsset / closeRate
                            strategy.positionRate = closeRate

                            feePaid = variable.current.balance.quotedAsset / closeRate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            variable.current.balance.baseAsset = variable.current.balance.baseAsset + variable.current.balance.quotedAsset / closeRate - feePaid
                            variable.current.balance.quotedAsset = 0
                        } else {
                            strategy.positionSize = variable.current.balance.baseAsset * closeRate
                            strategy.positionRate = closeRate

                            feePaid = variable.current.balance.baseAsset * closeRate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            variable.current.balance.quotedAsset = variable.current.balance.quotedAsset + variable.current.balance.baseAsset * closeRate - feePaid
                            variable.current.balance.baseAsset = 0
                        }

                        if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                            variable.last.position.profitLoss = variable.current.balance.baseAsset - variable.previous.balance.baseAsset
                            variable.last.position.ROI = variable.last.position.profitLoss * 100 / variable.current.position.size
                            if (isNaN(variable.last.position.ROI)) { variable.last.position.ROI = 0 }
                            variable.episode.stat.profitLoss = variable.current.balance.baseAsset - variable.episode.parameters.initial.balance.baseAsset
                        } else {
                            variable.last.position.profitLoss = variable.current.balance.quotedAsset - variable.previous.balance.quotedAsset
                            variable.last.position.ROI = variable.last.position.profitLoss * 100 / variable.current.position.size
                            if (isNaN(variable.last.position.ROI)) { variable.last.position.ROI = 0 }
                            variable.episode.stat.profitLoss = variable.current.balance.quotedAsset - variable.episode.parameters.initial.balance.quotedAsset
                        }

                        variable.current.position.stat.ROI = variable.last.position.ROI

                        if (variable.last.position.profitLoss > 0) {
                            variable.episode.count.hits++
                        } else {
                            variable.episode.count.fails++
                        }

                        if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                            variable.episode.stat.ROI = (variable.episode.parameters.initial.balance.baseAsset + variable.episode.stat.profitLoss) / variable.episode.parameters.initial.balance.baseAsset - 1
                            variable.episode.stat.hitRatio = variable.episode.count.hits / variable.episode.count.positions
                            variable.episode.stat.anualizedRateOfReturn = variable.episode.stat.ROI / variable.episode.stat.days * 365
                        } else {
                            variable.episode.stat.ROI = (variable.episode.parameters.initial.balance.quotedAsset + variable.episode.stat.profitLoss) / variable.episode.parameters.initial.balance.quotedAsset - 1
                            variable.episode.stat.hitRatio = variable.episode.count.hits / variable.episode.count.positions
                            variable.episode.stat.anualizedRateOfReturn = variable.episode.stat.ROI / variable.episode.stat.days * 365
                        }

                        addRecords()

                        variable.current.position.stopLoss.value = 0
                        variable.current.position.takeProfit.value = 0

                        variable.current.position.rate = 0
                        variable.current.position.size = 0

                        timerToCloseStage = candle.begin
                        variable.current.position.stopLoss.stage = 'No Stage'
                        variable.current.position.takeProfit.stage = 'No Stage'
                        variable.current.position.stopLoss.phase = -1
                        variable.current.position.takeProfit.phase = -1

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> closePositionAtSimulation -> Exiting Loop Body after closing position at simulation.') }
                        controlLoop()
                        return
                    }
                }

                /* Closing the Closing Stage */
                if (variable.current.strategy.stage === 'Close Stage') {
                    if (candle.begin - 5 * 60 * 1000 > timerToCloseStage) {
                        variable.current.strategy.number = variable.current.strategy.index
                        variable.current.strategy.end = candle.end
                        variable.current.strategy.endRate = candle.min
                        variable.current.strategy.status = 1 // This means the strategy is closed, i.e. that has a begin and end.

                        variable.current.strategy.index = -1
                        variable.current.strategy.stage = 'No Stage'

                        timerToCloseStage = 0
                        variable.current.distance.toEvent.triggerOff = 1

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
                    variable.last.candle = {
                        begin: candle.begin,
                        end: candle.end
                    }

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
                                variable.episode.count.positions,                                   // Position Number
                                (new Date(candle.begin)).toISOString(),                             // Datetime
                                tradingSystem.strategies[variable.current.strategy.index].name,     // Strategy Name
                                variable.current.strategy.situationName,                            // Trigger On Situation
                                variable.current.position.situationName,                            // Take Position Situation
                                hitOrFial(),                                                        // Result
                                variable.last.position.ROI,                                         // ROI
                                exitType()                                                          // Exit Type
                            ]

                            function hitOrFial() {
                                if (variable.last.position.ROI > 0) { return 'HIT' } else { return 'FAIL' }
                            }

                            function exitType() {
                                switch (variable.current.position.exitType) {
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

                        if (variable.current.balance.baseAsset === Infinity) {
                            variable.current.balance.baseAsset = Number.MAX_SAFE_INTEGER
                        }

                        if (variable.current.balance.quotedAsset === Infinity) {
                            variable.current.balance.quotedAsset = Number.MAX_SAFE_INTEGER
                        }

                        simulationRecord = [
                            candle.begin,
                            candle.end,
                            variable.current.balance.baseAsset,
                            variable.current.balance.quotedAsset,
                            variable.episode.stat.profitLoss,
                            variable.last.position.profitLoss,
                            variable.current.position.stopLoss.value,
                            variable.episode.count.positions,
                            variable.episode.count.hits,
                            variable.episode.count.fails,
                            variable.episode.stat.hitRatio,
                            variable.episode.stat.ROI,
                            variable.episode.count.periods,
                            variable.episode.stat.days,
                            variable.episode.stat.anualizedRateOfReturn,
                            variable.current.position.rate,
                            variable.last.position.ROI,
                            variable.current.position.takeProfit.value,
                            variable.current.position.stopLoss.phase,
                            variable.current.position.takeProfit.phase,
                            variable.current.position.size,
                            variable.episode.parameters.initial.balance.baseAsset,
                            variable.episode.parameters.minimum.balance.baseAsset,
                            variable.episode.parameters.maximum.balance.baseAsset,
                            variable.episode.parameters.initial.balance.quotedAsset,
                            variable.episode.parameters.minimum.balance.quotedAsset,
                            variable.episode.parameters.maximum.balance.quotedAsset,
                            '"' + variable.episode.parameters.baseAsset + '"',
                            '"' + variable.episode.parameters.quotedAsset + '"',
                            '"' + variable.episode.parameters.marketBaseAsset + '"',
                            '"' + variable.episode.parameters.marketQuotedAsset + '"',
                            variable.current.position.count.periods,
                            variable.current.position.stat.days
                        ]

                        recordsArray.push(simulationRecord)
                    }

                    function addConditionsRecord() {
                        /* Prepare the information for the Conditions File */
                        let conditionsRecord = [
                            candle.begin,
                            candle.end,
                            variable.current.strategy.index,
                            variable.current.position.stopLoss.phase,
                            variable.current.position.takeProfit.phase,
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
                        if (variable.current.strategy.begin !== 0 && variable.current.strategy.end === 0 && currentCandleIndex === candles.length - 2 && lastCandle.end !== lastInstantOfTheDay) {
                            variable.current.strategy.status = 2 // This means the strategy is open, i.e. that has a begin but no end.
                            variable.current.strategy.end = candle.end
                        }

                        /* Prepare the information for the Strategies File */
                        if (variable.current.strategy.begin !== 0 && variable.current.strategy.end !== 0) {
                            let strategyRecord = [
                                variable.current.strategy.begin,
                                variable.current.strategy.end,
                                variable.current.strategy.status,
                                variable.current.strategy.number,
                                variable.current.strategy.beginRate,
                                variable.current.strategy.endRate,
                                '"' + variable.current.strategy.situationName + '"',
                                '"' + variable.current.strategy.name + '"'
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
                        if (variable.current.position.begin !== 0 &&
                            variable.current.position.end === 0 &&
                            currentCandleIndex === candles.length - 2 &&
                            lastCandle.end !== lastInstantOfTheDay) {

                            /* This means the trade is open */
                            variable.current.position.status = 2
                            variable.current.position.end = candle.end
                            variable.current.position.endRate = candle.close

                            /* Here we will calculate the ongoing ROI */
                            if (variable.episode.parameters.baseAsset === variable.episode.parameters.marketBaseAsset) {
                                variable.current.position.stat.ROI = (variable.current.position.rate - candle.close) / variable.current.position.rate * 100
                            } else {
                                variable.current.position.stat.ROI = (candle.close - variable.current.position.rate) / variable.current.position.rate * 100
                            }
                        }

                        /* Prepare the information for the Positions File */
                        if (variable.current.position.begin !== 0 && variable.current.position.end !== 0) {
                            let positionRecord = [
                                variable.current.position.begin,
                                variable.current.position.end,
                                variable.current.position.status,
                                variable.current.position.stat.ROI,
                                variable.current.position.beginRate,
                                variable.current.position.endRate,
                                variable.current.position.exitType,
                                '"' + variable.current.position.situationName + '"'
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

                            if (variable.episode.count.periods > lastPeriodAnnounced) {
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
                                    newAnnouncementRecord.periods = variable.episode.count.periods
                                    newAnnouncementRecord.value = value
                                } else {
                                    newAnnouncementRecord = {
                                        key: key,
                                        periods: variable.episode.count.periods,
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

