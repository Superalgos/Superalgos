exports.newAlgorithmicTradingBotModulesTradingSimulation = function (processIndex) {
    /*
    This Module represents the trading simulation. Essentially a loop through a set of candles and
    the execution at each loop cycle of the Trading System Protocol.
    */
    const MODULE_NAME = 'Trading Simulation -> ' + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.name

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        runSimulation: runSimulation
    }

    let tradingSystem
    let tradingEngine
    let sessionParameters

    /* These are the Modules we will need to run the Simulation */
    let tradingRecordsModuleObject
    let tradingSystemModuleObject
    let tradingEpisodeModuleObject
    let incomingTradingSignalsModuleObject
    let outgoingTradingSignalsModuleObject

    return thisObject

    function initialize(outputDatasetsMap) {
        tradingSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        tradingEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters

        tradingRecordsModuleObject = TS.projects.algorithmicTrading.botModules.tradingRecords.newAlgorithmicTradingBotModulesTradingRecords(processIndex)
        tradingRecordsModuleObject.initialize(outputDatasetsMap)

        tradingSystemModuleObject = TS.projects.algorithmicTrading.botModules.tradingSystem.newAlgorithmicTradingBotModulesTradingSystem(processIndex)
        tradingSystemModuleObject.initialize()

        tradingEpisodeModuleObject = TS.projects.algorithmicTrading.botModules.tradingEpisode.newAlgorithmicTradingBotModulesTradingEpisode(processIndex)
        tradingEpisodeModuleObject.initialize()

        incomingTradingSignalsModuleObject = TS.projects.tradingSignals.modules.incomingTradingSignals.newTradingSignalsModulesIncomingTradingSignals(processIndex)
        incomingTradingSignalsModuleObject.initialize()

        outgoingTradingSignalsModuleObject = TS.projects.tradingSignals.modules.outgoingTradingSignals.newTradingSignalsModulesOutgoingTradingSignals(processIndex)
        outgoingTradingSignalsModuleObject.initialize()
    }

    function finalize() {
        tradingSystemModuleObject.finalize()
        tradingRecordsModuleObject.finalize()
        tradingEpisodeModuleObject.finalize()
        incomingTradingSignalsModuleObject.finalize()
        outgoingTradingSignalsModuleObject.finalize()

        tradingSystem = undefined
        tradingEngine = undefined
        sessionParameters = undefined

        tradingRecordsModuleObject = undefined
        tradingSystemModuleObject = undefined
        tradingEpisodeModuleObject = undefined
        incomingTradingSignalsModuleObject = undefined
        outgoingTradingSignalsModuleObject = undefined
    }

    async function runSimulation(
        chart,
        market,
        exchange
    ) {
        try {
            /* Object needed for heartbeat functionality */
            let heartbeat = {
                currentDate: undefined,
                previousDate: undefined
            }
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] runSimulation -> initialDatetime = ' + sessionParameters.timeRange.config.initialDatetime)
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] runSimulation -> finalDatetime = ' + sessionParameters.timeRange.config.finalDatetime)

            let candles = TS.projects.simulation.functionLibraries.simulationFunctions.setUpCandles(sessionParameters, chart, processIndex)
            let initialCandle = TS.projects.simulation.functionLibraries.simulationFunctions.setUpInitialCandles(sessionParameters, tradingEngine, candles, processIndex)
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
            tradingEngine.tradingCurrent.tradingEpisode.headOfTheMarket.value = true
            /*
            To Measure the Loop Duration
            */
            let initialTime = (new Date()).valueOf()
            /*
            This is the main simulation loop. It will go through the initial candle
            until one less than the last candle available. We will never process the last
            candle available since it is not considered a closed candle, but a candle
            that still can change. So effectively will be processing all closed candles.
            */
            for (let i = initialCandle; i < candles.length - 1; i++) {

                let candle = TS.projects.simulation.functionLibraries.simulationFunctions.setCurrentCandle(tradingEngine, candles, i, processIndex)
                /*
                We move the current candle we are standing at, to the trading engine data structure
                to make it available to anyone, including conditions and formulas.
                */
                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.setCurrentCandle(candle)

                await TS.projects.simulation.functionLibraries.simulationFunctions.syncronizeLoopWithSignals(tradingSystem)

                /* We emit a heart beat so that the UI can now where we are at the overall process. */
                TS.projects.simulation.functionLibraries.simulationFunctions.heartBeat(sessionParameters, tradingEngine, heartbeat, processIndex)

                /* Opening the Episode, if needed. */
                tradingEpisodeModuleObject.openEpisode()

                if (TS.projects.simulation.functionLibraries.simulationFunctions.checkInitialDatetime(sessionParameters, tradingEngine, processIndex) === false) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[INFO] runSimulation -> loop -> Candle Before the Initial Date Time @ ' + (new Date(candle.begin)).toUTCString())
                    continue
                }

                TS.projects.simulation.functionLibraries.simulationFunctions.positionDataStructuresAtCurrentCandle(tradingEngine, exchange, processIndex)

                /* The chart was recalculated based on the current candle. */
                tradingSystemModuleObject.updateChart(
                    chart,
                    exchange,
                    market
                )

                /*
                Do the stuff needed previous to the run like
                Episode Counters and Statistics update. Maintenance is done
                once per simulation candle.
                */
                tradingSystemModuleObject.mantain()
                tradingEpisodeModuleObject.mantain()
                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.mantain()

                /*
                Run the first cycle of the Trading System. In this first cycle we
                give some room so that orders can be canceled or filled and we can
                write those records into the output memory. During this cycle new
                orders can not be created, since otherwise the could be cancelled at
                the second cycle without spending real time at the order book.
                */
                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.setCurrentCycle('First')
                await runCycle()

                /*
                We check if we need to stop before appending the records so that the stop
                reason is also properly recorded. Note also that we check this after the first
                cycle, where orders have not been submitted to the exchange yet, but we
                had the chance to check for the status of placed orders or even cancel
                the ones that needed cancellation.
                */
                checkIfWeNeedToStopBetweenCycles()

                /* Add new records to the process output */
                tradingRecordsModuleObject.appendRecords()

                if (breakLoop === true) {
                    /*
                    Outgoing Episode Syncronization Signal Sent before breaking the loop.
                    */
                    await outgoingTradingSignalsModuleObject.broadcastSignal(
                        tradingSystem,
                        undefined
                    )
                    /*
                    Mantain Signal Storage.
                    */
                    if (TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS !== undefined) {
                        TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS.incomingCandleSignals.mantain(candle)
                    }
                    break
                }
                /*
                Run the second cycle of the Trading System. During this second run
                some new orders might be created at slots freed up during the first
                run. This allows for example for a Limit Order to be cancelled during the
                first run, and the same Limit Order definition to spawn a new order
                without the need to wait until the next candle. Orders can not be cancelled
                during the second cycle.
                */
                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.setCurrentCycle('Second')
                await runCycle()
                /*
                Outgoing Episode Syncronization Signal Sent at the end of both cycles.
                */
                await outgoingTradingSignalsModuleObject.broadcastSignal(
                    tradingSystem,
                    undefined
                )
                /*
                Mantain Signal Storage.
                */
                if (TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS !== undefined) {
                    TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS.incomingCandleSignals.mantain(candle)
                }
                /*
                Check if we need to stop.
                */
                checkIfWeNeedToStopAfterBothCycles()

                /* Add new records to the process output */
                tradingRecordsModuleObject.appendRecords()

                if (breakLoop === true) { break }

                async function runCycle() {
                    /* Reset Data Structures */
                    tradingSystemModuleObject.reset()
                    tradingEpisodeModuleObject.reset()
                    TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.reset()

                    let infoMessage = 'Processing candle # ' + tradingEngine.tradingCurrent.tradingEpisode.candle.index.value + ' @ the ' + tradingEngine.tradingCurrent.tradingEpisode.cycle.value + ' cycle.'
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[INFO] runSimulation -> loop -> ' + infoMessage)

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Trading Bot Info - Candle And Cycle',
                        placeholder: {}
                    }

                    contextInfo = {
                        candleIndex: tradingEngine.tradingCurrent.tradingEpisode.candle.index.value,
                        cycle: tradingEngine.tradingCurrent.tradingEpisode.cycle.value
                    }
                    TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                    tradingSystem.addInfo([tradingSystem.id, infoMessage, docs])

                    await tradingSystemModuleObject.run()
                }

                function checkIfWeNeedToStopBetweenCycles() {
                    if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_STOPPING === true) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            '[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this session.')
                        TS.projects.simulation.functionLibraries.simulationFunctions.updateEpisode(tradingEpisodeModuleObject, 'Session Stopped')
                        breakLoop = true
                        return
                    }

                    if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            '[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this task.')
                        TS.projects.simulation.functionLibraries.simulationFunctions.updateEpisode(tradingEpisodeModuleObject, 'Task Stopped')
                        breakLoop = true
                        return
                    }

                    if (TS.projects.simulation.functionLibraries.simulationFunctions.checkFinalDatetime(tradingEngine, sessionParameters, processIndex) === false) {
                        TS.projects.simulation.functionLibraries.simulationFunctions.closeEpisode(tradingEpisodeModuleObject, 'Final Datetime Reached')
                        breakLoop = true
                        TS.projects.foundations.functionLibraries.sessionFunctions.stopSession(processIndex, 'Final Datetime Reached')
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            '[IMPORTANT] runSimulation -> Final Datetime Reached. Stopping the Session now. ')
                        return
                    }

                    if (TS.projects.algorithmicTrading.functionLibraries.tradingFunctions.checkMinimunAndMaximunBalance(sessionParameters, tradingSystem, tradingEngine, processIndex) === false) {
                        TS.projects.simulation.functionLibraries.simulationFunctions.closeEpisode(tradingEpisodeModuleObject, 'Min or Max Balance Reached')
                        breakLoop = true
                        TS.projects.foundations.functionLibraries.sessionFunctions.stopSession(processIndex, 'Min or Max Balance Reached')
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            '[IMPORTANT] runSimulation -> Min or Max Balance Reached. Stopping the Session now. ')
                        return
                    }
                }

                function checkIfWeNeedToStopAfterBothCycles() {
                    if (TS.projects.simulation.functionLibraries.simulationFunctions.checkNextCandle(tradingEngine, sessionParameters, candles, processIndex) === false) {
                        TS.projects.simulation.functionLibraries.simulationFunctions.updateEpisode(tradingEpisodeModuleObject, 'All Candles Processed')
                        breakLoop = true
                        return
                    }
                }
            }
            /*
            To Measure the Loop Duration
            */
            let finalTime = (new Date()).valueOf()
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] runSimulation -> Trading Simulation ran in ' + (finalTime - initialTime) / 1000 + ' seconds.')

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[ERROR] runSimulation -> err = ' + err.stack)
            throw (TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }
}
