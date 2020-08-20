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

    async function runSimulation(
        chart,
        outputDatasetsMap,
        writeFiles,
        ) {
        try {

            let tradingSystem = bot.simulationState.tradingSystem
            let tradingEngine = bot.simulationState.tradingEngine
            let sessionParameters = bot.SESSION.parameters

            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> initialDatetime = ' + sessionParameters.timeRange.config.initialDatetime) }
            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> finalDatetime = ' + sessionParameters.timeRange.config.finalDatetime) }

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

            const TRADING_EPISODE_MODULE = require('./TradingEpisode.js')
            let tradingEpisodeModule = TRADING_EPISODE_MODULE.newTradingEpisode(bot, logger, tradingEngineModule)
            tradingEpisodeModule.initialize()

            /* Setting up the candles array: The whole simulation is based on the array of candles at the time-frame defined at the session parameters. */
            let propertyName = 'at' + sessionParameters.timeFrame.config.label.replace('-', '')
            let candles = chart[propertyName].candles

            /* Variables needed for heartbeat functionality */
            let heartBeatDate
            let previousHeartBeatDate
            let firstLoopExecution = true
            
            /*
            Estimation of the Initial Candle to Process in this Run.
            */
           let initialCandle 
           if (bot.FIRST_EXECUTION === true && bot.RESUME === false)   {
                /* Estimate Initial Candle based on the timeRage configured for the session. */
                let firstEnd = candles[0].end
                let targetEnd = sessionParameters.timeRange.config.initialDatetime
                let diff = targetEnd - firstEnd
                let amount = diff / sessionParameters.timeFrame.config.value

                initialCandle = Math.trunc(amount)
                if (initialCandle < 0) { initialCandle = 0 }
                if (initialCandle > candles.length - 1) {
                    /* 
                    This will happen when the sessionParameters.timeRange.config.initialDatetime is beyond the last candle available, 
                    meaning that the dataSet needs to be updated with more up-to-date data. 
                    */
                   bot.SESSION.stop('Data is not up-to-date enough. Please start the Masters Data Mining Operation.')
                   return
                }
            } else {
                {
                    /* 
                    In this case we already have last candle index. Now we need to continue
                    at the next candle, so we add 1. This works well for Market Files,
                    but for Daily Files we need to consider that we we turn into a new date
                    a we get a new file with candles statting at index 0. 
                    */
                    if (bot.processingDailyFiles === true) {
                        /*
                        We are going to test if adding 1 gets us a valid candle, it means that
                        the candle dataset did not change since the lasst execution, otherwise
                        it means it changed and we need to start again from 0.
                        */
                        let candle = candles[tradingEngine.current.episode.candle.index.value + 1]
                        if (candle === undefined) {
                            initialCandle = 0
                        } else {
                            initialCandle = tradingEngine.current.episode.candle.index.value + 1
                        }
                    } else {
                        initialCandle = tradingEngine.current.episode.candle.index.value + 1
                    }
                }
            }
            /*
            Main Simulation Loop
            */
           console.log('initialCandle =  ' + initialCandle)
           let breakLoop = false
            for( let i = initialCandle; i < candles.length; i++) {

                tradingEngine.current.episode.candle.index.value = i
                console.log('index =  ' + tradingEngine.current.episode.candle.index.value)
                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Processing candle # ' + tradingEngine.current.episode.candle.index.value) }
                let candle = candles[tradingEngine.current.episode.candle.index.value] // This is the current candle the Simulation is working at.

                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Candle Begin @ ' + (new Date(candle.begin)).toLocaleString()) }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Candle End @ ' + (new Date(candle.end)).toLocaleString()) }

                tradingEngineModule.setCurrentCandle(candle) // We move the current candle we are standing at, to the trading engine data structure to make it available to anyone, including conditions and formulas.
                
                /* We emit a heart beat so that the UI can now where we are at the overal process.*/
                heartBeat()

                if (firstLoopExecution === true) {
                    tradingEpisodeModule.openEpisode()
                    firstLoopExecution = false
                }

                if (checkInitialDatetime() === false) {
                    console.log(' Esta candle esta dentras del Initial Datetime')
                    continue
                }

                positionChartAtCurrentCandle()

                /* The chart was recalculated based on the current candle. */
                tradingSystemModule.updateChart(chart)

                /* 
                Do the stuff needed previous to the run like 
                Episode Counters and Statistics update. Mantaince is done
                once per simulation candle.
                */
                tradingSystemModule.mantain()
                tradingEpisodeModule.mantain()
                tradingEngineModule.mantain()

                /* 
                Run the first cycle of the Trading System. In this first cycle we
                give some room so that orders can be canceled or filled and we can
                write those records into the output memory. During this cycle new
                orders can not be created, since otherwise the could be cancelled at
                the second cycle without spending real time at the order book.
                */
                tradingEngineModule.setCurrentCycle('First')
                await runCycle() 
                /* 
                Run the second cycle of the Trading System. During this second run
                some new orders might be created at slots freed up during the first 
                run. This allows for example for a Limit Order to be cancelled during the 
                first run, and the same Limit Order definition to spawn a new order 
                without the need to wait until the next candle. Orders can not be cancelled
                during the second cycle.
                */
                tradingEngineModule.setCurrentCycle('Second')
                await runCycle() 

                async function runCycle() {

                    console.log(new Date(), 'Function runCycle', ' Cycle = ' + tradingEngine.current.episode.cycle.value )

                    /* Reset Data Structures */
                    tradingSystemModule.reset()
                    tradingEpisodeModule.reset()
                    tradingEngineModule.reset()

                    await tradingSystemModule.run()

                    /* Checking if we should continue processing this loop or not. */
                    if (bot.STOP_SESSION === true) {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this session.') }
                        console.log('[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this session.')
                        updateEpisode('Session Stopped')
                        breakLoop = true
                    }

                    if (global.STOP_TASK_GRACEFULLY === true) {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this task.') }
                        console.log('[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this task.')
                        updateEpisode('Task Stopped')
                        breakLoop = true
                    }

                    if (checkFinalDatetime() === false) {
                        closeEpisode('Final Datetime Reached')
                        breakLoop = true
                    }

                    if (checkLastCandle() === false) {
                        updateEpisode('All Available Candles Processed')
                        breakLoop = true
                    }

                    if (checkMinimunAndMaximunBalance() === false) {
                        closeEpisode('Min or Max Balance Reached')
                        breakLoop = true
                    }

                    /* Add new records to the process output */
                    tradingRecordsModule.appendRecords()
                }

                if (breakLoop === true) {break}
            }

            tradingEngineModule.finalize()
            tradingSystemModule.finalize()
            tradingRecordsModule.finalize()
            tradingEpisodeModule.finalize()

            tradingEngineModule = undefined
            tradingSystemModule = undefined
            tradingRecordsModule = undefined
            tradingEpisodeModule = undefined

            await writeFiles()

            function closeEpisode(exitType) {
                tradingEpisodeModule.updateExitType(exitType)
                tradingEpisodeModule.closeEpisode()
            }

            function updateEpisode(exitType) {
                tradingEpisodeModule.updateExitType(exitType)
            }

            function heartBeat() {
                /* We will produce a simulation level heartbeat in order to inform the user this is running. */
                heartBeatDate = new Date(Math.trunc(tradingEngine.current.episode.candle.begin.value / global.ONE_DAY_IN_MILISECONDS) * global.ONE_DAY_IN_MILISECONDS)
                if (heartBeatDate.valueOf() !== previousHeartBeatDate) {
                    let processingDate = heartBeatDate.getUTCFullYear() + '-' + utilities.pad(heartBeatDate.getUTCMonth() + 1, 2) + '-' + utilities.pad(heartBeatDate.getUTCDate(), 2)

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> loop -> Simulation ' + bot.sessionKey + ' Loop # ' + tradingEngine.current.episode.candle.index.value + ' @ ' + processingDate) }

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
                            if (thisChart[pluralVariableName] !== undefined) {
                                let currentElement = getElement(thisChart[pluralVariableName], 'Daily' + '-' + mapKey + '-' + pluralVariableName)
                                if (currentElement !== undefined) {
                                    thisChart[singularVariableName] = currentElement
                                }
                            }
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
                        if (thisChart[pluralVariableName] !== undefined) {
                            let currentElement = getElement(thisChart[pluralVariableName], 'Market' + '-' + mapKey + '-' + pluralVariableName)
                            if (currentElement !== undefined) {
                                thisChart[singularVariableName] = currentElement
                            }
                        }
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

                        if (tradingEngine.current.episode.candle.end.value === element.end) { // when there is an exact match at the end we take that element
                            return element
                        } else {
                            if (
                                i > 0 &&
                                element.end > tradingEngine.current.episode.candle.end.value
                            ) {
                                let previousElement = pArray[i - 1]
                                if (previousElement.end < tradingEngine.current.episode.candle.end.value) {
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
                    throw(global.DEFAULT_FAIL_RESPONSE)
                }
            }

            function checkLastCandle() {
                /* 
                Before reaching the last candle of the loop, we need to check that the next candle it is not the last candle.
                We skip the candle at the head of the market because it has not closed yet. 
                For the special case of Daily Files, this means that the last candle of each day will never be processed.
                */
               if (tradingEngine.current.episode.candle.index.value + 1 === candles.length - 1) {
                    /*
                    When processing daily files, we need a mechanism to turn from one day to the next one.
                    That mechanism is the one implemented here. If we detect that we are at the last candle of 
                    the day, we will advance current process day. By doing so, during the next execution, the
                    simulation will receive the candles and indicators files of the next day. 
                    */
                    if (bot.processingDailyFiles) {
                        let candlesPerDay = global.ONE_DAY_IN_MILISECONDS / sessionParameters.timeFrame.config.value
                        if (tradingEngine.current.episode.candle.index.value + 1 === candlesPerDay - 1) {
                            /*
                            Here we found that the next candle of the Simulation is the last candle of the day.
                            It is time to move to the next day so as to receive next, the indicator files from 
                            the next day. At the same time we will reset the index to be ready to real next time
                            the first candle of the new set we receive.
                            */
                           tradingEngine.current.episode.candle.index.value = 0
                           tradingEngine.current.episode.processDate.value = 
                           tradingEngine.current.episode.processDate.value + global.ONE_DAY_IN_MILISECONDS
                         }
                    }

                    /* We reached the head of the market */
                    tradingEngine.current.episode.headOfTheMarket.value = true
                    return false
                } else {
                    /* Wd did not reach the head of the market */
                    tradingEngine.current.episode.headOfTheMarket.value = false
                    return true
                }
            }

            function checkInitialDatetime() {
                /* Here we check that the current candle is not before the initial datetime defined at the session parameters.*/
                if (tradingEngine.current.episode.candle.end.value < sessionParameters.timeRange.config.initialDatetime) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] runSimulation -> checkInitialAndFinalDatetime -> Skipping Candle before the sessionParameters.timeRange.config.initialDatetime.') }
                    return false
                }
                return true
            }

            function checkFinalDatetime() {
                /* Here we check that the next candle is not after of the user-defined final datetime at the session parameters.*/
                if (tradingEngine.current.episode.candle.begin.value + sessionParameters.timeFrame.config.value > sessionParameters.timeRange.config.finalDatetime) {
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
                    We will perform this check only when we are not inside a position,
                    because there the balances have shifted from their resting position.
                    */

                    let stopRunningDate = (new Date(tradingEngine.current.episode.candle.begin.value)).toLocaleString()

                    if (sessionParameters.sessionBaseAsset.config.minimumBalance !== undefined) {
                        if (tradingEngine.current.episode.episodeBaseAsset.balance.value <= sessionParameters.sessionBaseAsset.config.minimumBalance) {
                            const errorMessage = 'Min Balance reached @ ' + stopRunningDate
                            tradingSystem.errors.push([tradingSystem.id, errorMessage])
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[WARN] runSimulation -> checkMinimunAndMaximunBalance -> ' + errorMessage) }
                            return false
                        }
                    }

                    if (sessionParameters.sessionBaseAsset.config.maximumBalance !== undefined) {
                        if (tradingEngine.current.episode.episodeBaseAsset.balance.value >= sessionParameters.sessionBaseAsset.config.maximumBalance) {
                            const errorMessage = 'Max Balance reached @ ' + stopRunningDate
                            tradingSystem.errors.push([tradingSystem.id, errorMessage])
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[WARN] runSimulation -> checkMinimunAndMaximunBalance -> ' + errorMessage) }
                            return false
                        }
                    }

                    if (sessionParameters.sessionQuotedAsset.config.minimumBalance !== undefined) {
                        if (tradingEngine.current.episode.episodeQuotedAsset.balance.value <= sessionParameters.sessionQuotedAsset.config.minimumBalance) {
                            const errorMessage = 'Min Balance reached @ ' + stopRunningDate
                            tradingSystem.errors.push([tradingSystem.id, errorMessage])
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[WARN] runSimulation -> checkMinimunAndMaximunBalance -> ' + errorMessage) }
                            return false
                        }
                    }

                    if (sessionParameters.sessionQuotedAsset.config.maximumBalance !== undefined) {
                        if (tradingEngine.current.episode.episodeQuotedAsset.balance.value >= sessionParameters.sessionQuotedAsset.config.maximumBalance) {
                            const errorMessage = 'Max Balance reached @ ' + stopRunningDate
                            tradingSystem.errors.push([tradingSystem.id, errorMessage])
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[WARN] runSimulation -> checkMinimunAndMaximunBalance -> ' + errorMessage) }
                            return false
                        }
                    }

                }
                return true
            }
        } catch (err) {
            logger.write(MODULE_NAME, '[ERROR] runSimulation -> err = ' + err.stack)
            throw(global.DEFAULT_FAIL_RESPONSE)  
        }
    }
}

