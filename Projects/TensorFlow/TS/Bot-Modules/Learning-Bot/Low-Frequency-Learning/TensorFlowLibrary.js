exports.newTensorFlowBotModulesTensorFlowLibrary = function (processIndex) {

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

    let tensorFlowBackend

    return thisObject

    function initialize(callbackFunction) {
        learningSystem = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningSystem
        learningEngine = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningEngine
        sessionParameters = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters


        setupBackend()
        setupEnvironmentFlags()

        callbackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)

        function setupBackend() {
            /*
            Setup the default backend.
            */
            tensorFlowBackend = require("@tensorflow/tfjs-node")

            if (
                learningSystem.machineLearningLibrary.executionEnvironment !== undefined &&
                learningSystem.machineLearningLibrary.executionEnvironment.backend !== undefined
            ) {
                /*
                Replace the backend for the one defined at the UI.
                */
                switch (learningSystem.machineLearningLibrary.executionEnvironment.backend.config.codeName) {
                    case 'node': {
                        // This is already the default.
                        break
                    }
                    case 'webgl': {
                        tensorFlowBackend = require("@tensorflow/tfjs-backend-webgl")
                        break
                    }
                    case 'wasm': {
                        tensorFlowBackend = require("@tensorflow/tfjs-backend-wasm")
                        break
                    }
                    case 'cpu': {
                        tensorFlowBackend = require("@tensorflow/tfjs-backend-cpu")
                        break
                    }
                }
            }
        }

        function setupEnvironmentFlags() {
            if (
                learningSystem.machineLearningLibrary.executionEnvironment !== undefined &&
                learningSystem.machineLearningLibrary.executionEnvironment.environmentFlags !== undefined &&
                learningSystem.machineLearningLibrary.executionEnvironment.environmentFlags.mode
            ) {
                switch (learningSystem.machineLearningLibrary.executionEnvironment.environmentFlags.mode.type) {
                    case 'Debug Mode': {
                        tensorFlowBackend.enableDebugMode()
                        break
                    }
                    case 'Debug Mode': {
                        tensorFlowBackend.enableProdMode()
                        break
                    }
                }
            }
        }
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