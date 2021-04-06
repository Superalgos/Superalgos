exports.newTensorFlowBotModulesTensorFlowLibrary = function (processIndex) {

    const MODULE_NAME = 'Time Series Forcasting Tensor Flow JS Learning Algorithm'
    let thisObject = {
        loadModel: loadModel,
        saveModel: saveModel,
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
                            case 'Sequential Model': {
                                setupSecuentialModel(learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.layersModel)
                                break
                            }
                            case 'Functional Model': {
                                /* To be implemented some day...*/
                                break
                            }
                        }
                        break
                    }
                    case 'Code API': {
                        tensorFlowAPI = require("@tensorflow/tfjs-core")
                        /* To be implemented some day...*/
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
                        /*
                        If there is a explicitly defined Input Shape, then we will take it, 
                        otherwise, we will count the amount of features declared.
                        */
                        if (secuentialModel.inputLayer.inputShape !== undefined) {
                            if (argsObject.inputShape = secuentialModel.inputLayer.inputShape !== undefined) {
                                if (argsObject.inputShape = secuentialModel.inputLayer.inputShape.config.value !== undefined) {
                                    argsObject.inputShape = secuentialModel.inputLayer.inputShape.config.value
                                }
                            }
                        }
                        if (argsObject.inputShape === undefined) {
                            argsObject.inputShape = []
                            argsObject.inputShape.push(secuentialModel.inputLayer.inputFeatures.dataFeatures.length)
                        }
                    }

                    layerObject = layersFunction(argsObject)

                    tensorFlowModel.add(layerObject)
                }
            }
        }
    }

    function compileModel() {
        if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile === undefined) {
            //TODO
            return
        }
        if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer === undefined) {
            //TODO
            return
        }
        if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.config.value === undefined) {
            //TODO
            return
        }
        if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.lossFunction === undefined) {
            //TODO
            return
        }
        if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.lossFunction.config.value === undefined) {
            //TODO
            return
        }
        if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.metrics === undefined) {
            //TODO
            return
        }
        if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.metrics.config.value === undefined) {
            //TODO
            return
        }
        let compileArgs = {
            optimizer: learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.config.value,
            loss: learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.lossFunction.config.value /*,
            metrics: [learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.metrics.config.value]*/
        }

        tensorFlowModel.compile(compileArgs)

        tensorFlowModel.summary()
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

    async function loadModel() {
        tensorFlowModel = await tensorFlowAPI.loadLayersModel('file://' + getModelPath() + '/model.json')
        compileModel()
    }

    async function saveModel() {
        let fileLocation = getModelPath()
        /* If necesary a folder or folders are created before writing the file to disk. */
        TS.projects.superalgos.utilities.miscellaneousFunctions.mkDirByPathSync(fileLocation)

        await tensorFlowModel.save('file://' + fileLocation)
    }

    function getModelPath() {
        let fileName = learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.config.codeName
        let filePath =
            global.env.PATH_TO_DATA_STORAGE + '/' +
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT +
            '/Output/' +
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME

        return filePath + '/' + fileName
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

            /*
            We will store at the Learning Engine data structure the features we have calculated.
            */
            if (learningEngine.features.features[i] === undefined) { continue }
            learningEngine.features.features[i].featureValue.value = featureValue
            learningEngine.features.features[i].begin.value = learningEngine.learningCurrent.learningEpisode.candle.begin.value
            learningEngine.features.features[i].end.value = learningEngine.learningCurrent.learningEpisode.candle.end.value
        }

        /*
        At this point we need to decide if we are going to learn or going to predict. 
        This is regulated by the backLearningPredictingRatio property at the config
        of the Learning Algorithm of the Learning Session.
        */
        let backLearningPredictingRatio = 0.8 // this is the default value.

        if (sessionParameters.learningAlgorithm !== undefined) {
            if (sessionParameters.learningAlgorithm.config.backLearningPredictingRatio !== undefined) {
                backLearningPredictingRatio = sessionParameters.learningAlgorithm.config.backLearningPredictingRatio
            }
        }

        let initialCandle = Math.trunc(sessionParameters.timeRange.config.initialDatetime / sessionParameters.timeFrame.config.value)
        let finalCandle = Math.trunc(sessionParameters.timeRange.config.finalDatetime / sessionParameters.timeFrame.config.value)
        let currentCandle = Math.trunc(learningEngine.learningCurrent.learningEpisode.candle.begin.value / sessionParameters.timeFrame.config.value)
        let thresholdCandle = (finalCandle - initialCandle) * backLearningPredictingRatio + initialCandle

        if (currentCandle < thresholdCandle) {
            await learn()
        } else {
            predict()
        }

        async function learn() {
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

                /*
                We will store at the Learning Engine data structure the labels we have calculated.
                */
                if (learningEngine.labels.labels[i] === undefined) { continue }
                learningEngine.labels.labels[i].labelValue.value = labelValue
                learningEngine.labels.labels[i].begin.value = learningEngine.learningCurrent.learningEpisode.candle.begin.value
                learningEngine.labels.labels[i].end.value = learningEngine.learningCurrent.learningEpisode.candle.end.value
            }

            tensorFlowData = require("@tensorflow/tfjs-data")

            function* featuresGenerator() {
                //console.log('Features: ' + features)
                yield features
            }

            function* labelsGenerator() {
                //console.log('Labels: ' + labels)
                yield labels
            }

            const xs = tensorFlowData.generator(featuresGenerator)
            const ys = tensorFlowData.generator(labelsGenerator)
            const ds = tensorFlowData.zip({ xs, ys }).shuffle(1).batch(1)

            let verbose = 0
            let ecpochs = 1

            if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.fitDataset !== undefined) {
                if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.fitDataset.verbose !== undefined) {
                    if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.fitDataset.verbose.config.value !== undefined) {
                        verbose = learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.fitDataset.verbose.config.value
                    }
                }
            }

            if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.fitDataset !== undefined) {
                if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.fitDataset.epochs !== undefined) {
                    if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.fitDataset.epochs.config.value !== undefined) {
                        ecpochs = learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.fitDataset.epochs.config.value
                    }
                }
            }

            await tensorFlowModel.fitDataset(ds, {
                verbose: verbose,
                epochs: ecpochs
            })

        }

        async function predict() {
            let featuresTensor = tensorFlowBackend.tensor([features])
            let predictions = tensorFlowModel.predict(featuresTensor, { verbose: 1 })

            /* 
            We will download the predictions to an array, and we will store each one at the
            learning engine data structure.
            */
            let predictionsArray = predictions.dataSync()
            predictions.dispose()
            featuresTensor.dispose()

            for (let i = 0; i < predictionsArray.length; i++) {
                let prediction = predictionsArray[i]
                if (isNaN(prediction)) {
                    prediction = 0
                }
                if (learningEngine.predictions.predictions[i] === undefined) { continue }
                learningEngine.predictions.predictions[i].predictionValue.value = prediction
                learningEngine.predictions.predictions[i].begin.value = learningEngine.learningCurrent.learningEpisode.candle.begin.value
                learningEngine.predictions.predictions[i].end.value = learningEngine.learningCurrent.learningEpisode.candle.end.value
            }
        }
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