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
    let portfolioManagerClientModuleObject
    let tradingEngineModuleObject

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

        portfolioManagerClientModuleObject = TS.projects.portfolioManagement.modules.portfolioManagerClient.newPortfolioManagementModulesPortfolioManagerClient(processIndex)
        portfolioManagerClientModuleObject.initialize()

        /* This object is already initialized */
        tradingEngineModuleObject = TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).ENGINE_MODULE_OBJECT
    }

    function finalize() {
        tradingSystemModuleObject.finalize()
        tradingRecordsModuleObject.finalize()
        tradingEpisodeModuleObject.finalize()
        incomingTradingSignalsModuleObject.finalize()
        outgoingTradingSignalsModuleObject.finalize()
        portfolioManagerClientModuleObject.finalize()

        tradingSystem = undefined
        tradingEngine = undefined
        sessionParameters = undefined

        tradingRecordsModuleObject = undefined
        tradingSystemModuleObject = undefined
        tradingEpisodeModuleObject = undefined
        incomingTradingSignalsModuleObject = undefined
        outgoingTradingSignalsModuleObject = undefined
        portfolioManagerClientModuleObject = undefined
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

            let candles = TS.projects.simulation.functionLibraries.simulationFunctions.setUpCandles(
                sessionParameters,
                chart,
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine.tradingCurrent.tradingEpisode.processDate.value,
                processIndex
            )
            let initialCandle = TS.projects.simulation.functionLibraries.simulationFunctions.setUpInitialCandles(
                sessionParameters,
                tradingEngine.tradingCurrent.tradingEpisode.candle.index.value,
                candles,
                processIndex
            )
            /*
            Main Simulation Loop
 
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
 
                /* Next Candle */
                let candle = TS.projects.simulation.functionLibraries.simulationFunctions.setCurrentCandle(
                    tradingEngine.tradingCurrent.tradingEpisode.candle,
                    candles,
                    i,
                    processIndex
                )
                /* Signals */
                await TS.projects.simulation.functionLibraries.simulationFunctions.syncronizeLoopIncomingSignals(
                    incomingTradingSignalsModuleObject,
                    tradingSystem
                )
                /* Portfolio Manager */
                await TS.projects.simulation.functionLibraries.simulationFunctions.syncronizeLoopCandleEntryPortfolioManager(
                    portfolioManagerClientModuleObject,
                    tradingSystem,
                    candle,
                    processIndex
                )
                /* We emit a heart beat so that the UI can now where we are at the overall process. */
                TS.projects.simulation.functionLibraries.simulationFunctions.heartBeat(
                    sessionParameters,
                    tradingEngine.tradingCurrent.tradingEpisode.candle,
                    heartbeat,
                    processIndex
                )
                /* Opening the Episode, if needed. */
                tradingEpisodeModuleObject.openEpisode()
                /* Initial Datetime Check */
                if (TS.projects.simulation.functionLibraries.simulationFunctions.checkInitialDatetime(
                    sessionParameters,
                    tradingEngine.tradingCurrent.tradingEpisode,
                    candle,
                    processIndex
                ) === false) { continue }
                /* Positioning Data Structure */
                TS.projects.simulation.functionLibraries.simulationFunctions.positionDataStructuresAtCurrentCandle(
                    tradingEngine.tradingCurrent.tradingEpisode.candle,
                    exchange,
                    processIndex
                )
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
                tradingEngineModuleObject.mantain()
                /*
                Run the first cycle of the Trading System. In this first cycle we
                give some room so that orders can be canceled or filled and we can
                write those records into the output memory. During this cycle new
                orders can not be created, since otherwise the could be cancelled at
                the second cycle without spending real time at the order book.
                */
                await runCycle('First')
                /*
                We check if we need to stop before appending the records so that the stop
                reason is also properly recorded. Note also that we check this after the first
                cycle, where orders have not been submitted to the exchange yet, but we
                had the chance to check for the status of placed orders or even cancel
                the ones that needed cancellation.
                */
                let breakLoop = TS.projects.simulation.functionLibraries.simulationFunctions.earlyCheckIfWeNeedToStopTheSimulation(
                    tradingEpisodeModuleObject,
                    sessionParameters,
                    tradingEngine.tradingCurrent.tradingEpisode,
                    processIndex
                )

                if (breakLoop === false) {
                    breakLoop = TS.projects.algorithmicTrading.functionLibraries.tradingFunctions.earlyCheckIfWeNeedToStopTheSimulation(
                        tradingEpisodeModuleObject,
                        sessionParameters,
                        tradingSystem,
                        tradingEngine,
                        processIndex
                    )
                }

                /* Add new records to the process output */
                tradingRecordsModuleObject.appendRecords()

                if (breakLoop === true) {
                    /*
                    Outgoing Signals
                    */
                    await TS.projects.simulation.functionLibraries.simulationFunctions.syncronizeLoopOutgoingSignals(
                        outgoingTradingSignalsModuleObject,
                        tradingSystem,
                        candle
                    )
                    /*
                    Checkout at Portfolio Manager
                    */
                    await TS.projects.simulation.functionLibraries.simulationFunctions.syncronizeLoopCandleExitPortfolioManager(
                        portfolioManagerClientModuleObject,
                        tradingSystem,
                        tradingEngine,
                        candle
                    )
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
                await runCycle('Second')
                /*
                Outgoing Signals
                */
                await TS.projects.simulation.functionLibraries.simulationFunctions.syncronizeLoopOutgoingSignals(
                    outgoingTradingSignalsModuleObject,
                    tradingSystem,
                    candle
                )
                /*
                Checkout at Portfolio Manager
                */
                await TS.projects.simulation.functionLibraries.simulationFunctions.syncronizeLoopCandleExitPortfolioManager(
                    portfolioManagerClientModuleObject,
                    tradingSystem,
                    tradingEngine,
                    candle
                )
                /*
                Check if we need to stop.
                */
                breakLoop = TS.projects.simulation.functionLibraries.simulationFunctions.laterCheckIfWeNeedToStopTheSimulation(
                    tradingEpisodeModuleObject,
                    tradingEngine.tradingCurrent.tradingEpisode,
                    sessionParameters,
                    candles,
                    processIndex
                )

                /* Add new records to the process output */
                tradingRecordsModuleObject.appendRecords()

                if (breakLoop === true) { break }

                async function runCycle(cycleName) {
                    tradingEngineModuleObject.setCurrentCycle(cycleName)
                    /* Reset Data Structures */
                    tradingSystemModuleObject.reset()
                    tradingEpisodeModuleObject.reset()
                    tradingEngineModuleObject.reset()

                    TS.projects.simulation.functionLibraries.simulationFunctions.createInfoMessage(
                        tradingSystem,
                        tradingEngine.tradingCurrent.tradingEpisode.candle.index.value,
                        tradingEngine.tradingCurrent.tradingEpisode.cycle.value,
                        processIndex
                    )

                    await tradingSystemModuleObject.run()
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
