exports.newMachineLearningBotModulesLearningSimulation = function (processIndex) {
    /*
    This Module represents the learning simulation. Essentially a loop through a set of candles and 
    the execution at each loop cycle of the Learning System Protocol.
    */
    const MODULE_NAME = 'Learning Simulation -> ' + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.name

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
            let learningSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningSystem
            let learningEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningEngine
            let sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters

            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] runSimulation -> initialDatetime = ' + sessionParameters.timeRange.config.initialDatetime)
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] runSimulation -> finalDatetime = ' + sessionParameters.timeRange.config.finalDatetime)

            /* These are the Modules we will need to run the Simulation */
            let learningRecordsModuleObject = TS.projects.machineLearning.botModules.learningRecords.newMachineLearningBotModulesLearningRecords(processIndex)
            learningRecordsModuleObject.initialize(outputDatasetsMap)

            let learningSystemModuleObject = TS.projects.machineLearning.botModules.learningSystem.newMachineLearningBotModulesLearningSystem(processIndex)
            learningSystemModuleObject.initialize()

            /*
            Here we will figure out if we need to load the model from disk, or we will just
            start a new one. 
            */
            if (learningEngine.learningCurrent.learningEpisode.headOfTheMarket.value === true) {
                /*
                At the head of the market we always load the model from disk.
                */
                await learningSystemModuleObject.loadModel()

            } else {
                if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_PROCESSING_DAILY_FILES === true) {
                    /*
                    For Daily Files, we are going to load the model from disk at the first execution
                    (first day) only if the user used the Session Resume option. We will load it from 
                    disk at every subsequent day, so as to continue with the training from the previous 
                    days.
                    */
                    if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_FIRST_LOOP === true) {
                        if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_RESUMING === true) {
                            await learningSystemModuleObject.loadModel()
                        }                        
                    } else {
                        await learningSystemModuleObject.loadModel()
                    }
                } else {
                    /*
                    For Market Files, we are only going to load the model from this and continue the
                    training it already has when the user resumes the training session. If the user
                    runs the training session, we will not load from disk, but create a new empty model
                    instead.
                    */
                    if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_RESUMING === true) {
                        await learningSystemModuleObject.loadModel()
                    }
                }
            }

            let learningEpisodeModuleObject = TS.projects.machineLearning.botModules.learningEpisode.newMachineLearningBotModulesLearningEpisode(processIndex)
            learningEpisodeModuleObject.initialize()

            /* Setting up the candles array: The whole simulation is based on the array of candles at the time-frame defined at the session parameters. */
            let propertyName = 'at' + sessionParameters.timeFrame.config.label.replace('-', '')
            let candles = chart[propertyName].candles

            if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_PROCESSING_DAILY_FILES) {
                /*
                We need to purge from the candles array all the candles from the previous day 
                that comes when processing daily files.
                */
                let dailyCandles = []
                for (let i = 0; i < candles.length; i++) {
                    let candle = candles[i]
                    if (candle.begin >= TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningEngine.learningCurrent.learningEpisode.processDate.value) {
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
                    TS.projects.foundations.functionLibraries.sessionFunctions.stopSession(processIndex, 'Data is not up-to-date enough. Please start the Masters Data Mining Operation.')
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[IMPORTANT] runSimulation -> Data is not up-to-date enough. Stopping the Session now. ')
                    return
                }

            } else {
                /* 
                In this case we already have at the last candle index the next candle to be
                processed. We will just continue with this candle.
                */
                initialCandle = learningEngine.learningCurrent.learningEpisode.candle.index.value
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
            learningEngine.learningCurrent.learningEpisode.headOfTheMarket.value = true
            /*
            This is the main simulation loop. It will go through the initial candle
            until one less than the last candle available. We will never process the last
            candle available since it is not considered a closed candle, but a candle
            that still can change. So effectively will be processing all closed candles. 
            */
            for (let i = initialCandle; i < candles.length - 1; i++) {
                learningEngine.learningCurrent.learningEpisode.candle.index.value = i

                /* This is the current candle the Simulation is working at. */
                let candle = candles[learningEngine.learningCurrent.learningEpisode.candle.index.value]

                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    '[INFO] runSimulation -> loop -> Candle Begin @ ' + (new Date(candle.begin)).toUTCString())
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    '[INFO] runSimulation -> loop -> Candle End @ ' + (new Date(candle.end)).toUTCString())

                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).LEARNING_ENGINE_MODULE_OBJECT.setCurrentCandle(candle) // We move the current candle we are standing at, to the learning engine data structure to make it available to anyone, including conditions and formulas.

                /* We emit a heart beat so that the UI can know where we are at the overall process. */
                heartBeat()

                /* Opening the Episode, if needed. */
                learningEpisodeModuleObject.openEpisode()
                
                // Skipping current loop if we are before initial candle:
                if (checkInitialDatetime() === false) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[INFO] runSimulation -> loop -> Candle Before the Initial Date Time @ ' + (new Date(candle.begin)).toUTCString())
                    continue
                }

                positionDataStructuresAtCurrentCandle()

                /* The chart was recalculated based on the current candle. */
                learningSystemModuleObject.updateChart(
                    chart,
                    exchange,
                    market
                )

                /* 
                Do the stuff needed previous to the run like 
                Episode Counters and Statistics update. Maintenance is done
                once per simulation candle.
                */
                learningSystemModuleObject.mantain() /* ***NOTE*** Currently empty */
                learningEpisodeModuleObject.mantain()
                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).LEARNING_ENGINE_MODULE_OBJECT.mantain()

                /* Run the Learning System: */
                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).LEARNING_ENGINE_MODULE_OBJECT.setCurrentCycle('First')
                await runCycle()

                /* 
                We check if we need to stop before appending the records so that the stop 
                reason is also properly recorded.
                */
                checkIfWeNeedToStopBetweenCycles()

                /* Add new records to the process output */
                learningRecordsModuleObject.appendRecords()

                if (breakLoop === true) { break }

                checkIfWeNeedToStopAfterBothCycles()

                if (breakLoop === true) { break }


                async function runCycle() {
                    /* Reset Data Structures */
                    learningSystemModuleObject.reset()
                    learningEpisodeModuleObject.reset()
                    TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).LEARNING_ENGINE_MODULE_OBJECT.reset()

                    let infoMessage = 'Processing candle # ' + learningEngine.learningCurrent.learningEpisode.candle.index.value + ' @ the ' + learningEngine.learningCurrent.learningEpisode.cycle.value + ' cycle.'
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[INFO] runSimulation -> loop -> ' + infoMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Learning Bot Info - Candle And Cycle',
                        placeholder: {}
                    }

                    contextInfo = {
                        candleIndex: learningEngine.learningCurrent.learningEpisode.candle.index.value,
                        cycle: learningEngine.learningCurrent.learningEpisode.cycle.value
                    }
                    TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                    learningSystem.addInfo([learningSystem.id, infoMessage, docs])

                    await learningSystemModuleObject.run()
                }

                function checkIfWeNeedToStopBetweenCycles() {
                    if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING === true) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            '[INFO] runSimulation -> controlLoop -> We are going to stop here because we were requested to stop processing this session.')
                        updateEpisode('Session Stopped')
                        breakLoop = true
                        return
                    }

                    if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            '[INFO] runSimulation -> controlLoop -> We are going to stop here because we were requested to stop processing this task.')
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
                }

                function checkIfWeNeedToStopAfterBothCycles() {
                    if (checkNextCandle() === false) {
                        updateEpisode('All Candles Processed')
                        breakLoop = true
                        return
                    }
                }
            }

            await learningSystemModuleObject.saveModel()

            learningSystemModuleObject.finalize()
            learningRecordsModuleObject.finalize()
            learningEpisodeModuleObject.finalize()

            learningSystemModuleObject = undefined
            learningRecordsModuleObject = undefined
            learningEpisodeModuleObject = undefined

            await writeFiles()

            function closeEpisode(exitType) {
                learningEpisodeModuleObject.updateExitType(exitType)
                learningEpisodeModuleObject.closeEpisode()
            }

            function updateEpisode(exitType) {
                learningEpisodeModuleObject.updateExitType(exitType)
            }

            function heartBeat() {
                let hartbeatText = ''
                if (sessionParameters.heartbeats !== undefined) {
                    if (sessionParameters.heartbeats.config.date === true || sessionParameters.heartbeats.config.candleIndex === true) {
                        /* We will produce a simulation level heartbeat in order to inform the user this is running. */

                        heartBeatDate = new Date(Math.trunc(learningEngine.learningCurrent.learningEpisode.candle.begin.value / SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS) * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS)

                        let fromDate = new Date(sessionParameters.timeRange.config.initialDatetime)
                        let lastDate = new Date(sessionParameters.timeRange.config.finalDatetime)

                        let currentDateString = heartBeatDate.getUTCFullYear() + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(heartBeatDate.getUTCMonth() + 1, 2) + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(heartBeatDate.getUTCDate(), 2)
                        let currentDate = new Date(heartBeatDate)
                        let percentage = TS.projects.foundations.utilities.dateTimeFunctions.getPercentage(fromDate, currentDate, lastDate)
                        /*
                        There are a few tasks that we need to do only when the date changes,
                        otherwise it would be suboptimal.
                        */
                        if (heartBeatDate.valueOf() !== previousHeartBeatDate) {
                            previousHeartBeatDate = heartBeatDate.valueOf()

                            let processingDate = heartBeatDate.getUTCFullYear() + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(heartBeatDate.getUTCMonth() + 1, 2) + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(heartBeatDate.getUTCDate(), 2)

                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                '[INFO] runSimulation -> loop -> Simulation ' + TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY + ' Loop # ' + learningEngine.learningCurrent.learningEpisode.candle.index.value + ' @ ' + processingDate)

                            /*  Logging to console and disk */
                            if (TS.projects.foundations.utilities.dateTimeFunctions.areTheseDatesEqual(currentDate, new Date()) === false) {
                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.newInternalLoop(currentDate, percentage)
                            }

                            /* Date only heartbeat */
                            if (sessionParameters.heartbeats.config.date === true && sessionParameters.heartbeats.config.candleIndex === false) {
                                hartbeatText = hartbeatText + currentDateString
                                TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, hartbeatText, percentage)
                                return
                            }
                        }

                        /* 
                        When the Candle Index needs to be shown, then we can not send the heartbeat
                        only when the dates changes, we have to send it for every candle.
                        It might also contain the date information.
                        */
                        if (sessionParameters.heartbeats.config.candleIndex === true) {
                            if (sessionParameters.heartbeats.config.date === true) {
                                hartbeatText = hartbeatText + currentDateString
                            }
                            hartbeatText = hartbeatText + ' Candle # ' + learningEngine.learningCurrent.learningEpisode.candle.index.value
                            TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, hartbeatText, percentage)
                        }
                    }
                }
            }

            function positionDataStructuresAtCurrentCandle() {
                /*
                In conditions and Formulas, we want users to have an easy syntax to refer to indicators. In order to achieve that, we need the user to have
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
                    let dataDependencies = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies, 'Data Dependency')
                    dataDependencies = SA.projects.visualScripting.utilities.nodeFunctions.filterOutNodeWihtoutReferenceParentFromNodeArray(dataDependencies)

                    /* Finding the Current Element on Market Files */
                    if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_PROCESSING_DAILY_FILES) {
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

                        if (learningEngine.learningCurrent.learningEpisode.candle.end.value === element.end) { // when there is an exact match at the end we take that element
                            return element
                        } else {
                            if (
                                i > 0 &&
                                element.end > learningEngine.learningCurrent.learningEpisode.candle.end.value
                            ) {
                                let previousElement = pArray[i - 1]
                                if (previousElement.end < learningEngine.learningCurrent.learningEpisode.candle.end.value) {
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
                The second +1 is because we need to compare the next candle (remember that the loops always avoid the
                last candle of the dataset available.)
                */
                if (learningEngine.learningCurrent.learningEpisode.candle.index.value + 1 + 1 === candles.length) {
                    /*
                    When processing daily files, we need a mechanism to turn from one day to the next one.
                    That mechanism is the one implemented here. If we detect that the next candle is the last candle of 
                    the day, we will advance current process day one day. By doing so, during the next execution, the
                    simulation will receive the candles and indicators files of the next day. 
                    */
                    let candlesPerDay = SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS / sessionParameters.timeFrame.config.value
                    if (
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_PROCESSING_DAILY_FILES &&
                        learningEngine.learningCurrent.learningEpisode.candle.index.value + 1 + 1 === candlesPerDay
                    ) {
                        /*
                        Here we found that the next candle of the dataset is the last candle of the day.
                        It is time to move to the next day so as to receive at the next execution, the indicator files from 
                        the next day. At the same time we will reset the index to be pointing to
                        the first candle of the new dataset we shall receive. The first candle of the next day starts
                        at index 0, so we will position the index now at zero.
                        */
                        learningEngine.learningCurrent.learningEpisode.candle.index.value = 0
                        learningEngine.learningCurrent.learningEpisode.processDate.value =
                            learningEngine.learningCurrent.learningEpisode.processDate.value + SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                        return false
                    }

                    /* 
                    We reached the head of the market but we are not at the last candle of a day during 
                    Daily Files processing. We will advance to the next candle index anyways because in the 
                    next execution it will likely have more candles at the dataset. And if it does not, 
                    it will just wait there until it does.
                    */
                    learningEngine.learningCurrent.learningEpisode.headOfTheMarket.value = true
                    learningEngine.learningCurrent.learningEpisode.candle.index.value++
                    return false
                } else {

                    /* Wd did not reach the head of the market */
                    learningEngine.learningCurrent.learningEpisode.headOfTheMarket.value = false
                    learningEngine.learningCurrent.learningEpisode.candle.index.value++
                    return true
                }
            }

            function checkInitialDatetime() {
                /* Here we check that the current candle is not before the initial datetime defined at the session parameters.*/
                if (learningEngine.learningCurrent.learningEpisode.candle.end.value < sessionParameters.timeRange.config.initialDatetime) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[INFO] runSimulation -> checkInitialAndFinalDatetime -> Skipping Candle before the sessionParameters.timeRange.config.initialDatetime.')
                    return false
                }
                return true
            }

            function checkFinalDatetime() {
                /* Here we check that the next candle is not after of the user-defined final datetime at the session parameters.*/
                if (learningEngine.learningCurrent.learningEpisode.candle.begin.value + sessionParameters.timeFrame.config.value > sessionParameters.timeRange.config.finalDatetime) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[INFO] runSimulation -> checkInitialAndFinalDatetime -> Skipping Candle after the sessionParameters.timeRange.config.finalDatetime.')
                    return false
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