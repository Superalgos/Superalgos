exports.newPortfolioManagementBotModulesPortfolioRecords = function (processIndex) {
    /*
    This module facilitates the appending of records to the output files of the simulation.
    */
    let thisObject = {
        appendRecords: appendRecords,
        initialize: initialize,
        finalize: finalize
    }

    let portfolioEngine
    let portfolioSystem
    let sessionParameters
    let outputDatasetsMap

    return thisObject

    function initialize(pOutputDatasetsMap) {
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
        portfolioSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioSystem
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters
        outputDatasetsMap = pOutputDatasetsMap  // These are the files turned into arrays, stored in a Map by Product codeName.
    }

    function finalize() {
        portfolioEngine = undefined
        portfolioSystem = undefined
        sessionParameters = undefined
        outputDatasetsMap = undefined
    }

    function appendRecords() {
        TS.projects.simulation.functionLibraries.outputRecordsFunctions.appendRecords(
            portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.value,
            portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value.ARE_WE_PROCESSING_DAILY_FILES,
            outputDatasetsMap,
            portfolioEngine,
            portfolioSystem,
            sessionParameters,
            processIndex
        )
    }
}