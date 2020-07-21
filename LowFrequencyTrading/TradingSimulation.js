exports.newTradingSimulation = function newTradingSimulation(bot, logger, UTILITIES) {
    /*
    This Module represents the trading simulacion. Escentially a loop through a set of candles and 
    the execution at each loop cycle of the Trading System Protocol.
    */
    const FULL_LOG = true
    const MODULE_NAME = 'Trading Simulation -> ' + bot.SESSION.name

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
        outputDatasetsMap,
        callback,
        callBackFunction) {
        try {

            let tradingSystem = bot.simulationState.tradingSystem
            let tradingEngine = bot.simulationState.tradingEngine
            let sessionParameters = bot.SESSION.parameters

            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> initialDatetime = ' + sessionParameters.timeRange.config.initialDatetime) }
            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> finalDatetime = ' + sessionParameters.timeRange.config.finalDatetime) }

            /* Stop Loss Management TODO */
            const MIN_STOP_LOSS_VALUE = 0.0000000001 // We can not let the stop be zero to avoid division by 0 error or infinity numbers as a result.
            const MAX_STOP_LOSS_VALUE = Number.MAX_SAFE_INTEGER

            /* Take Profit Management TODO */
            const MIN_TAKE_PROFIT_VALUE = 0.0000000001 // We can not let the buy order be zero to avoid division by 0 error or infinity numbers as a result.
            const MAX_TAKE_PROFIT_VALUE = Number.MAX_SAFE_INTEGER

            /* These are the Modules we will need to run the Simulation */
            const TRADING_ENGINE_MODULE = require('./TradingEngine.js')
            let tradingEngineModule = TRADING_ENGINE_MODULE.newTradingEngine(bot, logger)
            tradingEngineModule.initialize()

            const TRADING_RECORDS_MODULE = require('./TradingRecords.js')
            let tradingRecordsModule = TRADING_RECORDS_MODULE.newTradingRecords(bot, logger)
            tradingRecordsModule.initialize(outputDatasetsMap)

            const TRADING_SYSTEM_MODULE = require('./TradingSystem.js')
            let tradingSystemModule = TRADING_SYSTEM_MODULE.newTradingSystem(bot, logger, tradingEngineModule)
            tradingSystemModule.initialize()

            /* Setting up the candles array: The whole simulation is based on the array of candles at the time-frame defined at the session parameters. */
            let propertyName = 'at' + sessionParameters.timeFrame.config.label.replace('-', '')
            let candles = chart[propertyName].candles

            /* Variables needed for heartbeat functionality */
            let heartBeatDate
            let previousHeartBeatDate

            /* This determines where we are standing */
            bot.sessionAndMarketBaseAssetsAreEqual = (sessionParameters.sessionBaseAsset.referenceParent.referenceParent.config.codeName === bot.market.baseAsset)

            initializeLoop()

            function initializeLoop() {
                if (bot.FIRST_EXECUTION === false && tradingEngine.last.candle !== undefined) {
                    /* Estimate the Initial Candle based on the last candle saved at tradingEngine */
                    let firstBegin = candles[0].begin
                    let lastBegin = tradingEngine.last.candle.begin
                    let diff = lastBegin - firstBegin
                    let amount = diff / sessionParameters.timeFrame.config.value

                    tradingEngine.current.candle.index.value = Math.trunc(amount) + 1 // Because we need to start from the next candle
                    if (tradingEngine.current.candle.index.value < 0 || tradingEngine.current.candle.index.value > candles.length - 1) {
                        logger.write(MODULE_NAME, '[ERROR] runSimulation -> initializeLoop -> Cannot resume simulation.')
                        logger.write(MODULE_NAME, '[ERROR] runSimulation -> initializeLoop -> tradingEngine.current.candle.index.value = ' + tradingEngine.current.candle.index.value)
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
                    let targetEnd = sessionParameters.timeRange.config.initialDatetime
                    let diff = targetEnd - firstEnd
                    let amount = diff / sessionParameters.timeFrame.config.value

                    tradingEngine.current.candle.index.value = Math.trunc(amount)
                    if (tradingEngine.current.candle.index.value < 0) { tradingEngine.current.candle.index.value = 0 }
                    if (tradingEngine.current.candle.index.value > candles.length - 1) {
                        /* 
                        This will happen when the sessionParameters.timeRange.config.initialDatetime is beyond the last candle available, 
                        meaning that the dataSet needs to be updated with more up-to-date data. 
                        */
                        tradingEngine.current.candle.index.value = candles.length - 1
                    }
                }

                loop()
            }

            async function loop() {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Processing candle # ' + tradingEngine.current.candle.index.value) }
                let candle = candles[tradingEngine.current.candle.index.value] // This is the current candle the Simulation is working at.

                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Candle Begin @ ' + (new Date(candle.begin)).toLocaleString()) }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Candle End @ ' + (new Date(candle.end)).toLocaleString()) }

                tradingEngineModule.setCurrentCandle(candle) // We move the current candle we are standing at, to the trading engine data structure to make it available to anyone, including conditions and formulas.

                if (checkIfWeAreAtTheHeadOfTheMarket() === false) {
                    afterLoop()
                    return
                }

                if (checkMinimunAndMaximunBalance() === false) {
                    afterLoop()
                    return
                }

                if (checkInitialAndFinalDatetime() === false) {
                    controlLoop()
                    return
                }

                heartBeat()
                positionChartAtCurrentCandle()
                tradingSystemModule.reset(chart)
                tradingSystemModule.mantainPositions()
                tradingSystemModule.mantainStrategies()
                tradingSystemModule.mantainOrders()

                tradingEngineModule.updateEpisodeCountersAndStatistics()
                tradingEngineModule.updateDistanceToEventsCounters()

                /* Run the Trigger Stage */
                tradingSystemModule.triggerStage()

                /* Run the Open Stage */
                await tradingSystemModule.openStage()

                /* Run the Manage Stage */
                tradingSystemModule.manageStage()

                /* Run the Close Stage */
                await tradingSystemModule.closeStage()

                /* Add new records to the process output */
                tradingRecordsModule.appendRecords()

                controlLoop()
            }

            function controlLoop() {
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

                tradingEngine.current.candle.index.value++
                if (tradingEngine.current.candle.index.value < candles.length) {
                    setImmediate(loop) // This will execute the next loop in the next iteration of the NodeJs event loop allowing for other callbacks to be executed.
                } else {
                    afterLoop()
                }
            }

            function afterLoop() {
                tradingEngineModule.finalize()
                tradingSystemModule.finalize()
                tradingRecordsModule.finalize()

                tradingEngineModule = undefined
                tradingSystemModule = undefined
                tradingRecordsModule = undefined

                callback()
            }

            function heartBeat() {
                /* We will produce a simulation level heartbeat in order to inform the user this is running. */
                heartBeatDate = new Date(Math.trunc(tradingEngine.current.candle.begin.value / global.ONE_DAY_IN_MILISECONDS) * global.ONE_DAY_IN_MILISECONDS)
                if (heartBeatDate.valueOf() !== previousHeartBeatDate) {
                    let processingDate = heartBeatDate.getUTCFullYear() + '-' + utilities.pad(heartBeatDate.getUTCMonth() + 1, 2) + '-' + utilities.pad(heartBeatDate.getUTCDate(), 2)

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Simulation ' + bot.sessionKey + ' Loop # ' + tradingEngine.current.candle.index.value + ' @ ' + processingDate) }

                    /*  Telling the world we are alive and doing well */
                    let fromDate = new Date(sessionParameters.timeRange.config.initialDatetime)
                    let lastDate = new Date(sessionParameters.timeRange.config.finalDatetime)

                    let currentDateString = heartBeatDate.getUTCFullYear() + '-' + utilities.pad(heartBeatDate.getUTCMonth() + 1, 2) + '-' + utilities.pad(heartBeatDate.getUTCDate(), 2)
                    let currentDate = new Date(heartBeatDate)
                    let percentage = global.getPercentage(fromDate, currentDate, lastDate)
                    bot.processHeartBeat(currentDateString, percentage)

                    if (global.areEqualDates(currentDate, new Date()) === false) {
                        logger.newInternalLoop(bot.codeName, bot.process, currentDate, percentage)
                    }
                }
                previousHeartBeatDate = heartBeatDate.valueOf()
            }

            function positionChartAtCurrentCandle() {
                /*
                In conditions and Formulas, we want users to have an easy sintax to refer to indicators. In order to achieve that, we need the user to have
                easy access to the current candle for instance, or the current bollinger band, meaning the one the Simulation is currently standing at.
                For that reason we do the following processing, to have at the chart data structure the current objects of each indicator / time frame.  
                */
                let dataDependencies = bot.processNode.referenceParent.processDependencies.dataDependencies

                /* Finding the Current Element on Market Files */
                if (bot.processingDailyFiles) {
                    for (let j = 0; j < global.dailyFilePeriods.length; j++) {
                        let mapKey = dailyFilePeriods[j][1]
                        let propertyName = 'at' + mapKey.replace('-', '')
                        let thisChart = chart[propertyName]

                        for (let k = 0; k < dataDependencies.length; k++) {
                            let dataDependencyNode = dataDependencies[k]
                            if (dataDependencyNode.referenceParent.config.codeName !== 'Multi-Period-Daily') { continue }
                            let singularVariableName = dataDependencyNode.referenceParent.parentNode.config.singularVariableName
                            let pluralVariableName = dataDependencyNode.referenceParent.parentNode.config.pluralVariableName
                            let currentElement = getElement(thisChart[pluralVariableName], 'Daily' + '-' + mapKey + '-' + pluralVariableName)
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
                        let currentElement = getElement(thisChart[pluralVariableName], 'Market' + '-' + mapKey + '-' + pluralVariableName)
                        thisChart[singularVariableName] = currentElement
                    }
                }

                /* Finding the Current Element At Single Files*/
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
            }

            function getElement(pArray, datasetName) {
                if (pArray === undefined) { return }
                try {
                    let element
                    for (let i = 0; i < pArray.length; i++) {
                        element = pArray[i]

                        if (tradingEngine.current.candle.end.value === element.end) { // when there is an exact match at the end we take that element
                            return element
                        } else {
                            if (
                                i > 0 &&
                                element.end > tradingEngine.current.candle.end.value
                            ) {
                                let previousElement = pArray[i - 1]
                                if (previousElement.end < tradingEngine.current.candle.end.value) {
                                    return previousElement // If one elements goes into the future of currentCandle, then we stop and take the previous element.
                                } else {
                                    return
                                }
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

            function checkIfWeAreAtTheHeadOfTheMarket() {
                /* 
                We skip the candle at the head of the market because it has not closed yet. The procedure to determine if we are at the head of the market is different 
                when we are processing Market Files than when we are processing Daily Files. TODO Check that the procedure is good for Beta 6
                */
                if (bot.processingDailyFiles) { // We are processing Daily Files
                    let candlesPerDay = global.ONE_DAY_IN_MILISECONDS / sessionParameters.timeFrame.config.value
                    if (tradingEngine.current.candle.index.value === candles.length - 1) {
                        if ((candles.length < candlesPerDay) || (candles.length > candlesPerDay && candles.length < candlesPerDay * 2)) {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> checkIfWeAreAtTheHeadOfTheMarket -> Skipping Candle because it is the last one and has not been closed yet.') }
                            return false
                            /* 
                            Note here that in the last candle of the first day or the second day it will use an incomplete candle and partially calculated indicators.
                            if we skip these two periods, then there will be a hole in the file since the last period will be missing. 
                            */
                        }
                    }
                } else { // We are processing Market Files
                    if (tradingEngine.current.candle.index.value === candles.length - 1) {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> checkIfWeAreAtTheHeadOfTheMarket -> Skipping Candle because it is the last one and has not been closed yet.') }
                        return false
                    }
                }
                return true
            }

            function checkInitialAndFinalDatetime() {
                /* Here we check that the current candle is not outside of user-defined time range at the session parameters.*/
                if (tradingEngine.current.candle.end.value < sessionParameters.timeRange.config.initialDatetime) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> checkInitialAndFinalDatetime -> Skipping Candle before the sessionParameters.timeRange.config.initialDatetime.') }
                    return false
                }
                if (tradingEngine.current.candle.begin.value > sessionParameters.timeRange.config.finalDatetime) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> checkInitialAndFinalDatetime -> Skipping Candle after the sessionParameters.timeRange.config.finalDatetime.') }
                    return false
                }
                return true
            }

            function checkMinimunAndMaximunBalance() {
                /* Checks for Minimun and Maximun Balance. We do the check while not inside any strategy only. */
                if (
                    tradingEngine.current.strategy.index.value === tradingEngine.current.strategy.index.config.initialValue
                ) {
                    /* 
                    First thing to do is to check if we are below the minimum balance, or above the maximun balance.
                    If we are, we are not gooing to trigger on again. 
                    */
                    let minimumBalance
                    let maximumBalance
                    let balance

                    if (bot.sessionAndMarketBaseAssetsAreEqual) {
                        balance = tradingEngine.current.balance.baseAsset.value
                        minimumBalance = sessionParameters.sessionBaseAsset.config.minimumBalance
                        maximumBalance = sessionParameters.sessionBaseAsset.config.maximumBalance
                    } else {
                        balance = tradingEngine.current.balance.quotedAsset.value
                        minimumBalance = sessionParameters.sessionQuotedAsset.config.minimumBalance
                        maximumBalance = sessionParameters.sessionQuotedAsset.config.maximumBalance
                    }

                    let stopRunningDate = new Date(tradingEngine.current.candle.begin.value)
                    if (balance <= minimumBalance) {
                        tradingSystem.error = 'Min Balance @ ' + stopRunningDate.toLocaleString()
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> checkMinimunAndMaximunBalance -> ' + tradingSystem.error) }
                        return false
                    }

                    if (balance >= maximumBalance) {
                        tradingSystem.error = 'Max Balance @ ' + stopRunningDate.toLocaleString()
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> checkMinimunAndMaximunBalance -> ' + tradingSystem.error) }
                        return false
                    }
                }
                return true
            }
        } catch (err) {
            logger.write(MODULE_NAME, '[ERROR] runSimulation -> err = ' + err.stack)
            callBackFunction(global.DEFAULT_FAIL_RESPONSE)
        }
    }
}

