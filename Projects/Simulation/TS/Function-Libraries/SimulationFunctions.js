exports.newSimulationFunctionLibrariesSimulationFunctions = function () {
    /*
    This module contains the functions that are used at Simulations.
    */
    const MODULE_NAME = "Simulation"

    let thisObject = {
        closeEpisode: closeEpisode,
        updateEpisode: updateEpisode,
        heartBeat: heartBeat,
        positionDataStructuresAtCurrentCandle: positionDataStructuresAtCurrentCandle,
        checkNextCandle: checkNextCandle,
        checkInitialDatetime: checkInitialDatetime,
        checkFinalDatetime: checkFinalDatetime
    }

    return thisObject

    function closeEpisode(episodeModuleObject, exitType) {
        episodeModuleObject.updateExitType(exitType)
        episodeModuleObject.closeEpisode()
    }

    function updateEpisode(episodeModuleObject, exitType) {
        episodeModuleObject.updateExitType(exitType)
    }

    function heartBeat(sessionParameters, engine, heartbeat, processIndex) {
        let hartbeatText = ''
        if (sessionParameters.heartbeats !== undefined) {
            if (sessionParameters.heartbeats.config.date === true || sessionParameters.heartbeats.config.candleIndex === true) {
                /* We will produce a simulation level heartbeat in order to inform the user this is running. */

                heartbeat.currentDate = new Date(
                    Math.trunc(
                        engine.tradingCurrent.tradingEpisode.candle.begin.value /
                        SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                    ) *
                    SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS +
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

                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[INFO] runSimulation -> loop -> Simulation ' + TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY + ' Loop # ' + engine.tradingCurrent.tradingEpisode.candle.index.value + ' @ ' + processingDate)

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
                    hartbeatText = hartbeatText + ' Candle # ' + engine.tradingCurrent.tradingEpisode.candle.index.value
                    TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, hartbeatText, percentage)
                }
            }
        }
    }

    function positionDataStructuresAtCurrentCandle(engine, exchange, processIndex) {
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

                    if (engine.tradingCurrent.tradingEpisode.candle.end.value === element.end) { // when there is an exact match at the end we take that element
                        return element
                    } else {
                        if (
                            i > 0 &&
                            element.end > engine.tradingCurrent.tradingEpisode.candle.end.value
                        ) {
                            let previousElement = pArray[i - 1]
                            if (previousElement.end < engine.tradingCurrent.tradingEpisode.candle.end.value) {
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
    }

    function checkNextCandle(engine, sessionParameters, candles, processIndex) {
        /*
        We need to check that the candle we have just processed it is not the last candle.
        The candle at the head of the market is already skipped from the loop because it has not closed yet.
        Note: for Daily Files, this means that the last candle of each day will never be processed.

        The first +1 is because array indexes are based on 0.
        The second +1 is because we need to compare the next candle (remember that the loops always avoid the
        last candle of the dataset available.)
        */
        if (engine.tradingCurrent.tradingEpisode.candle.index.value + 1 + 1 === candles.length) {
            /*
            When processing daily files, we need a mechanism to turn from one day to the next one.
            That mechanism is the one implemented here. If we detect that the next candle is the last candle of
            the day, we will advance current process day one day. By doing so, during the next execution, the
            simulation will receive the candles and indicators files of the next day.
            */
            let candlesPerDay = SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS / sessionParameters.timeFrame.config.value
            if (
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_PROCESSING_DAILY_FILES &&
                engine.tradingCurrent.tradingEpisode.candle.index.value + 1 + 1 === candlesPerDay
            ) {
                /*
                Here we found that the next candle of the dataset is the last candle of the day.
                It is time to move to the next day so as to receive at the next execution, the indicator files from
                the next day. At the same time we will reset the index to be pointing to
                the first candle of the new dataset we shall receive. The first candle of the next day starts
                at index 0, so we will position the index now at zero.
                */
                engine.tradingCurrent.tradingEpisode.candle.index.value = 0
                engine.tradingCurrent.tradingEpisode.processDate.value =
                    engine.tradingCurrent.tradingEpisode.processDate.value + SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                return false
            }

            /*
            We reached the head of the market but we are not at the last candle of a day during
            Daily Files processing. We will advance to the next candle index anyways because in the
            next execution it will likely have more candles at the dataset. And if it does not,
            it will just wait there until it does.
            */
            engine.tradingCurrent.tradingEpisode.headOfTheMarket.value = true
            engine.tradingCurrent.tradingEpisode.candle.index.value++
            return false
        } else {
            /* Wd did not reach the head of the market */
            engine.tradingCurrent.tradingEpisode.headOfTheMarket.value = false
            engine.tradingCurrent.tradingEpisode.candle.index.value++
            return true
        }
    }

    function checkInitialDatetime(sessionParameters, engine, processIndex) {
        /* Here we check that the current candle is not before the initial datetime defined at the session parameters. */
        if (engine.tradingCurrent.tradingEpisode.candle.end.value < sessionParameters.timeRange.config.initialDatetime) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] runSimulation -> checkInitialAndFinalDatetime -> Skipping Candle before the sessionParameters.timeRange.config.initialDatetime.')
            return false
        }
        return true
    }

    function checkFinalDatetime(engine, sessionParameters, processIndex) {
        /* Here we check that the next candle is not after of the user-defined final datetime at the session parameters. */
        if (engine.tradingCurrent.tradingEpisode.candle.begin.value + sessionParameters.timeFrame.config.value > sessionParameters.timeRange.config.finalDatetime) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] runSimulation -> checkInitialAndFinalDatetime -> Skipping Candle after the sessionParameters.timeRange.config.finalDatetime.')
            return false
        }
        return true
    }
}