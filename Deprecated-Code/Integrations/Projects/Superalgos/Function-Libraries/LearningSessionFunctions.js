function newLearningSessionFunctions() {
    thisObject = {
        syncronizeSessionWithBackEnd: syncronizeSessionWithBackEnd, 
        runSession: runSession,
        stopSession: stopSession
    }

    return thisObject

    function syncronizeSessionWithBackEnd(node) {
        let networkNode = validations(node)
        if (networkNode === undefined) {
            /* Nodes that do not belong to a network can not get ready. */
            return
        }

        let eventsServerClient = UI.projects.superalgos.spaces.designSpace.workspace.eventsServerClients.get(networkNode.id)

        /* First we setup everything so as to listen to the response from the Task Server */
        let eventSubscriptionIdOnStatus
        let key = node.name + '-' + node.type + '-' + node.id
        eventsServerClient.listenToEvent(key, 'Status Response', undefined, node.id, onResponse, onStatus)

        function onResponse(message) {
            eventSubscriptionIdOnStatus = message.eventSubscriptionId
        }

        function onStatus(message) {
            eventsServerClient.stopListening(key, eventSubscriptionIdOnStatus, node.id)
            if (message.event.status === 'Learning Session Runnning' ) {
                node.payload.uiObject.menu.internalClick('Run Learning Session')
            }
        }

        /* Second we ask the Task Server if this Session is Running. */
        eventsServerClient.raiseEvent(key, 'Learning Session Status')
    }

    function runSession(node, functionLibraryProtocolNode, functionLibraryDependenciesFilter, resume, callBackFunction) {
        let networkNode = validations(node)
        if (networkNode === undefined) {
            /* This means that the validations failed. */
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }

        let eventsServerClient = UI.projects.superalgos.spaces.designSpace.workspace.eventsServerClients.get(networkNode.id)

        node.payload.uiObject.run(eventsServerClient, callBackFunction)

        let key = node.name + '-' + node.type + '-' + node.id

        let lightingPath = '' +
            'Trading System->' +
            'Dynamic Indicators->Indicator Function->Formula->' +
            'Trading Strategy->' +
            'Trigger Stage->Trigger On Event->Trigger Off Event->Take Position Event->' +
            'Announcement->Announcement Formula->' +
            'Open Stage->' +
            'Manage Stage->' +
            'Managed Stop Loss->Managed Take Profit->' +
            'Phase->Formula->Next Phase Event->Move To Phase Event->Phase->' +
            'Situation->Condition->Javascript Code->' +
            'Close Stage->' +
            'Initial Targets->Target Size In Base Asset->Target Size In Quoted Asset->Target Rate->Formula->' +
            'Announcement->Announcement Formula->' +
            'Open Execution->Close Execution->' +
            'Execution Algorithm->Market Buy Order->Market Sell Order->Limit Buy Order->Limit Sell Order->' +
            'Order Rate->Formula->' +
            'Create Order Event->Cancel Order Event->' +
            'Size In Base Asset->Size In Quoted Asset->Position Rate->Formula->' +
            'Situation->Condition->Javascript Code->' +
            'Market Order->Limit Order->' +
            'Simulated Exchange Events->Simulated Partial Fill->Simulated Actual Rate->Simulated Fees Paid->Formula->'

        let tradingSystem = functionLibraryProtocolNode.getProtocolNode(node.tradingSystemReference.payload.referenceParent, false, true, true, false, false, lightingPath)

        lightingPath = '' +
            'Trading Engine->' +
            'Dynamic Indicators->Indicator Function->' +
            'Current->Last->Previous->' +
            'Episode->' +
            'Episode Base Asset->Episode Quoted Asset->Episode Counters->Episode Statistics->' +
            'Strategies->Positions->Orders->Hits->Fails->' +
            'Profit Loss->Hit Ratio->Hit Fail->Days->ROI->Annualized Rate Of Return->User Defined Statistic->' +
            'Candle->Cycle->' +
            'Begin->End->Last Begin->Last End->Open->Close->Min->Max->Index->' +
            'Distance To Event->' +
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
            'Index->Situation Name->Formula->Periods->'

        let tradingEngine = functionLibraryProtocolNode.getProtocolNode(node.tradingEngineReference.payload.referenceParent, false, true, true, false, false, lightingPath)

        lightingPath = '' +
            'Learning Session->' +
            'Learning Parameters->' +
            'Session Base Asset->Session Quoted Asset->Time Range->Time Frame->Slippage->Fee Structure->Snapshots->Heartbeats->User Defined Parameters->' +
            'Exchange Account Asset->Asset->' +
            'Social Bots->Telegram Bot->'

        let session = functionLibraryProtocolNode.getProtocolNode(node, false, true, true, false, false, lightingPath)

        let dependencyFilter = functionLibraryDependenciesFilter.createFilter(node.tradingSystemReference.payload.referenceParent)

        /* Raise event to run the session */
        let event = {
            session: JSON.stringify(session),
            tradingSystem: JSON.stringify(tradingSystem),
            tradingEngine: JSON.stringify(tradingEngine),
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

    function stopSession(node, functionLibraryProtocolNode, callBackFunction) {
        let networkNode = validations(node)
        if (networkNode === undefined) {
            /* This means that the validations failed. */
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            return
        }
        
        let eventsServerClient = UI.projects.superalgos.spaces.designSpace.workspace.eventsServerClients.get(networkNode.id)

        let key = node.name + '-' + node.type + '-' + node.id
        eventsServerClient.raiseEvent(key, 'Stop Learning Session')

        node.payload.uiObject.stop(callBackFunction, undefined, true)
    }

    function validations(node) {
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

        let taskManager = node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode

        if (taskManager.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs to be inside Mine Tasks.')
            return
        }

        if (taskManager.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs to be inside Market Tasks.')
            return
        }

        if (taskManager.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs to be inside Exchange Tasks.')
            return
        }

        if (taskManager.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs to be inside a Testing or Production Environment.')
            return
        }

        if (taskManager.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs to be inside a Network Node.')
            return
        }

        let networkNode = taskManager.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode

        if (node.tradingSystemReference === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs a child Trading System Reference.')
            return
        }

        if (node.tradingEngineReference === undefined) {
            node.payload.uiObject.setErrorMessage('Session needs a child Trading Engine Reference.')
            return
        }

        if (node.tradingSystemReference.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('Trading System Reference needs to reference a Trading System.')
            return
        }

        if (node.tradingEngineReference.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('Trading Engine Reference needs to reference a Trading Engine.')
            return
        }
        return networkNode
    }
}
