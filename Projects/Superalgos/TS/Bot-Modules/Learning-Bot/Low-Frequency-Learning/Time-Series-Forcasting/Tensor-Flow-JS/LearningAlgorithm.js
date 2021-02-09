exports.newSuperalgosAlgorithmModulesTimeSeriesForcastingTensorFlowJS = function (processIndex) {
    /*
    This module implements a learning algorithm based on Time Series Forcasting with Tensor Flow js,
    as described at the folliwing web page:

    https://jinglescode.github.io/time-series-forecasting-tensorflowjs/
    */
    const MODULE_NAME = 'Time Series Forcasting Tensor Flow JS Learning Algorithm'
    let thisObject = {
        updateChart: updateChart,
        mantain: mantain,
        reset: reset,
        run: run,
        initialize: initialize,
        finalize: finalize
    }

    let learningEngine
    let learningSystem
    let sessionParameters

    /* 
    These 3 are the main data structures available to users
    when writing conditions and formulas.
    */
    let chart
    let exchange
    let market

    return thisObject

    function initialize(callbackFunction) {
        learningSystem = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningSystem
        learningEngine = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningEngine
        sessionParameters = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters

        callbackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
    }

    function finalize() {
        learningEngine = undefined
        learningSystem = undefined
        sessionParameters = undefined

        chart = undefined
        exchange = undefined
        market = undefined
    }

    function updateChart(pChart, pExchange, pMarket) {
        /* 
          We need these 3 data structures  to be a local objects 
          accessible while evaluating conditions and formulas.
          */
        chart = pChart
        exchange = pExchange
        market = pMarket
    }

    function mantain() {
 
    }

    function reset() {
    }

    function run(callbackFunction) {
        /*
        Do your magic here...
        */

        /*
        if all is good, return this...
        */
        callbackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)

        /*
        if something is bad, return this...
        */
        //callbackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)

    }

    function badDefinitionUnhandledException(err, message, node) {

        let docs = {
            project: 'Superalgos',
            category: 'Topic',
            type: 'TS LF Learning Bot Error - ' + message,
            placeholder: {}
        }

        learningSystem.addError([node.id, message, docs])

        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> " + message);
        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.name = " + node.name);
        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.type = " + node.type);
        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.config = " + JSON.stringify(node.config));
        if (err !== undefined) {
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> err.stack = " + err.stack);
        }
        throw 'Error Already Recorded'
    }
}