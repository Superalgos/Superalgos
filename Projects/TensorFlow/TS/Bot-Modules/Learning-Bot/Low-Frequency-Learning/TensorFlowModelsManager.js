/*
 *  File: TensorFlowModelsManager.js
 *  TensorFlow Library Model types currently supported by SuperAlgos:
 *      1.) Sequential Model
 * 
 *  History:
 *      7/6/21:     Start
 *      8/24/21:    Pushing as beta
 * 
 *  Contents:
 *          newTensorFlowModelsManager.thisObject,
 *          Model Manager Initialization ()=>{},
 *          sequentialModelSetup(),
 *          compileModel(),
 *          trainModel(),
 *          trainSequentialModel(),
 *          fitArgsConstructor()
 * 
 */


exports.newTensorFlowModelsManager = function (processIndex, learningSystem) {
    const MODULE_NAME = 'Tensorflow Models Manager';

    /* ModelsManager Variables/Objects/Dependencies Sections: */
    const _tfjsCore = require("@tensorflow/tfjs-core");
    var _tensorFlowAPI;
    var _learningSystem;
    var _tensorFlowModel;
    let isTrained;
    let modelType;

    
    let thisObject = {
        sequentialModelSetup:   sequentialModelSetup,
        compileModel:           compileModel,
        trainModel:             trainModel,
        get api() {return _tensorFlowAPI; },
        get model() { return _tensorFlowModel; },
        set model(value) {
            _tensorFlowModel = value;
        },
        get isTrained() { return isTrained; },
    };

    // Model Manager Initialization:
    ( () => {
        if (
            learningSystem.machineLearningLibrary.typeOfLearning !== undefined &&
            learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel !== undefined &&
            learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model !== undefined &&
            learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api !== undefined
        ) {
            _learningSystem = learningSystem;   // Record locally
            isTrained = false;

            switch (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.type) {
                case 'Layers API': {
                    _tensorFlowAPI = require("@tensorflow/tfjs-layers")
                    if (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.layersModel === undefined) { return }

                    switch (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.layersModel.type) {
                        case 'Sequential Model': {
                            modelType = 'Sequential Model';
                            sequentialModelSetup();
                            break
                        }
                        case 'Functional Model': {
                            modelType = 'FunctionalModel';
                            // To be implemented some day...
                            break
                        }
                    }
                    break
                }
                case 'Core API': {
                    _tensorFlowAPI = require("@tensorflow/tfjs-core")
                    // To be implemented some day...
                    break
                }
            }
        }
        
        compileModel();
    })();

    return thisObject;

    
    /* Model specific setup section: */
    function sequentialModelSetup() {
        let layersModel = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.layersModel;

        /* Load the Model: */
        _tensorFlowModel = _tensorFlowAPI.sequential();

        /* Construct the layers and add to the model: */
        for (let i = 0; i < layersModel.layers.length; i++) {
            let layerNode = layersModel.layers[i];
            let layerFunction;          // The layer function.
            let layerArgsObject = {};   // layerFunction's arguments.
            let layerObject;            // The completed layer.

            if (layerNode.typeOfLayer === undefined) { continue }
            if (layerNode.typeOfLayer.layer === undefined) { continue }

            /* Assign tensorFlowAPI layer type to the layer function: */
            switch (layerNode.typeOfLayer.layer.type) {
                case 'Dense Layer': {
                    layerFunction = _tensorFlowAPI.layers.dense
                    break
                }
                /*case ' ': {
                    break
                }
                case ' ': {
                    break
                }*/
                default: {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[WARN] Layer of type ' + layerNode.typeOfLayer.layer.type + ' not implemented yet.')
                    continue
                }
            }

            /* Construct layerArgsObject for this layerFunction via collecting the children of the layerNode: */
            if (layerNode.typeOfLayer.layer.dimensionalityUnits !== undefined) {
                layerArgsObject.units = layerNode.typeOfLayer.layer.dimensionalityUnits.config.value
            } else {
                layerArgsObject.units = 1
            }

            if (layerNode.typeOfLayer.layer.activationFunction !== undefined) {
                layerArgsObject.activation = layerNode.typeOfLayer.layer.activationFunction.config.value
            }

            if (layerNode.typeOfLayer.layer.bias !== undefined) {
                layerArgsObject.useBias = true
            } else {
                layerArgsObject.useBias = false
            }

            if (layerNode.typeOfLayer.layer.kernel !== undefined) {
                if (layerNode.typeOfLayer.layer.kernel.kernelInitializer !== undefined) {
                    layerArgsObject.kernelInitializer = layerNode.typeOfLayer.layer.kernel.kernelInitializer.config.value
                }
                if (layerNode.typeOfLayer.layer.kernel.kernelConstraint !== undefined) {
                    layerArgsObject.kernelConstraint = layerNode.typeOfLayer.layer.kernel.kernelConstraint.config.value
                }
                if (layerNode.typeOfLayer.layer.kernel.kernelRegularizer !== undefined) {
                    layerArgsObject.kernelRegularizer = layerNode.typeOfLayer.layer.kernel.kernelRegularizer.config.value
                }
            }

            if (layerNode.typeOfLayer.layer.bias !== undefined) {
                if (layerNode.typeOfLayer.layer.bias.biasInitializer !== undefined) {
                    layerArgsObject.biasInitializer = layerNode.typeOfLayer.layer.bias.biasInitializer.config.value
                }
                if (layerNode.typeOfLayer.layer.bias.biasConstraint !== undefined) {
                    layerArgsObject.biasConstraint = layerNode.typeOfLayer.layer.bias.biasConstraint.config.value
                }
                if (layerNode.typeOfLayer.layer.bias.biasRegularizer !== undefined) {
                    layerArgsObject.biasRegularizer = layerNode.typeOfLayer.layer.bias.biasRegularizer.config.value
                }
            }

            if (layerNode.typeOfLayer.layer.batchSize !== undefined) {
                layerArgsObject.batchSize = layerNode.typeOfLayer.layer.batchSize.config.value
            }

            if (layerNode.typeOfLayer.layer.dtype !== undefined) {
                layerArgsObject.dtype = layerNode.typeOfLayer.layer.dtype.config.value
            }

            if (layerNode.typeOfLayer.layer.trainable !== undefined) {
                layerArgsObject.trainable = layerNode.typeOfLayer.layer.trainable.config.value
            }

            if (layerNode.typeOfLayer.layer.weights !== undefined) {
                if (layerNode.typeOfLayer.layer.weights.tensor !== undefined) {
                    layerArgsObject.weights = layerNode.typeOfLayer.layer.weights.tensor.config.value
                }
            }
            layerArgsObject.name = layerNode.typeOfLayer.layer.config.codeName;

            /* Check if this is the input layer: */
            if (layersModel.inputLayer.referenceParent.id === layerNode.id) {
                /*
                 * If there is a explicitly defined Input Shape, then we will take it, 
                 * otherwise, we will count the amount of features declared.
                */
                if (layersModel.inputLayer.inputShape !== undefined) {
                    if (layerArgsObject.inputShape = layersModel.inputLayer.inputShape !== undefined) {
                        if (layerArgsObject.inputShape = layersModel.inputLayer.inputShape.config.value !== undefined) {
                            layerArgsObject.inputShape = layersModel.inputLayer.inputShape.config.value
                        }
                    }
                }
                if (layerArgsObject.inputShape === undefined) {
                    layerArgsObject.inputShape = [];
                    layerArgsObject.inputShape.push(layersModel.inputLayer.inputFeatures.dataFeatures.length);
                }
            }

            /* Call the layerFunction and add layer to the model: */
            layerObject = layerFunction(layerArgsObject);
            _tensorFlowModel.add(layerObject);
        }
    }


    /* Compile Models Section: */
    function compileModel() {
        /* optimizerBuilder() : builds and returns either a string or an tf.train.Optimizer:
         *  TF Docs: optimizer (string|tf.train.Optimizer) An instance of tf.train.Optimizer or a string name for an Optimizer.
         */
        let optimizerBuilder = () => {
            let optimizerType = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.type;
            let learningRate, momentum, useNesterov, initAccVal, rho, decay, epsilon, beta1, beta2, centered;
            switch(optimizerType) {
                case 'Optimizer by Name': // For specifying string name as optimizer.
                // This ensures acceptable type entered:
                    return _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.value;
                // Following Cases for building instance of tf.train.Optimizer:
                case 'SGD Instance':
                    learningRate = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.learningRate;
                    return _tfjsCore.train.sgd(learningRate);
                case 'Momentum Instance':
                    learningRate = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.learningRate;
                    momentum = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.momentum;
                    useNesterov = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.useNesterov;
                    return _tfjsCore.train.momentum(learningRate, momentum, useNesterov);
                case 'Adagrad Instance':
                    learningRate = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.learningRate;
                    initAccVal = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.initialAccumulatorValue;
                    return _tfjsCore.train.adagrad(learningRate, initAccVal);
                case 'Adadelta Instance':
                    learningRate = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.learningRate;
                    rho = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.rho;
                    epsilon = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.epsilon;
                    return _tfjsCore.train.adadelta(learningRate, rho, epsilon);
                case 'Adam Instance':
                    learningRate = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.learningRate;
                    beta1 = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.beta1;
                    beta2 = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.beta2;
                    epsilon = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.epsilon;
                    return _tfjsCore.train.adam(learningRate, beta1, beta2, epsilon);
                case 'Rmsprop Instance':
                    learningRate = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.learningRate;
                    decay = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.decay;
                    momentum = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.momentum;
                    epsilon = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.epsilon;
                    centered = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.optimizer.optimizerType.config.centered;
                    return _tfjsCore.train.rmsprop(learningRate, decay, momentum, epsilon, centered);
                default:
                    return false;
            }
        }

        let compileMetrics;
        if (_learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.metrics !== undefined &&
            _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.metrics.config.value !== undefined) {
            compileMetrics = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.metrics.config.value;
        }

        // Collect, build and process optimizer type:
        let optimizerBuild = optimizerBuilder();
        let compileArgs = {
            optimizer: optimizerBuild,
            /* Loss Types: see: @tensorflow -> tf-layers.node.js:
             *  categoricalCrossentropy, sparseCategoricalCrossentropy, binaryCrossentropy, meanSquaredError ...
             */
            loss: _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.compile.lossFunction.config.value,
            metrics: compileMetrics
        }

        _tensorFlowModel.compile(compileArgs);
    }

    /* Fit Model Section: */
    async function trainModel(mlDataObj) {
        switch(modelType) {
            case 'Sequential Model':
                _tensorFlowModel.summary();
                await trainSequentialModel(mlDataObj);
                break;
            case 'Functional Model':
                // To be implemented some day...
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    '[WARN] Model of type ' + modelType + ' not yet implemented.');
                throw new Error('Model Type: >' + modelType + '< not yet implemented');
            default: {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    '[WARN] Model of type ' + modelType + ' not yet implemented.');
                throw new Error('Model Type: >' + modelType + '< not yet implemented');
            }
        }
    }

    async function trainSequentialModel(mlDataObj) {
        // Should we print state of mlDataObj:
        let dataReporting = (learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.dataReporting !== undefined &&
                            learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.dataReporting.config.printDataReports === true) ? true : false;
        if (dataReporting) {
            mlDataObj.print();
        }
        
        let xTensor = mlDataObj.featuresTensor();
        let yTensor = mlDataObj.labelsTensor();
        let modelFitDatasetArgs = {};
        
        // Should we collect any fitArgs:
        if (_learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.fitDataset !== undefined) {
            modelFitDatasetArgs = fitArgsConstructor();
            if (dataReporting) {
                let fitKeys = Object.keys(modelFitDatasetArgs);
                let fitVals = Object.values(modelFitDatasetArgs);
                SA.logger.info("__________________________________________________\nModel Fitting Arguments:\n==================================================");
                fitKeys.forEach((e, i) => SA.logger.info(i + ": \"" + e + "\"=>[" + fitVals[i] + "]"));
            }
        }

        SA.logger.info("__________________________________________________\nTraining " +
            _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.name +
            ":\n==================================================");

        const history = await _tensorFlowModel.fit(xTensor, yTensor, modelFitDatasetArgs);
        isTrained = true;

        if (dataReporting) {
            SA.logger.info("\n__________________________________________________\nModel Fitting Report:\n==================================================");
            SA.logger.info("First Epoch #1:\n\tacc=>" + history.history.acc[0] + "\n\tloss=>" + history.history.loss[0]);
            let totalEpochs = history.epoch.length;
            SA.logger.info("Final Epoch #" + totalEpochs + ":\n\tacc=>" + history.history.acc[totalEpochs - 1] + "\n\tloss=>" + history.history.loss[totalEpochs - 1] + "\n__________________________________________________");
        }
    }


    /* Construct modelFitDatasetArgs by collecting available arguments: */
    function fitArgsConstructor() {
        let modelFitDatasetArgs = {};
        let fitDatasetNode = _learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.fitDataset;
        // verbose- Verbosity level:
        if (fitDatasetNode.verbose !== undefined) {
            if (fitDatasetNode.verbose.config.value !== undefined) {
                modelFitDatasetArgs.verbose = fitDatasetNode.verbose.config.value
            }
        }
        // epochs- Integer number of times to iterate over the training data arrays:
        if (fitDatasetNode.epochs !== undefined) {
            if (fitDatasetNode.epochs.config.value !== undefined) {
                modelFitDatasetArgs.epochs = fitDatasetNode.epochs.config.value
            }
        }
        // batchSize- Number of samples per gradient update. If unspecified, it will default to 32 per tf.org:
        if (fitDatasetNode.datasetArgs !== undefined) {
            if (fitDatasetNode.datasetArgs.batchesPerGradientUpdate !== undefined &&
                    fitDatasetNode.datasetArgs.batchesPerGradientUpdate.config.value !== undefined) {
                modelFitDatasetArgs.batchSize = fitDatasetNode.datasetArgs.batchesPerGradientUpdate.config.value;
            }
            if (fitDatasetNode.datasetArgs.shuffle !== undefined &&
                    fitDatasetNode.datasetArgs.shuffle.config.booleanValue !== undefined) {
                modelFitDatasetArgs.shuffle = fitDatasetNode.datasetArgs.shuffle.config.booleanValue;
            }
            // Future Add validation split:
        }

        // This callback hard coded for now:
        modelFitDatasetArgs.callbacks = {
            onEpochEnd: (epoch, logs) => SA.logger.info("callbacks:\tEpoch:" + epoch + " | Loss=>" + logs.loss)
        }

        return modelFitDatasetArgs;
    }
}