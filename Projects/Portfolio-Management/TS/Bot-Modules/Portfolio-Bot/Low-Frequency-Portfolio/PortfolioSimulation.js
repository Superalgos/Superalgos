exports.newPortfolioManagementBotModulesPortfolioSimulation = function (processIndex) {
    /*
    This Module represents the portfolio simulation. Essentially a loop through a set of candles and
    the execution at each loop cycle of the Portfolio System Protocol.
    */
    const MODULE_NAME = 'Portfolio Simulation -> ' + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].session.name

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        runSimulation: runSimulation
    }

    let portfolioSystem
    let portfolioEngine
    let sessionParameters

    /* These are the Modules we will need to run the Simulation */
    let portfolioRecordsModuleObject
    let portfolioSystemModuleObject
    let portfolioEpisodeModuleObject
    let portfolioEngineModuleObject
    let portfolioManagedTradingBotsModuleObject

    /* Events Interface */
    let eventsInterfaceModuleObject

    return thisObject

    function initialize(outputDatasetsMap) {
        portfolioSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioSystem
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters

        portfolioRecordsModuleObject = TS.projects.portfolioManagement.botModules.portfolioRecords.newPortfolioManagementBotModulesPortfolioRecords(processIndex)
        portfolioRecordsModuleObject.initialize(outputDatasetsMap)

        portfolioSystemModuleObject = TS.projects.portfolioManagement.botModules.portfolioSystem.newPortfolioManagementBotModulesPortfolioSystem(processIndex)
        portfolioSystemModuleObject.initialize()

        portfolioEpisodeModuleObject = TS.projects.portfolioManagement.botModules.portfolioEpisode.newPortfolioManagementBotModulesPortfolioEpisode(processIndex)
        portfolioEpisodeModuleObject.initialize()

        portfolioManagedTradingBotsModuleObject = TS.projects.portfolioManagement.botModules.portfolioManagedTradingBots.newPortfolioManagementBotModulesPortfolioManagedTradingBots(processIndex)
        portfolioManagedTradingBotsModuleObject.initialize()

        /* This object is already initialized */
        portfolioEngineModuleObject = TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).ENGINE_MODULE_OBJECT

        /* Event Interface */
        eventsInterfaceModuleObject = TS.projects.portfolioManagement.modules.portfolioManagerEventsInterface.newPortfolioManagementModulesPortfolioManagerEventsInterface(processIndex)
        eventsInterfaceModuleObject.initialize(portfolioManagedTradingBotsModuleObject, portfolioSystemModuleObject)
    }

    function finalize() {
        portfolioSystemModuleObject.finalize()
        portfolioRecordsModuleObject.finalize()
        portfolioEpisodeModuleObject.finalize()
        portfolioManagedTradingBotsModuleObject.finalize()
        eventsInterfaceModuleObject.finalize()

        portfolioSystem = undefined
        portfolioEngine = undefined
        sessionParameters = undefined

        portfolioRecordsModuleObject = undefined
        portfolioSystemModuleObject = undefined
        portfolioEpisodeModuleObject = undefined
        eventsInterfaceModuleObject = undefined
        portfolioManagedTradingBotsModuleObject = undefined
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
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine.portfolioCurrent.portfolioEpisode.processDate.value,
                processIndex
            )
            let initialCandle = TS.projects.simulation.functionLibraries.simulationFunctions.setUpInitialCandles(
                sessionParameters,
                portfolioEngine.portfolioCurrent.portfolioEpisode.candle.index.value,
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
            portfolioEngine.portfolioCurrent.portfolioEpisode.headOfTheMarket.value = true
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
                    portfolioEngine.portfolioCurrent.portfolioEpisode.candle,
                    candles,
                    i,
                    processIndex
                )
                /* We emit a heart beat so that the UI can now where we are at the overall process. */
                TS.projects.simulation.functionLibraries.simulationFunctions.heartBeat(
                    sessionParameters,
                    portfolioEngine.portfolioCurrent.portfolioEpisode.candle,
                    heartbeat,
                    processIndex
                )
                /* Opening the Episode, if needed. */
                portfolioEpisodeModuleObject.openEpisode()
                /* Initial Datetime Check */
                if (TS.projects.simulation.functionLibraries.simulationFunctions.checkInitialDatetime(
                    sessionParameters,
                    portfolioEngine.portfolioCurrent.portfolioEpisode,
                    candle,
                    processIndex
                ) === false) { continue }
                /* Positioning Data Structure */
                TS.projects.simulation.functionLibraries.simulationFunctions.positionDataStructuresAtCurrentCandle(
                    portfolioEngine.portfolioCurrent.portfolioEpisode.candle,
                    exchange,
                    processIndex
                )
                /* The chart was recalculated based on the current candle. */
                portfolioSystemModuleObject.updateChart(
                    chart,
                    exchange,
                    market
                )
                await portfolioEngineModuleObject.updateExchangeAssets()
                /*
                Do the stuff needed previous to the run like
                Episode Counters and Statistics update. Maintenance is done
                once per simulation candle.
                */
                portfolioSystemModuleObject.maintain()
                portfolioEpisodeModuleObject.maintain()
                portfolioEngineModuleObject.maintain()

                /* Reset Data Structures */
                portfolioSystemModuleObject.reset()
                portfolioEpisodeModuleObject.reset()
                portfolioEngineModuleObject.reset()

                TS.projects.simulation.functionLibraries.simulationFunctions.createInfoMessage(
                    portfolioSystem,
                    portfolioEngine.portfolioCurrent.portfolioEpisode.candle.index.value,
                    portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.value,
                    processIndex
                )
                /*
                Run the Portfolio System logic.
                */
                await portfolioSystemModuleObject.run()
                portfolioSystemModuleObject.runUserDefinedCode('first');
                /*
                Managed Trading Bots
                */
                await portfolioManagedTradingBotsModuleObject.waitForManagedTradingBotsToAskTheirQuestions()
                portfolioManagedTradingBotsModuleObject.moveTradingEnginesIntoPortfolioEngine()
                portfolioSystemModuleObject.runUserDefinedCode('last');
                /*
                We check if we need to stop before appending the records so that the stop
                reason is also properly recorded. 
                */
                let breakLoop = TS.projects.simulation.functionLibraries.simulationFunctions.earlyCheckIfWeNeedToStopTheSimulation(
                    portfolioEpisodeModuleObject,
                    sessionParameters,
                    portfolioEngine.portfolioCurrent.portfolioEpisode,
                    processIndex
                )
                /*
                Check if we need to stop.
                */
                if (breakLoop === false) {
                    breakLoop = TS.projects.simulation.functionLibraries.simulationFunctions.laterCheckIfWeNeedToStopTheSimulation(
                        portfolioEpisodeModuleObject,
                        portfolioEngine.portfolioCurrent.portfolioEpisode,
                        sessionParameters,
                        candles,
                        processIndex
                    )
                }
                /* Add new records to the process output */
                portfolioRecordsModuleObject.appendRecords()

                if (breakLoop === true) {
                    break
                }
            }
            /*
            To Measure the Loop Duration
            */
            let finalTime = (new Date()).valueOf()
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[INFO] runSimulation -> Portfolio Simulation ran in ' + (finalTime - initialTime) / 1000 + ' seconds.')

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[ERROR] runSimulation -> err = ' + err.stack)
            throw (TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }
}
