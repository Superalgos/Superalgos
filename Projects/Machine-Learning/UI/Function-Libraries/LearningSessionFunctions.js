function newMachineLearningFunctionLibraryLearningSessionFunctions() {
    let thisObject = {
        synchronizeSessionWithBackEnd: synchronizeSessionWithBackEnd,
        runSession: runSession,
        stopSession: stopSession
    }

    return thisObject

    function synchronizeSessionWithBackEnd(node) {
        let validationsResult = validations(node)
        if (validationsResult === undefined) {
            /* If something fails at validations we just quit. */
            return
        }
        let lanNetworkNode = validationsResult.lanNetworkNode
        if (lanNetworkNode === undefined) {
            /* Nodes that do not belong to a network can not get ready. */
            return
        }

        let eventsServerClient = UI.projects.foundations.spaces.designSpace.workspace.eventsServerClients.get(lanNetworkNode.id)

        /* First we setup everything so as to listen to the response from the Task Server */
        let eventSubscriptionIdOnStatus
        let key = node.name + '-' + node.type + '-' + node.id
        eventsServerClient.listenToEvent(key, 'Status Response', undefined, node.id, onResponse, onStatus)

        function onResponse(message) {
            eventSubscriptionIdOnStatus = message.eventSubscriptionId
        }

        function onStatus(message) {
            eventsServerClient.stopListening(key, eventSubscriptionIdOnStatus, node.id)
            if (message.event.status === 'Learning Session Runnning') {
                node.payload.uiObject.menu.internalClick('Run Learning Session')
            }
        }

        /* Second we ask the Task Server if this Session is Running. */
        eventsServerClient.raiseEvent(key, 'Learning Session Status')
    }

    function runSession(node, resume, callBackFunction) {

        if (UI.environment.DEMO_MODE === true) {
            if (window.location.hostname !== 'localhost') {
                node.payload.uiObject.setWarningMessage('Superalgos is running is DEMO MODE. This means that you can not execute Sessions.', 5)
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                return
            }
        }

        let validationsResult = validations(node)
        if (validationsResult === undefined) {
            /* If something fails at validations we just quit. */
            return
        }
        let lanNetworkNode = validationsResult.lanNetworkNode
        if (lanNetworkNode === undefined) {
            /* This means that the validations failed. */
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }

        let eventsServerClient = UI.projects.foundations.spaces.designSpace.workspace.eventsServerClients.get(lanNetworkNode.id)

        node.payload.uiObject.run(eventsServerClient, callBackFunction)

        let key = node.name + '-' + node.type + '-' + node.id

        let lightingPath = '' +
            'Learning System->' +
            'TensorFlow Library->' +
            'Execution Environment->Supervised Learning->Unsupervised Learning->Self Learning->Reinforcement Learning->' +
            'WebGL Backend->NodeJS Backend->WASM Backend->CPU Backend->' +
            'Environment Flags->Debug Mode->Production Mode->' +
            'Supervised Learning->Unsupervised Learning->Self Learning->Reinforcement Learning->' +
            'Artificial Neural Network->Model->' +
            'Logistic Regression->Model->' +
            'Compile->Optimizer->Loss Function->Metrics->Optimizer by Name->SGD Instance->Momentum Instance->Adagrad Instance->Adadelta Instance->Adam Instance->Rmsprop Instance->' +
            'Fit Dataset->Verbose->Epochs->Callbacks->Dataset Args->Batches Per Gradient Update->Shuffle->' +
            'Layers API->Core API->' +
            'Sequential Model->Functional Model->' +
            'Data Reporting->' +
            'Input Layer->Sequential layer->Output Layer->' +
            'Input Features->Data Feature->Feature Formula->Input Shape->Batch Input Shape->Feature Preprocessing->MinMax Scaler->Standard Scaler->Collection Condition->' +
            'Output Labels->Data Label->Label Formula->' +
            'Advanced Activation Layers->Basic Layers->Convolutional Layers->' +
            'Conv 1D Layer->Conv 2D Layer->Conv 2D Transpose Layer->Conv 3D Layer->Cropping 2D Layer->Depthwise Convo 2D Layer->Separable Convo 2D Layer->Up Sampling 2D Layer->' +
            'Activation Layer->Dense Layer->Dropout Layer->Embedding Layer->Flatten Layer->Permutable Layer->Rrepeat Vector Layer->Reshape Layer->Spatial Dropout 1D Layer->' +
            'Elu Layer->Leaky Relu Layer->Prelu Layer->Relu Layer->Softmax Layer->Thresholded Relu Layer->' +
            'Dimensionality Units->Activation Function->Dtype->Trainable->Weights->Tensor->Kernel->Bias->' +
            'Kernel Initializer->Kernel Constraint->Kernel Regularizer->' +
            'Bias Initializer->Bias Constraint->Bias Regularizer->'

        let learningSystem = UI.projects.visualScripting.functionLibraries.protocolNode.getProtocolNode(node.learningSystemReference.payload.referenceParent, false, true, true, false, false, lightingPath)

        lightingPath = '' +
            'Learning Engine->' +
            'Learning Current->Learning Last->Previous->' +
            'Learning Episode->' +
            'Episode Base Asset->Episode Quoted Asset->Learning Episode Counters->Learning Episode Statistics->' +
            'Strategies->Positions->Orders->Hits->Fails->' +
            'Profit Loss->Hit Ratio->Hit Fail->Days->ROI->Annualized Rate Of Return->User Defined Statistic->' +
            'Candle->Cycle->' +
            'Begin->End->Last Begin->Last End->Open->Close->Min->Max->Index->' +
            'Distance To Learning Event->' +
            'Head Of The Market->Process Date->' +
            'Trigger On->Trigger Off->Take Position->Close Position->Next Phase->Move To Phase->Create Order->Cancel Order->Close Order->' +
            'Strategy->' +
            'Strategy Counters->' +
            'Position->' +
            'Entry Target Rate->Exit Target Rate->' +
            'Stop Loss->Stop Loss Phase->Stop Loss Position->Begin->End->Initial Value->Final Value->' +
            'Take Profit->Take Profit Phase->Take Profit Position->Begin->End->Initial Value->Final Value->' +
            'Position Counters->' +
            'Position Statistics->Days->User Defined Statistic->' +
            'Position Base Asset->Position Quoted Asset->Entry Target Size->Exit Target Size->' +
            'Profit Loss->ROI->Hit Fail->' +
            'Exchange Orders->Market Buy Orders->Market Sell Orders->Limit Buy Orders->Limit Sell Orders->' +
            'Market Order->Limit Order->' +
            'Exchange Id->Rate->Order Name->Algorithm Name->Lock->' +
            'Order Counters->' +
            'Order Base Asset->Order Quoted Asset->' +
            'Actual Size->Size->Size Filled->Amount Received->Fees Paid->Fees To Be Paid->' +
            'Order Statistics->Percentage Filled->Actual Rate->Days->User Defined Statistic->' +
            'Strategy Trigger Stage->Strategy Open Stage->Strategy Manage Stage->Strategy Close Stage->' +
            'Begin->End->Exit Type->Status->Begin Rate->End Rate->Stage Base Asset->Stage Quoted Asset->Size Placed->Target Size->Size Filled->Fees Paid->Stage Defined In->' +
            'Serial Number->Identifier->Begin->End->Begin Rate->End Rate->Strategy Name->Status->Exit Type->' +
            'Balance->Begin Balance->End Balance->' +
            'Index->Situation Name->Formula->Periods->' +
            'Features->Feature->Begin->End->Feature Value->' +
            'Labels->Label->Begin->End->Label Value->' +
            'Predictions->Prediction->Begin->End->Prediction Value->'

        let learningEngine = UI.projects.visualScripting.functionLibraries.protocolNode.getProtocolNode(node.learningEngineReference.payload.referenceParent, false, true, true, false, false, lightingPath)

        lightingPath = '' +
            'Back Learning Session->Live Learning Session->' +
            'Learning Parameters->' +
            'Learning Algorithm->Time Range->Time Frame->Heartbeats->User Defined Parameters->' +
            'Social Bots->Telegram Bot->Discord Bot->Slack Bot->Twitter Bot ->'

        let session = UI.projects.visualScripting.functionLibraries.protocolNode.getProtocolNode(node, false, true, true, false, false, lightingPath)

        let defaultExchange = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(validationsResult.exchange.payload, 'codeName')
        let defaultMarket =
            UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(validationsResult.market.baseAsset.payload.referenceParent.payload, 'codeName')
            + '-' +
            UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(validationsResult.market.quotedAsset.payload.referenceParent.payload, 'codeName')

        let dependencyFilter = UI.projects.foundations.functionLibraries.dependenciesFilter.createDependencyFilter(
            defaultExchange,
            defaultMarket,
            node.learningSystemReference.payload.referenceParent
        )

        /* Raise event to run the session */
        let event = {
            session: JSON.stringify(session),
            learningSystem: JSON.stringify(learningSystem),
            learningEngine: JSON.stringify(learningEngine),
            dependencyFilter: JSON.stringify(dependencyFilter),
            resume: resume
        }

        if (resume !== true) {
            eventsServerClient.raiseEvent(key, 'Run Learning Session', event)
        } else {
            eventsServerClient.raiseEvent(key, 'Resume Learning Session', event)
        }

        if (node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }
    }

    function stopSession(node, callBackFunction) {

        if (UI.environment.DEMO_MODE === true) {
            if (window.location.hostname !== 'localhost') {
                node.payload.uiObject.setWarningMessage('Superalgos is running is DEMO MODE. This means that you can not STOP Sessions.', 5)
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                return
            }
        }

        let validationsResult = validations(node)
        if (validationsResult === undefined) {
            /* If something fails at validations we just quit. */
            return
        }
        let lanNetworkNode = validationsResult.lanNetworkNode
        if (lanNetworkNode === undefined) {
            /* This means that the validations failed. */
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }

        let eventsServerClient = UI.projects.foundations.spaces.designSpace.workspace.eventsServerClients.get(lanNetworkNode.id)

        let key = node.name + '-' + node.type + '-' + node.id
        eventsServerClient.raiseEvent(key, 'Stop Learning Session')

        node.payload.uiObject.stop(callBackFunction, undefined, true)
    }

    function validations(node) {

        let result = {}

        if (node.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs a Process Instance parent to be able to run.')
            return
        }

        if (node.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs to be inside a Process Instance node.')
            return
        }

        if (node.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs to be inside a Task.')
            return
        }

        if (node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs to be inside a Task Manager.')
            return
        }

        result.taskManager = node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode

        if (result.taskManager.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs to be inside Mine Tasks.')
            return
        }

        if (result.taskManager.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs to be inside Market Tasks.')
            return
        }

        if (result.taskManager.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs to be inside Exchange Tasks.')
            return
        }

        if (result.taskManager.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs to be inside a Testing or Production Learning Tasks.')
            return
        }

        if (result.taskManager.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs to be inside a Network Node.')
            return
        }

        result.lanNetworkNode = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(result.taskManager, 'LAN Network Node', undefined, true, false, true, false)

        if (node.learningSystemReference === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs a child Learning System Reference.')
            return
        }

        if (node.learningEngineReference === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs a child Learning Engine Reference.')
            return
        }

        if (node.learningSystemReference.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('Learning System Reference needs to reference a Learning System.')
            return
        }

        if (node.learningEngineReference.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('Learning Engine Reference needs to reference a Learning Engine.')
            return
        }

        if (result.taskManager.payload.parentNode.payload.parentNode.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs to have a Default Market.')
            return
        }

        result.market = result.taskManager.payload.parentNode.payload.parentNode.payload.referenceParent

        if (result.market.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Default Market needs to be a child of Exchange Markets.')
            return
        }

        if (result.market.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Exchange Markets need to be a child of Crypto Exchange.')
            return
        }

        if (result.market.baseAsset === undefined) {
            node.payload.uiObject.setErrorMessage('Default Market needs to have a Base Asset.')
            return
        }

        if (result.market.quotedAsset === undefined) {
            node.payload.uiObject.setErrorMessage('Default Market needs to have a Quoted Asset.')
            return
        }

        if (result.market.baseAsset.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('Market Base Asset needs to reference an Asset.')
            return
        }

        if (result.market.quotedAsset.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('Market Quoted Asset needs to reference an Asset.')
            return
        }

        result.exchange = result.market.payload.parentNode.payload.parentNode

        return result
    }
}
