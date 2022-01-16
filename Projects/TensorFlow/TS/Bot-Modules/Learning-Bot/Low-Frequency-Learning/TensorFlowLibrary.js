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

    const requiredErr = (str) => { throw new Error('Missing: ' + str); }
    let fLen, lLen;
    let tensorFlowBackend;
    var tensorFlowModelsManager;  // Initialized in setupModel()
    var mlDataObj;  // ML Data Manager Module.
    var hasCondition;

    return thisObject

    function initialize(callbackFunction) {
        learningSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningSystem
        learningEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters

        validations();
        setupBackend()
        setupEnvironmentFlags()
        tensorFlowModelsManager = TS.projects.tensorflow.botModules.tensorFlowModelsManager.newTensorFlowModelsManager(processIndex, learningSystem);
        callbackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
        fLen = learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.layersModel.inputLayer.inputFeatures.dataFeatures.length;
        lLen = learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.layersModel.outputLayer.outputLabels.dataLabels.length;
        mlDataObj = TS.projects.tensorflow.botModules.mlData.newMLDataObj(fLen, lLen);
        hasCondition = (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.layersModel.inputLayer.collectionCondition !== undefined) ? true : false;

        function setupBackend() {
            /* Setup the default backend: */
            tensorFlowBackend = require("@tensorflow/tfjs-node")

            if (
                learningSystem.machineLearningLibrary.executionEnvironment !== undefined &&
                learningSystem.machineLearningLibrary.executionEnvironment.backend !== undefined
            ) {
                /* Replace the backend for the one defined at the UI: */
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

        tensorFlowBackend = undefined
        tensorFlowModelsManager.model = undefined
        tensorFlowData = undefined
    }

    async function loadModel() {
        tensorFlowModelsManager.model = await tensorFlowModelsManager.api.loadLayersModel('file://' + getModelPath() + '/model.json');
        tensorFlowModelsManager.compileModel();
    }

    async function saveModel() {
        let fileLocation = getModelPath();
        /* If necessary a folder or folders are created before writing the file to disk: */
        SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(fileLocation);

        const savedModel = await tensorFlowModelsManager.model.save('file://' + fileLocation);
    }

    function getModelPath() {
        let fileName = learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.config.codeName
        let filePath =
            global.env.PATH_TO_DATA_STORAGE + '/' +
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT +
            '/Output/' +
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME

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

    function mantain() {}

    function reset() {}

    async function run(callbackFunction) {
        let layersModel = learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.layersModel;
        let isAllowed = true;
        if (hasCondition) {
            learningSystem.evalConditions(layersModel.inputLayer.collectionCondition, layersModel.inputLayer.collectionCondition.type);
            isAllowed = learningSystem.conditions.get(layersModel.inputLayer.collectionCondition.id);
        }
        
        if (isAllowed) {
            let features    = await getFeatures(layersModel);

            /* We will store at the Learning Engine data structure the features we have calculated: */
            for (let i = 0; i < layersModel.inputLayer.inputFeatures.dataFeatures.length; i++) {
                if (learningEngine.features.features[i] === undefined) { continue }
                learningEngine.features.features[i].featureValue.value = features[i];
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
            let thresholdCandle = (finalCandle - initialCandle) * backLearningPredictingRatio + initialCandle;


            if (currentCandle < thresholdCandle) {
                await pushFeaturesLabels();
            } else {
                if (!tensorFlowModelsManager.isTrained) {
                    await mlDataObj.dataEngineering(learningSystem);
                    await tensorFlowModelsManager.trainModel(mlDataObj);
                }
                predict()
            }

            async function pushFeaturesLabels() {
                let labels = await getLabels(layersModel);

                /* We will store at the Learning Engine data structure the labels we have calculated. */
                for (let i = 0; i < layersModel.outputLayer.outputLabels.dataLabels.length; i++) {
                    if (learningEngine.labels.labels[i] === undefined) { 
                        console.log("Warning: learning engine has no space to record label #" + (i+1));
                        continue;
                    }
                    learningEngine.labels.labels[i].labelValue.value = labels[i];
                    learningEngine.labels.labels[i].begin.value = learningEngine.learningCurrent.learningEpisode.candle.begin.value
                    learningEngine.labels.labels[i].end.value = learningEngine.learningCurrent.learningEpisode.candle.end.value
                }

                // Push this features/labels array to the Data Manager:
                mlDataObj.addFeatures(features);
                mlDataObj.addLabels(labels);
            }

            async function predict() {
                let featuresTensor = tensorFlowBackend.tensor([features])
                let predictions = tensorFlowModelsManager.model.predict(featuresTensor, { verbose: 1 })

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
                    if (learningEngine.predictions.predictions[i] === undefined) { 
                        console.log("Warning: learning engine has no space to record prediction #" + (i + 1));
                        continue;
                    }
                    learningEngine.predictions.predictions[i].predictionValue.value = prediction
                    learningEngine.predictions.predictions[i].begin.value = learningEngine.learningCurrent.learningEpisode.candle.begin.value
                    learningEngine.predictions.predictions[i].end.value = learningEngine.learningCurrent.learningEpisode.candle.end.value
                }
            }

            /* Collecting the Features: */
            async function getFeatures(layersModel) {
                let features = []

                learningSystem.evalFormulas(layersModel.inputLayer.inputFeatures, layersModel.inputLayer.inputFeatures.type);

                for (let i = 0; i < fLen; i++) {
                    let dataFeature = layersModel.inputLayer.inputFeatures.dataFeatures[i];
                    if (dataFeature.featureFormula === undefined) { continue }
                    let featureValue = learningSystem.formulas.get(dataFeature.featureFormula.id);
                    features.push(featureValue);
                }
                return features;
            }

            /* Collecting the Labels: */
            async function getLabels(layersModel) {
                let labels = []

                learningSystem.evalFormulas(layersModel.outputLayer.outputLabels, layersModel.outputLayer.outputLabels.type);

                for (let i = 0; i < lLen; i++) {
                    let dataLabel = layersModel.outputLayer.outputLabels.dataLabels[i];
                    if (dataLabel.labelFormula === undefined) { continue }
                    let labelValue = learningSystem.formulas.get(dataLabel.labelFormula.id);
                    labels.push(labelValue);
                }
                return labels;
            }
        }
    }

    function badDefinitionUnhandledException(err, message, node) {

        let docs = {
            project: 'Foundations',
            category: 'Topic',
            type: 'TS LF Learning Bot Error - ' + message,
            placeholder: {}
        }

        learningSystem.addError([node.id, message, docs])

        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> " + message);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.name = " + node.name);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.type = " + node.type);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.config = " + JSON.stringify(node.config));
        if (err !== undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> err.stack = " + err.stack);
        }
        throw 'Error Already Recorded'
    }


    /* validations() : This function validates that required nodes exist. */
    function validations() {
        let layersModel = learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.layersModel;
        if (layersModel === undefined) {
            requiredErr(">layers model<");
        }

        // Model Structure Validations:
        if (layersModel.inputLayer === undefined) {
            requiredErr(">input layer<");
        }
        if (layersModel.outputLayer === undefined) {
            requiredErr(">output layer<");
        }
        if (layersModel.inputLayer.inputFeatures === undefined) {
            requiredErr(">input features<");
        }
        if (layersModel.outputLayer.outputLabels === undefined) {
            requiredErr(">output labels<");
        }
        if (layersModel.inputLayer.inputFeatures.dataFeatures.length === 0) {
            requiredErr(">input data features<");
        }
        if (layersModel.outputLayer.outputLabels.dataLabels.length === 0) {
            requiredErr(">output data labels<");
        }
        if (layersModel.layers.length === 0) {
            requiredErr(">Could not find any layers<");
        }
        if (layersModel.inputLayer.referenceParent === undefined) {
            requiredErr(">input layer missing reference parent<");
        }

        // Model Compiler Validations:
        if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile === undefined) {
            requiredErr(">compile node<");
        }
        if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.lossFunction === undefined) {
            requiredErr(">loss function<");
        }
        if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.lossFunction.config.value === undefined) {
            requiredErr(">loss function value<");
        }
        if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer === undefined) {
            requiredErr(">optimizer node<");
        }
        if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType === undefined) {
            requiredErr(">optimizer type node<");
        }

        //* Feature Validations: */
        
        // Data Features must be Uniquely Named:
        /*let duplicates = () => {
            let names = [];
            layersModel.inputLayer.inputFeatures.dataFeatures.forEach(e => names.push(e.name));
            return names;
        };
        if (layersModel.inputLayer.inputFeatures.dataFeatures.length !==
            new Set(duplicates()).size) {
            requiredErr(">All Data Feature nodes must be uniquely named<");
        }*/
    }
}