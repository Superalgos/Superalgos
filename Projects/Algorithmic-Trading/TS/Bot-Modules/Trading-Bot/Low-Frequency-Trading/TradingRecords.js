exports.newAlgorithmicTradingBotModulesTradingRecords = function (processIndex) {
    /*
    This module facilitates the appending of records to the output files of the simulation.
    */
    let thisObject = {
        appendRecords: appendRecords,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine
    let tradingSystem
    let sessionParameters
    let outputDatasetsMap

    return thisObject

    function initialize(pOutputDatasetsMap) {
        tradingEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        tradingSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters
        outputDatasetsMap = pOutputDatasetsMap  // These are the files turned into arrays, stored in a Map by Product codeName.
    }

    function finalize() {
        tradingEngine = undefined
        tradingSystem = undefined
        sessionParameters = undefined
        outputDatasetsMap = undefined
    }

    function appendRecords() {
        TS.projects.simulation.functionLibraries.outputRecordsFunctions.appendRecords(
            tradingEngine.tradingCurrent.tradingEpisode.cycle.value,
            tradingEngine.tradingCurrent.tradingEpisode.candle.end.value.ARE_WE_PROCESSING_DAILY_FILES,
            outputDatasetsMap,
            tradingEngine,
            tradingSystem,
            sessionParameters,
            processIndex
        )
    }
}