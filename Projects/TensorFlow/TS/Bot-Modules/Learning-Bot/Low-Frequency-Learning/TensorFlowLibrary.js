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
    let tensorFlowData

    return thisObject

    function initialize(callbackFunction) {
        learningSystem = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningSystem
        learningEngine = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningEngine
        sessionParameters = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters

        setupBackend()
        setupEnvironmentFlags()
        setupModel()
        compileModel()

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
                learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api !== undefined
            ) {
                switch (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.type) {
                    case 'Layers API': {
                        tensorFlowAPI = require("@tensorflow/tfjs-layers")
                        if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.layersModel === undefined) { return }

                        switch (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.layersModel.type) {
                            case 'Secuential Model': {
                                setupSecuentialModel(learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.layersModel)
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

                tensorFlowModel = tensorFlowAPI.sequential()

                for (let i = 0; i < secuentialModel.layers.length; i++) {
                    let layerNode = secuentialModel.layers[i]
                    let layersFunction
                    let argsObject = {}
                    let layerObject

                    if (layerNode.typeOfLayer === undefined) { continue }
                    if (layerNode.typeOfLayer.layer === undefined) { continue }

                    switch (layerNode.typeOfLayer.layer.type) {
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
                        default: {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                '[WARN] Layer of type ' + layerNode.typeOfLayer.layer.type + ' not implemented yet.')
                            continue
                        }
                    }

                    if (layerNode.typeOfLayer.layer.dimensionalityUnits !== undefined) {
                        argsObject.units = layerNode.typeOfLayer.layer.dimensionalityUnits.config.value
                    } else {
                        argsObject.units = 1
                    }
                    if (layerNode.typeOfLayer.layer.activationFunction !== undefined) {
                        argsObject.activation = layerNode.typeOfLayer.layer.activationFunction.config.value
                    }
                    if (layerNode.typeOfLayer.layer.bias !== undefined) {
                        argsObject.useBias = true
                    } else {
                        argsObject.useBias = false
                    }
                    if (layerNode.typeOfLayer.layer.kernel !== undefined) {
                        if (layerNode.typeOfLayer.layer.kernel.kernelInitializer !== undefined) {
                            argsObject.kernelInitializer = layerNode.typeOfLayer.layer.kernel.kernelInitializer.config.value
                        }
                        if (layerNode.typeOfLayer.layer.kernel.kernelConstraint !== undefined) {
                            argsObject.kernelConstraint = layerNode.typeOfLayer.layer.kernel.kernelConstraint.config.value
                        }
                        if (layerNode.typeOfLayer.layer.kernel.kernelRegularizer !== undefined) {
                            argsObject.kernelRegularizer = layerNode.typeOfLayer.layer.kernel.kernelRegularizer.config.value
                        }
                    }
                    if (layerNode.typeOfLayer.layer.bias !== undefined) {
                        if (layerNode.typeOfLayer.layer.bias.biasInitializer !== undefined) {
                            argsObject.biasInitializer = layerNode.typeOfLayer.layer.bias.biasInitializer.config.value
                        }
                        if (layerNode.typeOfLayer.layer.bias.biasConstraint !== undefined) {
                            argsObject.biasConstraint = layerNode.typeOfLayer.layer.bias.biasConstraint.config.value
                        }
                        if (layerNode.typeOfLayer.layer.bias.biasRegularizer !== undefined) {
                            argsObject.biasRegularizer = layerNode.typeOfLayer.layer.bias.biasRegularizer.config.value
                        }
                    }
                    if (layerNode.typeOfLayer.layer.batchSize !== undefined) {
                        argsObject.batchSize = layerNode.typeOfLayer.layer.batchSize.config.value
                    }
                    if (layerNode.typeOfLayer.layer.dtype !== undefined) {
                        argsObject.dtype = layerNode.typeOfLayer.layer.dtype.config.value
                    }
                    if (layerNode.typeOfLayer.layer.trainable !== undefined) {
                        argsObject.trainable = layerNode.typeOfLayer.layer.trainable.config.value
                    }
                    if (layerNode.typeOfLayer.layer.weights !== undefined) {
                        if (layerNode.typeOfLayer.layer.weights.tensor !== undefined) {
                            argsObject.weights = layerNode.typeOfLayer.layer.weights.tensor.config.value
                        }
                    }
                    argsObject.name = layerNode.typeOfLayer.layer.config.codeName

                    /*
                    Check if this is the input layer.
                    */
                    if (secuentialModel.inputLayer.referenceParent.id === layerNode.id) {
                        if (secuentialModel.inputLayer.inputShape !== undefined) {
                            argsObject.inputShape = secuentialModel.inputLayer.inputShape.config.value
                        }
                    }

                    layerObject = layersFunction(argsObject)

                    tensorFlowModel.add(layerObject)
                }
            }
        }

        function compileModel() {
            if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.optimizer === undefined) {
                //TODO
                return
            }
            if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.optimizer.config.value === undefined) {
                //TODO
                return
            }
            if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.lossFunction === undefined) {
                //TODO
                return
            }
            if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.lossFunction.config.value === undefined) {
                //TODO
                return
            }
            if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.metrics === undefined) {
                //TODO
                return
            }
            if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.metrics.config.value === undefined) {
                //TODO
                return
            }
            let compileArgs = {
                optimizer: learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.optimizer.config.value,
                loss: learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.lossFunction.config.value,
                metrics: [learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.metrics.config.value]
            }

            tensorFlowModel.compile(compileArgs)

            tensorFlowModel.summary()
        }
    }

    function finalize() {
        learningEngine = undefined
        learningSystem = undefined
        sessionParameters = undefined

        chart = undefined
        exchange = undefined
        market = undefined

        tensorFlowBackend = undefined
        tensorFlowAPI = undefined
        tensorFlowModel = undefined
        tensorFlowData = undefined
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

    async function run(callbackFunction) {

        let layersModel = learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.layersModel
        let features = []
        let labels = []
        
        /*
        Building the Features Tensor
        */
        if (layersModel.inputLayer === undefined) {
            // TODO
        }
        if (layersModel.inputLayer.inputFeatures === undefined) {
            // TODO
        }
        learningSystem.evalFormulas(layersModel.inputLayer.inputFeatures, layersModel.inputLayer.inputFeatures.type)

        for (let i = 0; i < layersModel.inputLayer.inputFeatures.dataFeatures.length; i++) {
            let dataFeature = layersModel.inputLayer.inputFeatures.dataFeatures[i]
            if (dataFeature.featureFormula === undefined) { continue }
            let featureValue = learningSystem.formulas.get(dataFeature.featureFormula.id)
            features.push(featureValue)
        }

        /*
        Building the Labels Tensor
        */
        if (layersModel.outputLayer === undefined) {
            // TODO
        }
        if (layersModel.outputLayer.outputLabels === undefined) {
            // TODO
        }
        learningSystem.evalFormulas(layersModel.outputLayer.outputLabels, layersModel.outputLayer.outputLabels.type)

        for (let i = 0; i < layersModel.outputLayer.outputLabels.dataLabels.length; i++) {
            let dataLabel = layersModel.outputLayer.outputLabels.dataLabels[i]
            if (dataLabel.labelFormula === undefined) { continue }
            let labelValue = learningSystem.formulas.get(dataLabel.labelFormula.id)
            labels.push(labelValue)
        }

        tensorFlowData = require("@tensorflow/tfjs-data")

        function* featuresGenerator() {
            yield features
        }

        function* labelsGenerator() {
            yield labels
        }

        const xs = tensorFlowData.generator(featuresGenerator)
        const ys = tensorFlowData.generator(labelsGenerator)
        const ds = tensorFlowData.zip({xs, ys}).shuffle(1).batch(1)
    
        await tensorFlowModel.fitDataset(ds, {
            verbose: 1,
            epochs: 1 
        })


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