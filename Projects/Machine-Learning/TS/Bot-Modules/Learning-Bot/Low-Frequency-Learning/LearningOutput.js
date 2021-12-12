exports.newMachineLearningBotModulesLearningOutput = function (processIndex) {
    /*
    This module will load if necessary all the data outputs so that they can be appended with new
    records if needed. After running the simulation, it will save all the data outputs.
    */
    const MODULE_NAME = 'Learning Output'

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
        learningProcessDate
    ) {
        try {
            let fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex)

            if (timeFrame > TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray()[0][0]) {
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_PROCESSING_DAILY_FILES = false
            } else {
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_PROCESSING_DAILY_FILES = true
            }

            /* Preparing everything for the Simulation */
            let learningSimulationModuleObject = TS.projects.machineLearning.botModules.learningSimulation.newMachineLearningBotModulesLearningSimulation(processIndex)

            let outputDatasets = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset')
            let outputDatasetsMap = new Map()

            await TS.projects.foundations.functionLibraries.outputManagementFunctions.readFiles(
                processIndex,
                outputDatasets,
                outputDatasetsMap,
                timeFrameLabel,
                learningProcessDate,
                fileStorage,
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningEngine.learningCurrent.learningEpisode.headOfTheMarket.value
            )

            await learningSimulationModuleObject.runSimulation(
                chart,
                market,
                exchange,
                outputDatasetsMap,
                writeOutputFiles
            )

            learningSimulationModuleObject.finalize()
            return

            function writeOutputFiles() {
                TS.projects.foundations.functionLibraries.outputManagementFunctions.writeFiles(
                    processIndex,
                    outputDatasets,
                    outputDatasetsMap,
                    timeFrameLabel,
                    learningProcessDate,
                    fileStorage
                )
            }

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[ERROR] start -> err = ' + err.stack)
            throw (TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }
}