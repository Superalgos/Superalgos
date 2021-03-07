exports.newSuperalgosBotModulesTradingOutput = function (processIndex) {
    /*
    This module will load if necesary all the data outputs so that they can be appended with new
    records if needed. After running the simulation, it will save all the data outputs.
    */
    const MODULE_NAME = 'Trading Output'

    let thisObject = {
        start: start
    }

    return thisObject

    async function start(
        chart,
        market,
        exchange,
        timeFrame,
        timeFrameLabel,
        tradingProcessDate
    ) {
        try {
            let fileStorage = TS.projects.superalgos.taskModules.fileStorage.newFileStorage(processIndex)

            if (timeFrame > TS.projects.superalgos.globals.timeFrames.dailyFilePeriods()[0][0]) {
                TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_PROCESSING_DAILY_FILES = false
            } else {
                TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_PROCESSING_DAILY_FILES = true
            }

            /* Preparing everything for the Simulation */
            let tradingSimulationModuleObject = TS.projects.superalgos.botModules.tradingSimulation.newSuperalgosBotModulesTradingSimulation(processIndex)

            let outputDatasets = TS.projects.superalgos.utilities.nodeFunctions.nodeBranchToArray(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset')
            let outputDatasetsMap = new Map()

            await TS.projects.superalgos.functionLibraries.outputManagementFunctions.readFiles(
                processIndex,
                outputDatasets,
                outputDatasetsMap,
                timeFrameLabel,
                tradingProcessDate,
                fileStorage,
                TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine.tradingCurrent.tradingEpisode.headOfTheMarket.value
            )

            await tradingSimulationModuleObject.runSimulation(
                chart,
                market,
                exchange,
                outputDatasetsMap,
                writeOutputFiles
            )

            tradingSimulationModuleObject.finalize()
            return

            function writeOutputFiles() {
                TS.projects.superalgos.functionLibraries.outputManagementFunctions.writeFiles(
                    processIndex,
                    outputDatasets,
                    outputDatasetsMap,
                    timeFrameLabel,
                    tradingProcessDate,
                    fileStorage
                )
            }

        } catch (err) {
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[ERROR] start -> err = ' + err.stack)
            throw (TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }
}

