exports.newPortfolioManagementBotModulesPortfolioSimulation = function (processIndex) {
    /*
    This Module represents the portfolio simulacion. Escentially a loop through a set of candles and 
    the execution at each loop cycle of the Portfolio System Protocol.
    */
    const MODULE_NAME = 'Portfolio Simulation -> ' + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.name

    let thisObject = {
        finalize: finalize,
        runSimulation: runSimulation
    }
    return thisObject

    function finalize() {
        thisObject = undefined
    }

    async function runSimulation(
        chart,
        market,
        exchange,
        outputDatasetsMap,
        writeFiles,
    ) {
        try {

            let portfolioSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioSystem
            let portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
            let sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters

            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] runSimulation -> initialDatetime = ' + sessionParameters.timeRange.config.initialDatetime)
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] runSimulation -> finalDatetime = ' + sessionParameters.timeRange.config.finalDatetime)

            /* These are the Modules we will need to run the Simulation */
            let portfolioRecordsModuleObject = TS.projects.portfolioManagement.botModules.portfolioRecords.newPortfolioManagementBotModulesPortfolioRecords(processIndex)
            portfolioRecordsModuleObject.initialize(outputDatasetsMap)

            let portfolioSystemModuleObject = TS.projects.portfolioManagement.botModules.portfolioSystem.newPortfolioManagementBotModulesPortfolioSystem(processIndex)
            portfolioSystemModuleObject.initialize()

            let portfolioEpisodeModuleObject = TS.projects.portfolioManagement.botModules.portfolioEpisode.newPortfolioManagementBotModulesPortfolioEpisode(processIndex)
            portfolioEpisodeModuleObject.initialize()

            /* Setting up the candles array: The whole simulation is based on the array of candles at the time-frame defined at the session parameters. */
            let propertyName = 'at' + sessionParameters.timeFrame.config.label.replace('-', '')
            let candles = chart[propertyName].candles

            if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_PROCESSING_DAILY_FILES) {
                /*
                We need to purge from the candles array all the candles from the previous day 
                that comes when processing daily files.
                */
                let dailyCandles = []
                for (let i = 0; i < candles.length; i++) {
                    let candle = candles[i]
                    if (candle.begin >= TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine.portfolioCurrent.portfolioEpisode.processDate.value) {
                        dailyCandles.push(candle)
                    }
                }
                candles = dailyCandles
            } else {
                candles = chart[propertyName].candles
            }

            /* Variables needed for heartbeat functionality */
            let heartBeatDate
            let previousHeartBeatDate
            /*
            Estimation of the Initial Candle to Process in this Run.
            */
            let initialCandle
            if (
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_FIRST_LOOP === true &&
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_RESUMING === false) {

                /* Estimate Initial Candle based on the timeRange configured for the session. */
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
                    console.log('DEBUGGING ..................', initialCandle, candles.length)
                    TS.projects.foundations.functionLibraries.sessionFunctions.stopSession(processIndex, 'Data is not up-to-date enough. Please start the Data Mining Operation.')
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[IMPORTANT] runSimulation -> Data is not up-to-date enough. Stopping the Session now. ')
                    return
                }

            } else {
                /* 
                In this case we already have at the last candle index the next candle to be
                processed. We will just continue with this candle.
                */
                initialCandle = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.index.value
            }
            /*
            Main Simulation Loop
            */
            /* We are going to use this to exit the loop if needed. */
            let breakLoop = false

            /* 
            We will assume that we are at the head of the market here. We do this
            because the loop could be empty and no validation is going to run. If the 
            loop is not empty, then the lascCandle() check will override this value
            depending on if we really are at the head of the market or not.
            */
            portfolioEngine.portfolioCurrent.portfolioEpisode.headOfTheMarket.value = true
            /*
            This is the main simulation loop. It will go through the initial candle
            until one less than the last candle available. We will never process the last
            candle available since it is not considered a closed candle, but a candle
            that still can change. So effectively will be processing all closed candles. 
            */
            for (let i = initialCandle; i < candles.length - 1; i++) {
                portfolioEngine.portfolioCurrent.portfolioEpisode.candle.index.value = i

                /* This is the current candle the Simulation is working at. */
                let candle = candles[portfolioEngine.portfolioCurrent.portfolioEpisode.candle.index.value]

                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    '[INFO] runSimulation -> loop -> Candle Begin @ ' + (new Date(candle.begin)).toUTCString())
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    '[INFO] runSimulation -> loop -> Candle End @ ' + (new Date(candle.end)).toUTCString())

                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.setCurrentCandle(candle) // We move the current candle we are standing at, to the portfolio engine data structure to make it available to anyone, including conditions and formulas.

                /* We emit a heart beat so that the UI can now where we are at the overal process.*/
                heartBeat()

                /* Opening the Episode, if needed. */
                portfolioEpisodeModuleObject.openEpisode()

                if (checkInitialDatetime() === false) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[INFO] runSimulation -> loop -> Candle Before the Initia Date Time @ ' + (new Date(candle.begin)).toUTCString())
                    continue
                }

                positionDataStructuresAtCurrentCandle()

                /* The chart was recalculated based on the current candle. */
                portfolioSystemModuleObject.updateChart(
                    chart,
                    exchange,
                    market
                )

                /* 
                Do the stuff needed previous to the run like 
                Episode Counters and Statistics update. Mantaince is done
                once per simulation candle.
                */
                portfolioSystemModuleObject.mantain()
                portfolioEpisodeModuleObject.mantain()
                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.mantain()

                /* 
                Run the first cycle of the Portfolio System. In this first cycle we
                give some room so that orders can be canceled or filled and we can
                write those records into the output memory. During this cycle new
                orders can not be created, since otherwise the could be cancelled at
                the second cycle without spending real time at the order book.
                */
                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.setCurrentCycle('First')
                await runCycle()

                /* 
                We check if we need to stop before appending the records so that the stop 
                reason is also propery recorded. Note also that we check this after the first
                cycle, where orders have not been submitted to the exchange yet, but we
                had the chance to check for the status of placed orders or even cancel 
                the ones that needed cancellation.
                */
                checkIfWeNeedToStopBetweenCycles()

                /* Add new records to the process output */
                portfolioRecordsModuleObject.appendRecords()

                if (breakLoop === true) { break }
                /* 
                Run the second cycle of the Portfolio System. During this second run
                some new orders might be created at slots freed up during the first 
                run. This allows for example for a Limit Order to be cancelled during the 
                first run, and the same Limit Order definition to spawn a new order 
                without the need to wait until the next candle. Orders can not be cancelled
                during the second cycle.
                */
                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.setCurrentCycle('Second')
                await runCycle()

                checkIfWeNeedToStopAfterBothCycles()

                /* Add new records to the process output */
                portfolioRecordsModuleObject.appendRecords()

                if (breakLoop === true) { break }

                async function runCycle() {
                    /* Reset Data Structures */
                    portfolioSystemModuleObject.reset()
                    portfolioEpisodeModuleObject.reset()
                    TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.reset()

                    let infoMessage = 'Processing candle # ' + portfolioEngine.portfolioCurrent.portfolioEpisode.candle.index.value + ' @ the ' + portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.value + ' cycle.'
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[INFO] runSimulation -> loop -> ' + infoMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Portfolio Bot Info - Candle And Cycle',
                        placeholder: {}
                    }

                    contextInfo = {
                        candleIndex: portfolioEngine.portfolioCurrent.portfolioEpisode.candle.index.value,
                        cycle: portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.value
                    }
                    TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                    portfolioSystem.addInfo([portfolioSystem.id, infoMessage, docs])

                    await portfolioSystemModuleObject.run()
                }

                function checkIfWeNeedToStopBetweenCycles() {
                    if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING === true) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            '[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this session.')
                        updateEpisode('Session Stopped')
                        breakLoop = true
                        return
                    }

                    if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            '[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this task.')
                        updateEpisode('Task Stopped')
                        breakLoop = true
                        return
                    }

                    if (checkFinalDatetime() === false) {
                        closeEpisode('Final Datetime Reached')
                        breakLoop = true
                        TS.projects.foundations.functionLibraries.sessionFunctions.stopSession(processIndex, 'Final Datetime Reached')
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            '[IMPORTANT] runSimulation -> Final Datetime Reached. Stopping the Session now. ')
                        return
                    }

                    if (checkMinimunAndMaximunBalance() === false) {
                        closeEpisode('Min or Max Balance Reached')
                        breakLoop = true
                        TS.projects.foundations.functionLibraries.sessionFunctions.stopSession(processIndex, 'Min or Max Balance Reached')
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            '[IMPORTANT] runSimulation -> Min or Max Balance Reached. Stopping the Session now. ')
                        return
                    }
                }

                function checkIfWeNeedToStopAfterBothCycles() {
                    if (checkNextCandle() === false) {
                        updateEpisode('All Candles Processed')
                        breakLoop = true
                        return
                    }
                }
            }

            portfolioSystemModuleObject.finalize()
            portfolioRecordsModuleObject.finalize()
            portfolioEpisodeModuleObject.finalize()

            portfolioSystemModuleObject = undefined
            portfolioRecordsModuleObject = undefined
            portfolioEpisodeModuleObject = undefined

            await writeFiles()

            function closeEpisode(exitType) {
                portfolioEpisodeModuleObject.updateExitType(exitType)
                portfolioEpisodeModuleObject.closeEpisode()
            }

            function updateEpisode(exitType) {
                portfolioEpisodeModuleObject.updateExitType(exitType)
            }

            function heartBeat() {
                let hartbeatText = ''
                if (sessionParameters.heartbeats !== undefined) {
                    if (sessionParameters.heartbeats.config.date === true || sessionParameters.heartbeats.config.candleIndex === true) {
                        /* We will produce a simulation level heartbeat in order to inform the user this is running. */

                        heartBeatDate = new Date(Math.trunc(portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value / SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS) * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS + SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS)

                        let fromDate = new Date(sessionParameters.timeRange.config.initialDatetime)
                        let lastDate = new Date(sessionParameters.timeRange.config.finalDatetime)

                        let currentDateString = heartBeatDate.getUTCFullYear() + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(heartBeatDate.getUTCMonth() + 1, 2) + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(heartBeatDate.getUTCDate(), 2)
                        let currentDate = new Date(heartBeatDate)
                        let percentage = TS.projects.foundations.utilities.dateTimeFunctions.getPercentage(fromDate, currentDate, lastDate)
                        /*
                        Theere are a few tasks that we need to do only when the date changes,
                        otherwise it would be suboptimal.
                        */
                        if (heartBeatDate.valueOf() !== previousHeartBeatDate) {
                            previousHeartBeatDate = heartBeatDate.valueOf()

                            let processingDate = heartBeatDate.getUTCFullYear() + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(heartBeatDate.getUTCMonth() + 1, 2) + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(heartBeatDate.getUTCDate(), 2)

                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                '[INFO] runSimulation -> loop -> Simulation ' + TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY + ' Loop # ' + portfolioEngine.portfolioCurrent.portfolioEpisode.candle.index.value + ' @ ' + processingDate)

                            /*  Logging to console and disk */
                            if (TS.projects.foundations.utilities.dateTimeFunctions.areTheseDatesEqual(currentDate, new Date()) === false) {
                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.newInternalLoop(currentDate, percentage)
                            }

                            /* Date only hearbeat */
                            if (sessionParameters.heartbeats.config.date === true && sessionParameters.heartbeats.config.candleIndex === false) {
                                hartbeatText = hartbeatText + currentDateString
                                TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, hartbeatText, percentage)
                                return
                            }
                        }

                        /* 
                        When the Candle Index nees to be shown, then we can not send the hearbet
                        only when the dates changes, we have to send it for every candle.
                        It might also contain the date information.
                        */
                        if (sessionParameters.heartbeats.config.candleIndex === true) {
                            if (sessionParameters.heartbeats.config.date === true) {
                                hartbeatText = hartbeatText + currentDateString
                            }
                            hartbeatText = hartbeatText + ' Candle # ' + portfolioEngine.portfolioCurrent.portfolioEpisode.candle.index.value
                            TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, hartbeatText, percentage)
                        }
                    }
                }
            }

            function positionDataStructuresAtCurrentCandle() {
                /*
                In conditions and Formulas, we want users to have an easy sintax to refer to indicators. In order to achieve that, we need the user to have
                easy access to the current candle for instance, or the current bollinger band, meaning the one the Simulation is currently standing at.
                For that reason we do the following processing, to have at the chart data structure the current objects of each indicator / time frame.  
                */

                for (const exchangeCodeName in exchange) {
                    let currentExchange = exchange[exchangeCodeName]
                    for (const baseAssetCodeName in currentExchange.market) {
                        let currentBaseAsset = currentExchange.market[baseAssetCodeName]
                        for (const quotedAssetCodeName in currentBaseAsset) {
                            let currentQuotedAsset = currentBaseAsset[quotedAssetCodeName]
                            let currentChart = currentQuotedAsset.chart
                            positionChart(currentChart)
                        }
                    }
                }

                function positionChart(chart) {
                    let dataDependencies = TS.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies, 'Data Dependency')
                    dataDependencies = TS.projects.visualScripting.utilities.nodeFunctions.filterOutNodeWihtoutReferenceParentFromNodeArray(dataDependencies)

                    /* Finding the Current Element on Daily Files */
                    if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_PROCESSING_DAILY_FILES) {
                        for (let j = 0; j < TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray().length; j++) {
                            let mapKey = TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray()[j][1]
                            let propertyName = 'at' + mapKey.replace('-', '')
                            let thisChart = chart[propertyName]

                            if (thisChart === undefined) { continue }

                            for (let k = 0; k < dataDependencies.length; k++) {
                                let dataDependencyNode = dataDependencies[k]
                                if (dataDependencyNode.referenceParent.config.codeName !== 'Multi-Time-Frame-Daily') { continue }
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
                    for (let j = 0; j < TS.projects.foundations.globals.timeFrames.marketTimeFramesArray().length; j++) {
                        let mapKey = TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[j][1]
                        let propertyName = 'at' + mapKey.replace('-', '')
                        let thisChart = chart[propertyName]

                        if (thisChart === undefined) { continue }

                        for (let k = 0; k < dataDependencies.length; k++) {
                            let dataDependencyNode = dataDependencies[k]
                            if (dataDependencyNode.referenceParent.config.codeName !== 'Multi-Time-Frame-Market') { continue }
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

                    if (thisChart === undefined) { return }

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
            }

            function getElement(pArray, datasetName) {
                if (pArray === undefined) { return }
                try {
                    let element
                    for (let i = 0; i < pArray.length; i++) {
                        element = pArray[i]

                        if (portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value === element.end) { // when there is an exact match at the end we take that element
                            return element
                        } else {
                            if (
                                i > 0 &&
                                element.end > portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value
                            ) {
                                let previousElement = pArray[i - 1]
                                if (previousElement.end < portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value) {
                                    return previousElement // If one elements goes into the future of currentCandle, then we stop and take the previous element.
                                } else {
                                    return
                                }
                            }
                        }
                    }
                    return
                } catch (err) {
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[ERROR] runSimulation -> getElement -> datasetName = ' + datasetName)
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[ERROR] runSimulation -> getElement -> err = ' + err.stack)
                    throw (TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                }
            }

            function checkNextCandle() {
                /* 
                We need to check that the candle we have just processed it is not the last candle.
                The candle at the head of the market is already skipped from the loop because it has not closed yet. 
                Note: for Daily Files, this means that the last candle of each day will never be processed.

                The first +1 is because array indexes are based on 0. 
                The second +1 is because we need to compare the next candle (remember that the loops allways avoid the
                last candle of the dataset available.)
                */
                if (portfolioEngine.portfolioCurrent.portfolioEpisode.candle.index.value + 1 + 1 === candles.length) {
                    /*
                    When processing daily files, we need a mechanism to turn from one day to the next one.
                    That mechanism is the one implemented here. If we detect that the next candle is the last candle of 
                    the day, we will advance current process day one day. By doing so, during the next execution, the
                    simulation will receive the candles and indicators files of the next day. 
                    */
                    let candlesPerDay = SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS / sessionParameters.timeFrame.config.value
                    if (
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_PROCESSING_DAILY_FILES &&
                        portfolioEngine.portfolioCurrent.portfolioEpisode.candle.index.value + 1 + 1 === candlesPerDay
                    ) {
                        /*
                        Here we found that the next candle of the dataset is the last candle of the day.
                        It is time to move to the next day so as to receive at the next execution, the indicator files from 
                        the next day. At the same time we will reset the index to be pointing to
                        the first candle of the new dataset we shall receive. The first candle of the next day starts
                        at index 0, so we will position the index now at zero.
                        */
                        portfolioEngine.portfolioCurrent.portfolioEpisode.candle.index.value = 0
                        portfolioEngine.portfolioCurrent.portfolioEpisode.processDate.value =
                            portfolioEngine.portfolioCurrent.portfolioEpisode.processDate.value + SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                        return false
                    }

                    /* 
                    We reached the head of the market but we are not at the last candle of a day during 
                    Daily Files processing. We will advance to the next candle index anyways because in the 
                    next execution it will likely have more candles at the dataset. And if it does not, 
                    it will just wait there until it does.
                    */
                    portfolioEngine.portfolioCurrent.portfolioEpisode.headOfTheMarket.value = true
                    portfolioEngine.portfolioCurrent.portfolioEpisode.candle.index.value++
                    return false
                } else {

                    /* Wd did not reach the head of the market */
                    portfolioEngine.portfolioCurrent.portfolioEpisode.headOfTheMarket.value = false
                    portfolioEngine.portfolioCurrent.portfolioEpisode.candle.index.value++
                    return true
                }
            }

            function checkInitialDatetime() {
                /* Here we check that the current candle is not before the initial datetime defined at the session parameters.*/
                if (portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value < sessionParameters.timeRange.config.initialDatetime) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[INFO] runSimulation -> checkInitialAndFinalDatetime -> Skipping Candle before the sessionParameters.timeRange.config.initialDatetime.')
                    return false
                }
                return true
            }

            function checkFinalDatetime() {
                /* Here we check that the next candle is not after of the user-defined final datetime at the session parameters.*/
                if (portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value + sessionParameters.timeFrame.config.value > sessionParameters.timeRange.config.finalDatetime) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[INFO] runSimulation -> checkInitialAndFinalDatetime -> Skipping Candle after the sessionParameters.timeRange.config.finalDatetime.')
                    return false
                }
                return true
            }

            function checkMinimunAndMaximunBalance() {
                /* Checks for Minimun and Maximun Balance. We do the check while not inside any strategy only. */
                if (
                    portfolioEngine.portfolioCurrent.strategy.index.value === portfolioEngine.portfolioCurrent.strategy.index.config.initialValue
                ) {
                    /*
                    We will perform this check only when we are not inside a position,
                    because there the balances have shifted from their resting position.
                    */

                    let stopRunningDate = (new Date(portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value)).toUTCString()

                    if (sessionParameters.sessionBaseAsset.config.minimumBalance !== undefined) {
                        if (portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value <= sessionParameters.sessionBaseAsset.config.minimumBalance) {
                            const errorMessage = 'Min Balance reached @ ' + stopRunningDate

                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Portfolio Bot Error - Minimum Balance Reached',
                                placeholder: {}
                            }

                            let contextInfo = {
                                timestamp: stopRunningDate,
                                episodeBaseAssetBalance: portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value,
                                sessionBaseAssetMinimumBalance: sessionParameters.sessionBaseAsset.config.minimumBalance
                            }

                            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                            portfolioSystem.addError([portfolioSystem.id, errorMessage, docs])
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                '[WARN] runSimulation -> checkMinimunAndMaximunBalance -> ' + errorMessage)
                            return false
                        }
                    }

                    if (sessionParameters.sessionBaseAsset.config.maximumBalance !== undefined) {
                        if (portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value >= sessionParameters.sessionBaseAsset.config.maximumBalance) {
                            const errorMessage = 'Max Balance reached @ ' + stopRunningDate

                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Portfolio Bot Error - Maximum Balance Reached',
                                placeholder: {}
                            }

                            let contextInfo = {
                                timestamp: stopRunningDate,
                                episodeBaseAssetBalance: portfolioEngine.portfolioCurrent.portfolioEpisode.episodeBaseAsset.balance.value,
                                sessionBaseAssetMaximumBalance: sessionParameters.sessionBaseAsset.config.maximumBalance
                            }

                            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                            portfolioSystem.addError([portfolioSystem.id, errorMessage, docs])
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                '[WARN] runSimulation -> checkMinimunAndMaximunBalance -> ' + errorMessage)
                            return false
                        }
                    }

                    if (sessionParameters.sessionQuotedAsset.config.minimumBalance !== undefined) {
                        if (portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value <= sessionParameters.sessionQuotedAsset.config.minimumBalance) {
                            const errorMessage = 'Min Balance reached @ ' + stopRunningDate

                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Portfolio Bot Error - Minimum Balance Reached',
                                placeholder: {}
                            }

                            let contextInfo = {
                                timestamp: stopRunningDate,
                                episodeQuotedAssetBalance: portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value,
                                sessionQuotedAssetMinimumBalance: sessionParameters.sessionQuotedAsset.config.minimumBalance
                            }

                            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                            portfolioSystem.addError([portfolioSystem.id, errorMessage, docs])
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                '[WARN] runSimulation -> checkMinimunAndMaximunBalance -> ' + errorMessage)
                            return false
                        }
                    }

                    if (sessionParameters.sessionQuotedAsset.config.maximumBalance !== undefined) {
                        if (portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value >= sessionParameters.sessionQuotedAsset.config.maximumBalance) {
                            const errorMessage = 'Max Balance reached @ ' + stopRunningDate

                            let docs = {
                                project: 'Foundations',
                                category: 'Topic',
                                type: 'TS LF Portfolio Bot Error - Maximum Balance Reached',
                                placeholder: {}
                            }

                            let contextInfo = {
                                timestamp: stopRunningDate,
                                episodeQuotedAssetBalance: portfolioEngine.portfolioCurrent.portfolioEpisode.episodeQuotedAsset.balance.value,
                                sessionQuotedAssetMaximumBalance: sessionParameters.sessionQuotedAsset.config.maximumBalance
                            }

                            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                            portfolioSystem.addError([portfolioSystem.id, errorMessage, docs])
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                '[WARN] runSimulation -> checkMinimunAndMaximunBalance -> ' + errorMessage)
                            return false
                        }
                    }

                }
                return true
            }
        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[ERROR] runSimulation -> err = ' + err.stack)
            throw (TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }
}

