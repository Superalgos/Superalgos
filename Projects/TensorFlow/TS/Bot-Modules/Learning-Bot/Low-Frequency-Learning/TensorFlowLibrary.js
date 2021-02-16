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
    let tensorFlowAPI
    let tensorFlowModel

    return thisObject

    function initialize(callbackFunction) {
        learningSystem = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningSystem
        learningEngine = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningEngine
        sessionParameters = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters


        setupBackend()
        setupEnvironmentFlags()
        setupModel()

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

        function setupModel() {
            if (
                learningSystem.machineLearningLibrary.typeOfLearning !== undefined &&
                learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel !== undefined &&
                learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model !== undefined &&
                learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.api !== undefined
            ) {
                switch (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.api.type) {
                    case 'Layers API': {
                        tensorFlowAPI = require("@tensorflow/tfjs-layers")
                        if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.api.layersModel === undefined) { return }

                        switch (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.api.layersModel.type) {
                            case 'Secuential Model': {
                                setupSecuentialModel(learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.api.layersModel)
                                break
                            }
                            case 'Functional Model': {
                                break
                            }
                        }
                        break
                    }
                    case 'Code API': {
                        tensorFlowAPI = require("@tensorflow/tfjs-core")
                        break
                    }
                }
            }

            function setupSecuentialModel(secuentialModel) {
                /*
                Some validations
                */
                if (secuentialModel.inputLayer === undefined) {
                    // TODO
                    return
                }
                if (secuentialModel.outputLayer === undefined) {
                    // TODO
                    return
                }
                if (secuentialModel.layers.length === 0) {
                    // TODO
                    return
                }
                if (secuentialModel.inputLayer.referenceParent === undefined) {
                    // TODO
                    return
                }

                tensorFlowModel = tensorFlowAPI.sequetial()

                for (let i = 0; i < secuentialModel.layers.length; i++) {
                    let layerNode = secuentialModel.layers[i]
                    let layersFunction
                    let argsObject = {}
                    let layerObject

                    if (layerNode.layerType === undefined) { continue }
                    if (layerNode.layerType.layer === undefined) { continue }

                    switch (layerNode.layerType.layer.type) {
                        case 'Dense Layer': {
                            layersFunction = tensorFlowAPI.layers.dense
                            break
                        }
                        case ' ': {
                            break
                        }
                        case ' ': {
                            break
                        }
                    }

                    if (layerNode.layerType.layer.dimensionalityUnits !== undefined) {
                        argsObject.units = layerNode.layerType.layer.dimensionalityUnits.config.value
                    }
                    if (layerNode.layerType.layer.activationFunction !== undefined) {
                        argsObject.activation = layerNode.layerType.layer.activationFunction.config.value
                    }
                    if (layerNode.layerType.layer.bias !== undefined) {
                        argsObject.useBias = true
                    }
                    if (layerNode.layerType.layer.kernel !== undefined) {
                        if (layerNode.layerType.layer.kernel.initializer !== undefined) {
                            argsObject.kernelInitializer = layerNode.layerType.layer.kernel.initializer.config.value
                        }
                        if (layerNode.layerType.layer.kernel.constraint !== undefined) {
                            argsObject.kernelConstraint = layerNode.layerType.layer.kernel.constraint.config.value
                        }
                        if (layerNode.layerType.layer.kernel.regularizer !== undefined) {
                            argsObject.kernelRegularizer = layerNode.layerType.layer.kernel.regularizer.config.value
                        }
                    }
                    if (layerNode.layerType.layer.bias !== undefined) {
                        if (layerNode.layerType.layer.bias.initializer !== undefined) {
                            argsObject.biasInitializer = layerNode.layerType.layer.bias.initializer.config.value
                        }
                        if (layerNode.layerType.layer.bias.constraint !== undefined) {
                            argsObject.biasConstraint = layerNode.layerType.layer.bias.constraint.config.value
                        }
                        if (layerNode.layerType.layer.bias.regularizer !== undefined) {
                            argsObject.biasRegularizer = layerNode.layerType.layer.bias.regularizer.config.value
                        }
                    }
                    if (layerNode.layerType.layer.batchSize !== undefined) {
                        argsObject.batchSize = layerNode.layerType.layer.batchSize.config.value
                    }
                    if (layerNode.layerType.layer.dtype !== undefined) {
                        argsObject.dtype = layerNode.layerType.layer.dtype.config.value
                    }
                    if (layerNode.layerType.layer.trainable !== undefined) {
                        argsObject.trainable = layerNode.layerType.layer.trainable.config.value
                    }
                    if (layerNode.layerType.layer.weights !== undefined) {
                        if (layerNode.layerType.layer.weights.tensor !== undefined) {
                            argsObject.weights = layerNode.layerType.layer.weights.tensor.config.value
                        }
                    }
                    argsObject.name = layerNode.layerType.layer.name

                    /*
                    Check if this is the input layer.
                    */
                    if (secuentialModel.inputLayer.referenceParent.id === layerNode.id) {
                        if (secuentialModel.inputLayer.inputShape !== undefined) {
                            argsObject.inputShape = secuentialModel.inputLayer.inputShape.config.value
                        }
                    }

                    secuentialModel.inputLayer

                    layerObject = layersFunction(argsObject)

                    tensorFlowModel.add(layerObject)
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