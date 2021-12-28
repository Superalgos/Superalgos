exports.newSimulationFunctionLibrariesSimulationFunctions = function () {
    /*
    This module contains the functions that are used at Simulations.
    */
    const MODULE_NAME = "Simulation Functions"

    let thisObject = {
        createInfoMessage: createInfoMessage,
        checkIfWeNeedToStopTheSimulation: checkIfWeNeedToStopTheSimulation,
        checkIfWeNeedToStopAfterBothCycles: checkIfWeNeedToStopAfterBothCycles,
        setCurrentCandle: setCurrentCandle,
        syncronizeLoopCandleEntryPortfolioManager: syncronizeLoopCandleEntryPortfolioManager,
        syncronizeLoopCandleExitPortfolioManager: syncronizeLoopCandleExitPortfolioManager,
        syncronizeLoopIncomingSignals: syncronizeLoopIncomingSignals,
        syncronizeLoopOutgoingSignals: syncronizeLoopOutgoingSignals,
        setUpCandles: setUpCandles,
        setUpInitialCandles: setUpInitialCandles,
        closeEpisode: closeEpisode,
        updateEpisode: updateEpisode,
        heartBeat: heartBeat,
        positionDataStructuresAtCurrentCandle: positionDataStructuresAtCurrentCandle,
        checkInitialDatetime: checkInitialDatetime,
        checkNextCandle: checkNextCandle,
        checkFinalDatetime: checkFinalDatetime
    }

    return thisObject

    function createInfoMessage(
        system,
        candleIndex,
        cycle,
        processIndex
    ) {
        let infoMessage = 'Processing candle # ' + candleIndex + ' @ the ' + cycle + ' cycle.'
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
            '[INFO] runSimulation -> loop -> ' + infoMessage)

        let docs = {
            project: 'Foundations',
            category: 'Topic',
            type: 'TS LF Trading Bot Info - Candle And Cycle',
            placeholder: {}
        }

        let contextInfo = {
            candleIndex: candleIndex,
            cycle: cycle
        }
        TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

        system.addInfo([system.id, infoMessage, docs])
    }

    function checkIfWeNeedToStopTheSimulation(
        episodeModuleObject,
        sessionParameters,
        episode,
        processIndex
    ) {
        if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING === true) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this session.')
            TS.projects.simulation.functionLibraries.simulationFunctions.updateEpisode(episodeModuleObject, 'Session Stopped')
            return true
        }

        if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this task.')
            TS.projects.simulation.functionLibraries.simulationFunctions.updateEpisode(episodeModuleObject, 'Task Stopped')
            return true
        }

        if (TS.projects.simulation.functionLibraries.simulationFunctions.checkFinalDatetime(episode, sessionParameters, processIndex) === false) {
            TS.projects.simulation.functionLibraries.simulationFunctions.closeEpisode(episodeModuleObject, 'Final Datetime Reached')
            TS.projects.foundations.functionLibraries.sessionFunctions.stopSession(processIndex, 'Final Datetime Reached')
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[IMPORTANT] runSimulation -> Final Datetime Reached. Stopping the Session now. ')
            return true
        }
        return false
    }

    function checkIfWeNeedToStopAfterBothCycles(episodeModuleObject, episode, sessionParameters, candles, processIndex) {
        if (TS.projects.simulation.functionLibraries.simulationFunctions.checkNextCandle(episode, sessionParameters, candles, processIndex) === false) {
            TS.projects.simulation.functionLibraries.simulationFunctions.updateEpisode(episodeModuleObject, 'All Candles Processed')
            return true
        }
        return false
    }

    function setCurrentCandle(
        episodeCandle,
        candles,
        index,
        processIndex
    ) {
        episodeCandle.index.value = index
        /* This is the current candle the Simulation is working at. */
        let candle = candles[episodeCandle.index.value]
        /*
        Logging abount the current candle
        */
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
            '[INFO] runSimulation -> loop -> Candle Begin @ ' + (new Date(candle.begin)).toUTCString())
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
            '[INFO] runSimulation -> loop -> Candle End @ ' + (new Date(candle.end)).toUTCString())

        /*
        We move the current candle we are standing at, to the engine data structure
        to make it available to anyone, including conditions and formulas.
        */
        TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).ENGINE_MODULE_OBJECT.setCurrentCandle(candle)

        return candle
    }

    async function syncronizeLoopCandleEntryPortfolioManager(
        portfolioManagerClientModuleObject,
        system,
        candle
    ) {
        if (
            system.portfolioManagedSystem !== undefined
        ) {
            /*
            This means that the user that defined the Trading System, wants it to be
            managed by a Portfolio Manager Bot and that means that both simulations 
            needs to be syncronized.

            We will loop here because the trading bot could start before the Portfolio
            Bot, which means that we will request for permission over and over until
            we get it.
            */
            while (true) {
                let reponse = await portfolioManagerClientModuleObject.candleEntry(
                    candle
                )
                if (reponse.status !== 'Ok') {
                    /*
                    This means that we need to wait for Portfolio Manager to be available and
                    give us permission to continue.
                    */
                    await SA.projects.foundations.utilities.asyncFunctions.sleep(50)
                } else {
                    break
                }
            }
        }
    }

    async function syncronizeLoopCandleExitPortfolioManager(
        portfolioManagerClientModuleObject,
        system,
        candle
    ) {
        if (
            system.portfolioManagedSystem !== undefined
        ) {
            /*
            Report to Portfolio Manager that we are exiting this candle.
            */
            await portfolioManagerClientModuleObject.candleExit(
                candle
            )
        }
    }

    async function syncronizeLoopIncomingSignals(
        incomingTradingSignalsModuleObject,
        system
    ) {
        /*
        Incoming Signals
        */
        if (
            system.incomingSignals !== undefined &&
            system.incomingSignals.incomingSignalReferences !== undefined &&
            system.incomingSignals.incomingSignalReferences.length > 0
        ) {
            /*
            This means that the user that defined the Trading System, wants it to be
            syncronized by signals comming from other bots.

            Check for the signal that would allow us to syncronize the simulation
            loop with the simulation loop of the bot sending us signals.
            */
            while (true) {
                let signals = await incomingTradingSignalsModuleObject.getAllSignals(
                    system
                )
                let signal = signals[0]
                if (signal === undefined) {
                    /*
                    This means that the signal we are waiting for has not yet arrived, so
                    we are going to wait for one second and check it again.
                    */
                    await SA.projects.foundations.utilities.asyncFunctions.sleep(500)
                } else {
                    break
                }
            }
        }
    }

    async function syncronizeLoopOutgoingSignals(
        outgoingTradingSignalsModuleObject,
        system,
        candle
    ) {
        /*
        Outgoing Episode Syncronization Signal Sent before breaking the loop.
        */
        await outgoingTradingSignalsModuleObject.broadcastSignal(
            system,
            undefined
        )
        /*
        Mantain Signal Storage.
        */
        if (TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS !== undefined) {
            TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS.incomingCandleSignals.mantain(candle)
        }
    }

    function setUpInitialCandles(
        sessionParameters,
        candleIndex,
        candles,
        processIndex
    ) {
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
            initialCandle = candleIndex
        }
        return initialCandle
    }

    function setUpCandles(
        sessionParameters,
        chart,
        processDate,
        processIndex
    ) {
        /* 
        Setting up the candles array: The whole simulation is based on the array of 
        candles at the time-frame defined at the session parameters. 
        */
        let propertyName = 'at' + sessionParameters.timeFrame.config.label.replace('-', '')
        let candles = chart[propertyName].candles

        if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).ARE_WE_PROCESSING_DAILY_FILES) {
            /*
            We need to purge from the candles array all the candles from the previous day
            that comes when processing daily files.
            */
            let dailyCandles = []
            for (let i = 0; i < candles.length; i++) {
                let candle = candles[i]
                if (
                    candle.begin
                    >=
                    processDate
                ) {
                    dailyCandles.push(candle)
                }
            }
            candles = dailyCandles
        } else {
            candles = chart[propertyName].candles
        }
        return candles
    }

    function closeEpisode(episodeModuleObject, exitType) {
        episodeModuleObject.updateExitType(exitType)
        episodeModuleObject.closeEpisode()
    }

    function updateEpisode(episodeModuleObject, exitType) {
        episodeModuleObject.updateExitType(exitType)
    }

    function heartBeat(
        sessionParameters,
        episodeCandle,
        heartbeat,
        processIndex
    ) {
        let hartbeatText = ''
        if (sessionParameters.heartbeats !== undefined) {
            if (sessionParameters.heartbeats.config.date === true || sessionParameters.heartbeats.config.candleIndex === true) {
                /* We will produce a simulation level heartbeat in order to inform the user this is running. */

                heartbeat.currentDate = new Date(
                    Math.trunc(
                        episodeCandle.begin.value /
                        SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                    ) *
                    SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                )

                let fromDate = new Date(sessionParameters.timeRange.config.initialDatetime)
                let lastDate = new Date(sessionParameters.timeRange.config.finalDatetime)

                let currentDateString = heartbeat.currentDate.getUTCFullYear() + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(heartbeat.currentDate.getUTCMonth() + 1, 2) + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(heartbeat.currentDate.getUTCDate(), 2)
                let currentDate = new Date(heartbeat.currentDate)
                let percentage = TS.projects.foundations.utilities.dateTimeFunctions.getPercentage(fromDate, currentDate, lastDate)
                /*
                There are a few tasks that we need to do only when the date changes,
                otherwise it would be suboptimal.
                */
                if (heartbeat.currentDate.valueOf() !== heartbeat.previousDate) {
                    heartbeat.previousDate = heartbeat.currentDate.valueOf()

                    let processingDate = heartbeat.currentDate.getUTCFullYear() + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(heartbeat.currentDate.getUTCMonth() + 1, 2) + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(heartbeat.currentDate.getUTCDate(), 2)

                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                        MODULE_NAME,
                        '[INFO] loop -> Simulation ' +
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY +
                        ' Loop # ' +
                        episodeCandle.index.value +
                        ' @ ' +
                        processingDate
                    )

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
                    hartbeatText = hartbeatText + ' Candle # ' + episodeCandle.index.value
                    TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, hartbeatText, percentage)
                }
            }
        }
    }

    function positionDataStructuresAtCurrentCandle(
        episodeCandle,
        exchange,
        processIndex
    ) {
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

            /* Finding the Current Element on Daily Files */
            if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).ARE_WE_PROCESSING_DAILY_FILES) {
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

            /* Finding the Current Element At Single Files */
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

        function getElement(pArray, datasetName) {
            if (pArray === undefined) { return }
            try {
                let element
                for (let i = 0; i < pArray.length; i++) {
                    element = pArray[i]

                    if (episodeCandle.end.value === element.end) { // when there is an exact match at the end we take that element
                        return element
                    } else {
                        if (
                            i > 0 &&
                            element.end > episodeCandle.end.value
                        ) {
                            let previousElement = pArray[i - 1]
                            if (previousElement.end < episodeCandle.end.value) {
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
                    '[ERROR] getElement -> datasetName = ' + datasetName)
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    '[ERROR] getElement -> err = ' + err.stack)
                throw (TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
            }
        }
    }

    function checkNextCandle(
        episode,
        sessionParameters,
        candles,
        processIndex
    ) {
        /*
        We need to check that the candle we have just processed it is not the last candle.
        The candle at the head of the market is already skipped from the loop because it has not closed yet.
        Note: for Daily Files, this means that the last candle of each day will never be processed.

        The first +1 is because array indexes are based on 0.
        The second +1 is because we need to compare the next candle (remember that the loops always avoid the
        last candle of the dataset available.)
        */
        if (episode.candle.index.value + 1 + 1 === candles.length) {
            /*
            When processing daily files, we need a mechanism to turn from one day to the next one.
            That mechanism is the one implemented here. If we detect that the next candle is the last candle of
            the day, we will advance current process day one day. By doing so, during the next execution, the
            simulation will receive the candles and indicators files of the next day.
            */
            let candlesPerDay = SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS / sessionParameters.timeFrame.config.value
            if (
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).ARE_WE_PROCESSING_DAILY_FILES &&
                episode.candle.index.value + 1 + 1 === candlesPerDay
            ) {
                /*
                Here we found that the next candle of the dataset is the last candle of the day.
                It is time to move to the next day so as to receive at the next execution, the indicator files from
                the next day. At the same time we will reset the index to be pointing to
                the first candle of the new dataset we shall receive. The first candle of the next day starts
                at index 0, so we will position the index now at zero.
                */
                episode.candle.index.value = 0
                episode.processDate.value =
                    episode.processDate.value + SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                return false
            }

            /*
            We reached the head of the market but we are not at the last candle of a day during
            Daily Files processing. We will advance to the next candle index anyways because in the
            next execution it will likely have more candles at the dataset. And if it does not,
            it will just wait there until it does.
            */
            episode.headOfTheMarket.value = true
            episode.candle.index.value++
            return false
        } else {
            /* Wd did not reach the head of the market */
            episode.headOfTheMarket.value = false
            episode.candle.index.value++
            return true
        }
    }

    function checkInitialDatetime(
        sessionParameters,
        episode,
        candle,
        processIndex
    ) {
        /* 
        Here we check that the current candle is not before the initial 
        datetime defined at the session parameters. 
        */
        if (episode.candle.end.value < sessionParameters.timeRange.config.initialDatetime) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] checkInitialAndFinalDatetime -> Skipping Candle before the sessionParameters.timeRange.config.initialDatetime.')
            return false
        } else {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] runSimulation -> loop -> Candle Before the Initial Date Time @ ' + (new Date(candle.begin)).toUTCString())
            return true
        }
    }

    function checkFinalDatetime(
        episode,
        sessionParameters,
        processIndex
    ) {
        /* Here we check that the next candle is not after of the user-defined final datetime at the session parameters. */
        if (episode.candle.begin.value + sessionParameters.timeFrame.config.value > sessionParameters.timeRange.config.finalDatetime) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] checkInitialAndFinalDatetime -> Skipping Candle after the sessionParameters.timeRange.config.finalDatetime.')
            return false
        }
        return true
    }
}