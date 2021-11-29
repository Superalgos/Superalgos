exports.newAlgorithmicTradingBotModulesTradingStages = function (processIndex) {
    /*
    This module packages all functions related to Stages.
    */
    const MODULE_NAME = 'Trading Stages'
    let thisObject = {
        updateChart: updateChart,
        mantain: mantain,
        reset: reset,
        cycleBasedStatistics: cycleBasedStatistics,
        runTriggerStage: runTriggerStage,
        runOpenStage: runOpenStage,
        runManageStage: runManageStage,
        runCloseStage: runCloseStage,
        exitPositionValidation: exitPositionValidation,
        updateEnds: updateEnds,
        resetTradingEngineDataStructure: resetTradingEngineDataStructure,
        updateCounters: updateCounters,
        updateStatistics: updateStatistics,
        initialize: initialize,
        finalize: finalize
    }

    let tradingStrategyModuleObject = TS.projects.algorithmicTrading.botModules.tradingStrategy.newAlgorithmicTradingBotModulesTradingStrategy(processIndex)
    let tradingPositionModuleObject = TS.projects.algorithmicTrading.botModules.tradingPosition.newAlgorithmicTradingBotModulesTradingPosition(processIndex)
    let tradingExecutionModuleObject = TS.projects.algorithmicTrading.botModules.tradingExecution.newAlgorithmicTradingBotModulesTradingExecution(processIndex)
    let announcementsModuleObject = TS.projects.socialBots.botModules.announcements.newSocialBotsBotModulesAnnouncements(processIndex)
    let outgoingTradingSignalsModuleObject = TS.projects.tradingSignals.modules.outgoingTradingSignals.newTradingSignalsModulesOutgoingTradingSignals(processIndex)
    let portfolioManagerClient = TS.projects.portfolioManagement.modules.portfolioManagerClient.newPortfolioManagementModulesPortfolioManagerClient(processIndex)
    let snapshotsModuleObject = TS.projects.algorithmicTrading.botModules.snapshots.newAlgorithmicTradingBotModulesSnapshots(processIndex)
    let tradingEpisodeModuleObject = TS.projects.algorithmicTrading.botModules.tradingEpisode.newAlgorithmicTradingBotModulesTradingEpisode(processIndex)

    let tradingEngine
    let tradingSystem
    let sessionParameters

    return thisObject

    function initialize() {
        tradingSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        tradingEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters

        tradingStrategyModuleObject.initialize()
        tradingPositionModuleObject.initialize()
        announcementsModuleObject.initialize()
        snapshotsModuleObject.initialize()
        tradingExecutionModuleObject.initialize()
        tradingEpisodeModuleObject.initialize()
    }

    function finalize() {
        tradingEngine = undefined
        tradingSystem = undefined
        sessionParameters = undefined

        tradingStrategyModuleObject.finalize()
        tradingStrategyModuleObject = undefined

        tradingPositionModuleObject.finalize()
        tradingPositionModuleObject = undefined

        announcementsModuleObject.finalize()
        announcementsModuleObject = undefined

        snapshotsModuleObject.finalize()
        snapshotsModuleObject = undefined

        tradingExecutionModuleObject.finalize()
        tradingExecutionModuleObject = undefined

        tradingEpisodeModuleObject.finalize()
        tradingEpisodeModuleObject = undefined
    }

    function updateChart(pChart, pExchange, pMarket) {
        snapshotsModuleObject.updateChart(pChart, pExchange, pMarket)
    }

    function mantain() {
        tradingPositionModuleObject.mantain()
        tradingStrategyModuleObject.mantain()
        tradingExecutionModuleObject.mantain()

        updateCounters()
        updateEnds()
    }

    function reset() {
        resetTradingEngineDataStructure()

        tradingPositionModuleObject.reset()
        tradingStrategyModuleObject.reset()
        tradingExecutionModuleObject.reset()
    }

    function cycleBasedStatistics() {
        tradingEpisodeModuleObject.cycleBasedStatistics()
        tradingPositionModuleObject.cycleBasedStatistics()
    }

    async function runTriggerStage() {
        /*
        We check if we will be triggering on, off or taking position.
        */
        await checkTriggerOn()
        await checkTriggerOff()
        await checkTakePosition()

        async function checkTriggerOn() {
            if (
                tradingEngine.tradingCurrent.strategy.index.value === tradingEngine.tradingCurrent.strategy.index.config.initialValue
            ) {
                /*
                To pick a new strategy we will check that any of the situations of the trigger on is true. 
                Once we enter into one strategy, we will ignore market conditions for others. However there is also
                a strategy trigger off which can be hit before taking a position. If hit, we would
                be outside a strategy again and looking for the conditions to enter all over again.
                */
                tradingSystem.evalConditions(tradingSystem, 'Trigger On Event')

                for (let j = 0; j < tradingSystem.tradingStrategies.length; j++) {
                    if ( // If a strategy was already picked during the loop, we exit the loop
                        tradingEngine.tradingCurrent.strategy.index.value !== tradingEngine.tradingCurrent.strategy.index.config.initialValue
                    ) { continue }

                    let strategy = tradingSystem.tradingStrategies[j]
                    let triggerStage = strategy.triggerStage

                    if (triggerStage !== undefined) {
                        if (triggerStage.triggerOn !== undefined) {
                            for (let k = 0; k < triggerStage.triggerOn.situations.length; k++) {
                                let situation = triggerStage.triggerOn.situations[k]
                                let passed
                                if (situation.conditions.length > 0) {
                                    passed = true
                                }

                                passed = tradingSystem.checkConditions(situation, passed)

                                tradingSystem.values.push([situation.id, passed])

                                let response = await portfolioManagerClient.askPortfolioEventsManager(triggerStage.triggerOn, passed)
                                passed = response.raiseEvent

                                if (passed) {

                                    tradingSystem.highlights.push(situation.id)
                                    tradingSystem.highlights.push(triggerStage.triggerOn.id)
                                    tradingSystem.highlights.push(triggerStage.id)

                                    tradingStrategyModuleObject.openStrategy(j, situation.name, strategy.name)

                                    /* Initialize this */
                                    tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.triggerOn.value = 1

                                    outgoingTradingSignalsModuleObject.broadcastSignal(triggerStage.triggerOn)
                                    announcementsModuleObject.makeAnnouncements(triggerStage.triggerOn)

                                    if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Backtesting Session') {
                                        if (sessionParameters.snapshots !== undefined) {
                                            if (sessionParameters.snapshots.config.strategy === true) {
                                                snapshotsModuleObject.strategyEntry()
                                            }
                                        }
                                    }
                                    changeStageStatus('Trigger Stage', 'Open')
                                }
                            }
                        }
                    }
                }
            }
        }

        async function checkTriggerOff() {
            if (tradingEngine.tradingCurrent.strategyTriggerStage.status.value === 'Open') {
                checkUserDefinedCode('Trigger Stage', 'Running', 'first');

                let strategy = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value]
                let triggerStage = strategy.triggerStage

                tradingSystem.evalConditions(strategy, 'Trigger Off Event')

                if (triggerStage !== undefined) {
                    if (triggerStage.triggerOff !== undefined) {
                        for (let k = 0; k < triggerStage.triggerOff.situations.length; k++) {
                            let situation = triggerStage.triggerOff.situations[k]
                            let passed
                            if (situation.conditions.length > 0) {
                                passed = true
                            }

                            passed = tradingSystem.checkConditions(situation, passed)

                            tradingSystem.values.push([situation.id, passed])

                            let response = await portfolioManagerClient.askPortfolioEventsManager(triggerStage.triggerOff, passed)
                            passed = response.raiseEvent

                            if (passed) {
                                tradingSystem.highlights.push(situation.id)
                                tradingSystem.highlights.push(triggerStage.triggerOff.id)
                                tradingSystem.highlights.push(triggerStage.id)

                                tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.triggerOff.value = 1

                                outgoingTradingSignalsModuleObject.broadcastSignal(triggerStage.triggerOff)
                                announcementsModuleObject.makeAnnouncements(triggerStage.triggerOff)
                                changeStageStatus('Trigger Stage', 'Closed', 'Trigger Off Event')
                                tradingStrategyModuleObject.closeStrategy('Trigger Off')
                            }
                        }
                    }
                }
            }
        }

        async function checkTakePosition() {
            if (
                tradingEngine.tradingCurrent.strategyTriggerStage.status.value === 'Open'
            ) {
                let strategy = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value]
                let triggerStage = strategy.triggerStage

                tradingSystem.evalConditions(strategy, 'Take Position Event')
                await tradingSystem.evalFormulas(strategy, 'Take Position Event')

                if (triggerStage !== undefined) {
                    if (triggerStage.takePosition !== undefined) {
                        for (let k = 0; k < triggerStage.takePosition.situations.length; k++) {
                            let situation = triggerStage.takePosition.situations[k]
                            let passed
                            if (situation.conditions.length > 0) {
                                passed = true
                            }

                            passed = tradingSystem.checkConditions(situation, passed)

                            tradingSystem.values.push([situation.id, passed])

                            let response = await portfolioManagerClient.askPortfolioEventsManager(triggerStage.takePosition, passed)
                            passed = response.raiseEvent

                            if (passed) {
                                tradingSystem.highlights.push(situation.id)
                                tradingSystem.highlights.push(triggerStage.takePosition.id)
                                tradingSystem.highlights.push(triggerStage.id)

                                tradingPositionModuleObject.openPosition(situation.name)

                                outgoingTradingSignalsModuleObject.broadcastSignal(triggerStage.takePosition)
                                announcementsModuleObject.makeAnnouncements(triggerStage.takePosition)

                                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Backtesting Session') {
                                    if (sessionParameters.snapshots !== undefined) {
                                        if (sessionParameters.snapshots.config.position === true) {
                                            snapshotsModuleObject.positionEntry()
                                        }
                                    }
                                }

                                changeStageStatus('Trigger Stage', 'Closed', 'Position Taken')
                                changeStageStatus('Open Stage', 'Opening')
                                changeStageStatus('Manage Stage', 'Opening')
                            } else {
                                checkUserDefinedCode('Trigger Stage', 'Running', 'last');
                            }
                        }
                    }
                }
            }
        }
    }

    async function runOpenStage() {

        checkIfWeNeedToAbortTheStage()
        await runWhenStatusIsOpening()
        await runWhenStatusIsOpen()
        await runWhenStatusIsClosing()

        function checkIfWeNeedToAbortTheStage() {
            /* Abort Open Stage Check */
            if (tradingEngine.tradingCurrent.strategyOpenStage.status.value === 'Open' &&
                (tradingEngine.tradingCurrent.strategyCloseStage.status.value === 'Opening' || tradingEngine.tradingCurrent.strategyCloseStage.status.value === 'Open')) {
                /* 
                if the Close stage is opened while the open stage is still open that means that
                we need to stop placing orders, check what happened to the orders already placed,
                and cancel all unfilled limit orders. We call this the Closing status of the Open Stage.
                */
                changeStageStatus('Open Stage', 'Closing')
            }
        }

        async function runWhenStatusIsOpening() {
            /* Opening Status Procedure */
            if (tradingEngine.tradingCurrent.strategyOpenStage.status.value === 'Opening') {
                /*
                The system allows the user not to define an Open Stage, because the Open Stage is optional.
                Here we are going to see if that is the case and if it is, we will immediately consider 
                the Open Stage as closed.
                */
                if (tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value].openStage === undefined) {
                    changeStageStatus('Open Stage', 'Closed', 'Open Stage Undefined')
                    changeStageStatus('Close Stage', 'Opening')
                    return
                }

                /* This procedure is intended to run only once */
                let tradingSystemStage = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value].openStage
                let tradingEngineStage = tradingEngine.tradingCurrent.strategyOpenStage

                /* Reset the Exchange Orders data structure to its initial value */
                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.initializeNode(tradingEngine.exchangeOrders)

                /* Entry Position size and rate */
                await tradingSystem.evalFormulas(tradingSystemStage, 'Initial Targets')
                tradingPositionModuleObject.initialTargets(tradingSystemStage, tradingEngineStage)
                initializeStageTargetSize()

                /* From here on, the stage is officially Open */
                changeStageStatus('Open Stage', 'Open')
            }
        }

        async function runWhenStatusIsOpen() {
            /* Open Status Procedure */
            if (tradingEngine.tradingCurrent.strategyOpenStage.status.value === 'Open') {
                /*
                While the Open Stage is Open, we do our regular stuff: place orders and check 
                what happened to the orders already placed.
                */
                checkUserDefinedCode('Open Stage', 'Running', 'first');
                let tradingSystemStage = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value].openStage
                let tradingEngineStage = tradingEngine.tradingCurrent.strategyOpenStage
                let executionNode = tradingSystemStage.openExecution

                /* Evaluate conditions and formulas so they are ready during the execution run */
                tradingSystem.evalConditions(executionNode, 'Open Execution')
                await tradingSystem.evalFormulas(executionNode, 'Open Execution')

                await tradingExecutionModuleObject.runExecution(
                    executionNode,
                    tradingEngineStage
                )
                checkIfStageNeedsToBeClosed(tradingEngineStage, tradingSystemStage, 'Open Stage')

                /* User Defined Code if runWhileAtStage==true */
                if (tradingEngine.tradingCurrent.strategyOpenStage.status.value === 'Open') {
                    checkUserDefinedCode('Open Stage', 'Running', 'last');
                }
            }
        }

        async function runWhenStatusIsClosing() {
            /* Closing Status Procedure */
            if (tradingEngine.tradingCurrent.strategyOpenStage.status.value === 'Closing') {
                /*
                During the closing stage status, we do not place new orders, just check 
                if the ones placed were filled, and cancel the ones not filled.
                */
                let tradingSystemStage = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value].openStage
                let executionNode = tradingSystemStage.openExecution

                /* 
                Check if there are unfilled orders, we will check if they were executed, 
                and cancel the ones that were not. 
                */
                tradingSystem.evalConditions(tradingSystemStage, 'Open Execution')
                await tradingSystem.evalFormulas(tradingSystemStage, 'Open Execution')

                await tradingExecutionModuleObject.runExecution(
                    executionNode,
                    tradingEngine.tradingCurrent.strategyOpenStage
                )

                /*
                The Closing is finished when the sizeFilled + feesPaid reaches the sizePlaced.
                This can happens either because we update the sizeFilled value when we see 
                at the exchange that orders were filled, or we reduce the sizePlaced when
                we cancel not yet filled orders. Here it does not matter the targetSize since
                this status represent a force closure of this stage.
                */
                switch (tradingEngine.tradingCurrent.strategyOpenStage.stageDefinedIn.value) {
                    case 'Base Asset': {
                        if (
                            tradingEngine.tradingCurrent.strategyOpenStage.stageBaseAsset.sizeFilled.value >=
                            tradingEngine.tradingCurrent.strategyOpenStage.stageBaseAsset.sizePlaced.value
                        ) {
                            changeStageStatus('Open Stage', 'Closed')
                        }
                        break
                    }
                    case 'Quoted Asset': {
                        if (
                            tradingEngine.tradingCurrent.strategyOpenStage.stageQuotedAsset.sizeFilled.value >=
                            tradingEngine.tradingCurrent.strategyOpenStage.stageQuotedAsset.sizePlaced.value
                        ) {
                            changeStageStatus('Open Stage', 'Closed')
                        }
                        break
                    }
                }
            }
        }

        function initializeStageTargetSize() {
            /*
            Validations that all needed nodes are there.
            */
            if (tradingEngine.tradingCurrent.strategyOpenStage.stageBaseAsset === undefined) { badDefinitionUnhandledException(undefined, 'Stage Base Asset Node Missing', tradingEngine.tradingCurrent.strategyOpenStage) }
            if (tradingEngine.tradingCurrent.strategyOpenStage.stageBaseAsset.targetSize === undefined) { badDefinitionUnhandledException(undefined, 'Target Size Node Missing', tradingEngine.tradingCurrent.strategyOpenStage.stageBaseAsset) }
            if (tradingEngine.tradingCurrent.strategyOpenStage.stageQuotedAsset === undefined) { badDefinitionUnhandledException(undefined, 'Stage Quoted Asset Node Missing', tradingEngine.tradingCurrent.strategyOpenStage) }
            if (tradingEngine.tradingCurrent.strategyOpenStage.stageQuotedAsset.targetSize === undefined) { badDefinitionUnhandledException(undefined, 'Target Size Node Missing', tradingEngine.tradingCurrent.strategyOpenStage.stageQuotedAsset) }
            /*
            Here we will transform the position size into targets for each asset of the stage.
            */
            tradingEngine.tradingCurrent.strategyOpenStage.stageBaseAsset.targetSize.value = tradingEngine.tradingCurrent.position.positionBaseAsset.entryTargetSize.value
            tradingEngine.tradingCurrent.strategyOpenStage.stageQuotedAsset.targetSize.value = tradingEngine.tradingCurrent.position.positionQuotedAsset.entryTargetSize.value

            tradingEngine.tradingCurrent.strategyOpenStage.stageBaseAsset.targetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.strategyOpenStage.stageBaseAsset.targetSize.value, 10)
            tradingEngine.tradingCurrent.strategyOpenStage.stageQuotedAsset.targetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.strategyOpenStage.stageQuotedAsset.targetSize.value, 10)
        }
    }

    async function runManageStage() {

        if (tradingEngine.tradingCurrent.tradingEpisode.cycle.value !== 'First') { return }

        runWhenStatusIsOpening()
        await runWhenStatusIsOpen()

        function runWhenStatusIsOpening() {
            /* Opening Status Procedure */
            if (tradingEngine.tradingCurrent.strategyManageStage.status.value === 'Opening') {
                let strategy = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value]
                let manageStage = strategy.manageStage

                /*
                The system allows the user not to define a Manage Stage, because the Manage Stage is optional.
                Here we are going to see if that is the case and if it is, we will immediately consider
                the Manage Stage as closed.
                */
                if (manageStage === undefined) {
                    changeStageStatus('Manage Stage', 'Closed', 'Manage Stage Undefined')
                    if (tradingEngine.tradingCurrent.strategyOpenStage.status.value !== 'Open' && tradingEngine.tradingCurrent.strategyOpenStage.status.value !== 'Opening') {
                        changeStageStatus('Close Stage', 'Opening');
                    }
                    return
                }

                /* Now we switch to the Open status. */
                changeStageStatus('Manage Stage', 'Open')
            }
        }

        async function runWhenStatusIsOpen() {
            /* Open Status Procedure */
            if (tradingEngine.tradingCurrent.strategyManageStage.status.value === 'Open') {
                checkUserDefinedCode('Manage Stage', 'Running', 'first');
                let strategy = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value]
                let manageStage = strategy.manageStage

                /* Evaluate all the stage conditions and formulas to have them ready */
                tradingSystem.evalConditions(manageStage, 'Manage Stage')
                await tradingSystem.evalFormulas(manageStage, 'Manage Stage')

                /* Stop Loss Management */
                checkStopPhasesEvents()
                calculateStopLoss()
                calculateStopLossPosition()

                /* Take Profit Management */
                checkTakeProfitPhaseEvents()
                calculateTakeProfit()
                calculateTakeProfitPosition()

                /* Checking if Stop or Take Profit were hit */
                checkStopLossOrTakeProfitWasHit()

                /* If User Defined Code exists check for runWhileAtStage */
                if (tradingEngine.tradingCurrent.strategyManageStage.status.value === 'Open') {
                    checkUserDefinedCode('Manage Stage', 'Running', 'last');
                }
            }

            function calculateStopLoss() {
                let strategy = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value]
                let manageStage = strategy.manageStage
                let phase

                if (manageStage !== undefined) {
                    if (manageStage.managedStopLoss !== undefined) {
                        phase = manageStage.managedStopLoss.phases[tradingEngine.tradingCurrent.position.stopLoss.stopLossPhase.value - 1]
                    }
                }

                if (phase !== undefined) {
                    if (phase.formula !== undefined) {
                        let previousValue = tradingEngine.tradingCurrent.position.stopLoss.value
                        tradingPositionModuleObject.applyStopLossFormula(tradingSystem.formulas, phase.formula.id)

                        if (tradingEngine.tradingCurrent.position.stopLoss.value !== previousValue) {
                            announcementsModuleObject.makeAnnouncements(phase)
                        }
                    }
                }
            }

            function calculateTakeProfit() {
                let strategy = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value]
                let manageStage = strategy.manageStage
                let phase

                if (manageStage !== undefined) {
                    if (manageStage.managedTakeProfit !== undefined) {
                        phase = manageStage.managedTakeProfit.phases[tradingEngine.tradingCurrent.position.takeProfit.takeProfitPhase.value - 1]
                    }
                }

                if (phase !== undefined) {
                    if (phase.formula !== undefined) {
                        let previousValue = tradingEngine.tradingCurrent.position.takeProfit.value
                        tradingPositionModuleObject.applyTakeProfitFormula(tradingSystem.formulas, phase.formula.id)

                        if (tradingEngine.tradingCurrent.position.takeProfit.value !== previousValue) {
                            announcementsModuleObject.makeAnnouncements(phase)
                        }
                    }
                }
            }

            function calculateStopLossPosition() {
                /*
                The position of the Stop Loss (above or below the price) is needed in order to know
                later if the price hit the Stop Loss or not at every Simulation candle. When we get 
                the first values of the simulation of the Stop Loss we check if it is above or below
                the Position Rate, and we assign the values Above or Below to it. 
                */
                if (tradingEngine.tradingCurrent.position.stopLoss.stopLossPosition.value === tradingEngine.tradingCurrent.position.stopLoss.stopLossPosition.config.initialValue) {
                    if (tradingEngine.tradingCurrent.position.stopLoss.value > tradingEngine.tradingCurrent.position.entryTargetRate.value) {
                        tradingEngine.tradingCurrent.position.stopLoss.stopLossPosition.value = 'Above'
                    } else {
                        tradingEngine.tradingCurrent.position.stopLoss.stopLossPosition.value = 'Below'
                    }
                }
            }

            function calculateTakeProfitPosition() {
                /*
                The position of the Take Profit (above or below the price) is needed in order to know
                later if the price hit the Take Profit or not at every Simulation candle. When we get 
                the first values of the simulation of the Take Profits we check if it is above or below
                the Position Rates, and we assign the values Above or Below to it. 
                */
                if (tradingEngine.tradingCurrent.position.takeProfit.takeProfitPosition.value === tradingEngine.tradingCurrent.position.takeProfit.takeProfitPosition.config.initialValue) {
                    if (tradingEngine.tradingCurrent.position.takeProfit.value > tradingEngine.tradingCurrent.position.entryTargetRate.value) {
                        tradingEngine.tradingCurrent.position.takeProfit.takeProfitPosition.value = 'Above'
                    } else {
                        tradingEngine.tradingCurrent.position.takeProfit.takeProfitPosition.value = 'Below'
                    }
                }
            }

            function checkStopPhasesEvents() {
                let strategy = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value]
                let manageStage = strategy.manageStage
                let parentNode
                let phaseIndex
                let phase
                let stopLoss

                if (manageStage !== undefined) {
                    if (manageStage.managedStopLoss !== undefined) {
                        parentNode = manageStage
                        phaseIndex = tradingEngine.tradingCurrent.position.stopLoss.stopLossPhase.value - 1
                        stopLoss = manageStage.managedStopLoss
                        phase = stopLoss.phases[phaseIndex]
                    }
                }

                if (parentNode !== undefined) {
                    if (phase === undefined) { return } // trying to jump to a phase that does not exists.

                    /* Check the next Phase Event. */
                    let nextPhaseEvent = phase.nextPhaseEvent
                    if (nextPhaseEvent !== undefined) {
                        for (let k = 0; k < nextPhaseEvent.situations.length; k++) {
                            let situation = nextPhaseEvent.situations[k]
                            let passed
                            if (situation.conditions.length > 0) {
                                passed = true
                            }

                            passed = tradingSystem.checkConditions(situation, passed)

                            tradingSystem.values.push([situation.id, passed])
                            if (passed) {
                                tradingSystem.highlights.push(situation.id)
                                tradingSystem.highlights.push(nextPhaseEvent.id)
                                tradingSystem.highlights.push(phase.id)
                                tradingSystem.highlights.push(stopLoss.id)
                                tradingSystem.highlights.push(parentNode.id)
                                tradingSystem.highlights.push(manageStage.id)

                                tradingPositionModuleObject.updateStopLoss(tradingEngine.tradingCurrent.position.stopLoss.stopLossPhase.value + 1)

                                announcementsModuleObject.makeAnnouncements(nextPhaseEvent)

                                /* Reset this counter */
                                tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.nextPhase.value = 1
                                return // only one event can pass at the time
                            }
                        }
                    }

                    /* Check the Move to Phase Events. */
                    for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                        let moveToPhaseEvent = phase.moveToPhaseEvents[n]
                        if (moveToPhaseEvent !== undefined) {
                            for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {
                                let situation = moveToPhaseEvent.situations[k]
                                let passed
                                if (situation.conditions.length > 0) {
                                    passed = true
                                }

                                passed = tradingSystem.checkConditions(situation, passed)

                                tradingSystem.values.push([situation.id, passed])
                                if (passed) {
                                    tradingSystem.highlights.push(situation.id)
                                    tradingSystem.highlights.push(moveToPhaseEvent.id)
                                    tradingSystem.highlights.push(phase.id)
                                    tradingSystem.highlights.push(stopLoss.id)
                                    tradingSystem.highlights.push(parentNode.id)
                                    tradingSystem.highlights.push(manageStage.id)

                                    let moveToPhase = moveToPhaseEvent.referenceParent
                                    if (moveToPhase !== undefined) {
                                        for (let q = 0; q < stopLoss.phases.length; q++) {
                                            if (stopLoss.phases[q].id === moveToPhase.id) {
                                                tradingPositionModuleObject.updateStopLoss(q + 1)
                                            }
                                        }
                                    } else {

                                        let docs = {
                                            project: 'Foundations',
                                            category: 'Topic',
                                            type: 'TS LF Trading Bot Error - Reference to Phase Node Missing',
                                            placeholder: {}
                                        }

                                        tradingSystem.addError([moveToPhaseEvent.id, 'This Node needs to reference a Phase.', docs])
                                        continue
                                    }

                                    announcementsModuleObject.makeAnnouncements(moveToPhaseEvent)

                                    /* Reset this counter */
                                    tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.moveToPhase.value = 1
                                    return // only one event can pass at the time
                                }
                            }
                        }
                    }
                }
            }

            function checkTakeProfitPhaseEvents() {
                let strategy = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value]
                let openStage = strategy.openStage
                let manageStage = strategy.manageStage
                let parentNode
                let phaseIndex
                let phase
                let takeProfit

                if (manageStage !== undefined) {
                    if (manageStage.managedTakeProfit !== undefined) {
                        parentNode = manageStage
                        phaseIndex = tradingEngine.tradingCurrent.position.takeProfit.takeProfitPhase.value - 1
                        takeProfit = manageStage.managedTakeProfit
                        phase = takeProfit.phases[phaseIndex]
                    }
                }

                if (parentNode !== undefined) {
                    if (phase === undefined) { return } // trying to jump to a phase that does not exists.

                    /* Check the next Phase Event. */
                    let nextPhaseEvent = phase.nextPhaseEvent
                    if (nextPhaseEvent !== undefined) {
                        for (let k = 0; k < nextPhaseEvent.situations.length; k++) {
                            let situation = nextPhaseEvent.situations[k]
                            let passed
                            if (situation.conditions.length > 0) {
                                passed = true
                            }

                            passed = tradingSystem.checkConditions(situation, passed)

                            tradingSystem.values.push([situation.id, passed])
                            if (passed) {
                                tradingSystem.highlights.push(situation.id)
                                tradingSystem.highlights.push(nextPhaseEvent.id)
                                tradingSystem.highlights.push(phase.id)
                                tradingSystem.highlights.push(takeProfit.id)
                                tradingSystem.highlights.push(parentNode.id)
                                tradingSystem.highlights.push(manageStage.id)

                                tradingPositionModuleObject.updateTakeProfit(tradingEngine.tradingCurrent.position.takeProfit.takeProfitPhase.value + 1)

                                outgoingTradingSignalsModuleObject.broadcastSignal(nextPhaseEvent)
                                announcementsModuleObject.makeAnnouncements(nextPhaseEvent)

                                /* Reset this counter */
                                tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.nextPhase.value = 1
                                return // only one event can pass at the time
                            }
                        }
                    }

                    /* Check the Move to Phase Events. */
                    for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                        let moveToPhaseEvent = phase.moveToPhaseEvents[n]
                        if (moveToPhaseEvent !== undefined) {
                            for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {
                                let situation = moveToPhaseEvent.situations[k]
                                let passed
                                if (situation.conditions.length > 0) {
                                    passed = true
                                }

                                passed = tradingSystem.checkConditions(situation, passed)

                                tradingSystem.values.push([situation.id, passed])
                                if (passed) {
                                    tradingSystem.highlights.push(situation.id)
                                    tradingSystem.highlights.push(moveToPhaseEvent.id)
                                    tradingSystem.highlights.push(phase.id)
                                    tradingSystem.highlights.push(takeProfit.id)
                                    tradingSystem.highlights.push(parentNode.id)
                                    tradingSystem.highlights.push(manageStage.id)

                                    let moveToPhase = moveToPhaseEvent.referenceParent
                                    if (moveToPhase !== undefined) {
                                        for (let q = 0; q < takeProfit.phases.length; q++) {
                                            if (takeProfit.phases[q].id === moveToPhase.id) {
                                                tradingPositionModuleObject.updateTakeProfit(q + 1)
                                            }
                                        }
                                    } else {

                                        let docs = {
                                            project: 'Foundations',
                                            category: 'Topic',
                                            type: 'TS LF Trading Bot Error - Reference to Phase Node Missing',
                                            placeholder: {}
                                        }

                                        tradingSystem.addError([moveToPhaseEvent.id, 'This Node needs to reference a Phase.', docs])
                                        continue
                                    }

                                    outgoingTradingSignalsModuleObject.broadcastSignal(moveToPhaseEvent)
                                    announcementsModuleObject.makeAnnouncements(moveToPhaseEvent)

                                    /* Reset this counter */
                                    tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.moveToPhase.value = 1
                                    return // only one event can pass at the time
                                }
                            }
                        }
                    }
                }
            }

            function checkStopLossOrTakeProfitWasHit() {
                let strategy = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value]
                /* 
                Checking what happened since the last execution. We need to know if the Stop Loss
                or our Take Profit were hit. 
                */

                /* Stop Loss condition: Here we verify if the Stop Loss was hit or not. */
                if (
                    (
                        tradingEngine.tradingCurrent.position.stopLoss.stopLossPosition.value === 'Above' &&
                        tradingEngine.tradingCurrent.tradingEpisode.candle.max.value >= tradingEngine.tradingCurrent.position.stopLoss.value
                    ) ||
                    (
                        tradingEngine.tradingCurrent.position.stopLoss.stopLossPosition.value === 'Below' &&
                        tradingEngine.tradingCurrent.tradingEpisode.candle.min.value <= tradingEngine.tradingCurrent.position.stopLoss.value
                    )
                ) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] checkStopLossOrTakeProfitWasHit -> Stop Loss was hit.')

                    tradingPositionModuleObject.closingPosition('Stop Loss')
                    changeStageStatus('Close Stage', 'Opening')
                    changeStageStatus('Manage Stage', 'Closed', 'Stop Loss Hit')
                    return
                }

                /* Take Profit condition: Here we verify if the Take Profit was hit or not. */
                if (
                    (
                        tradingEngine.tradingCurrent.position.takeProfit.takeProfitPosition.value === 'Below' &&
                        tradingEngine.tradingCurrent.tradingEpisode.candle.min.value <= tradingEngine.tradingCurrent.position.takeProfit.value
                    ) ||
                    (
                        tradingEngine.tradingCurrent.position.takeProfit.takeProfitPosition.value === 'Above' &&
                        tradingEngine.tradingCurrent.tradingEpisode.candle.max.value >= tradingEngine.tradingCurrent.position.takeProfit.value
                    )
                ) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] checkStopLossOrTakeProfitWasHit -> Take Profit was hit.')

                    tradingPositionModuleObject.closingPosition('Take Profit')
                    changeStageStatus('Close Stage', 'Opening')
                    changeStageStatus('Manage Stage', 'Closed', 'Take Profit Hit')
                    return
                }
                return
            }
        }
    }

    async function runCloseStage() {

        await runWhenStatusIsOpening()
        await runWhenStatusIsOpen()
        await runWhenStatusIsClosing()

        async function runWhenStatusIsOpening() {

            /* Opening Status Procedure */
            if (tradingEngine.tradingCurrent.strategyCloseStage.status.value === 'Opening') {
                /*
                The system allows the user not to define a close stage, because the close stage is optional.
                Here we are going to see if that is the case and if it is, we will immediately consider
                the close stage as closed.
                */
                if (tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value].closeStage === undefined) {
                    changeStageStatus('Close Stage', 'Closed', 'Close Stage Undefined')
                    return
                }

                /* 
                This will happen only once, as soon as the Take Profit or Stop was hit.
                */
                let tradingSystemStage = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value].closeStage

                /* Exit Position size and rate */
                await tradingSystem.evalFormulas(tradingSystemStage, 'Initial Targets')
                if (tradingPositionModuleObject.initialTargets(tradingSystemStage, tradingEngine.tradingCurrent.strategyCloseStage, 'Close Stage') === false) {
                    //console.log("No Close-Stage Target Asset to Trade: Strategy Closing.");
                }

                initializeStageTargetSize()
                changeStageStatus('Close Stage', 'Open')
            }
        }

        async function runWhenStatusIsOpen() {
            /* 
            The following code will run only when the Open Stage is closed.
            The reason for that is that we need the final filled size of the Open Stage
            to be known before we start placing orders at the Close Stage. 
            */
            if (
                tradingEngine.tradingCurrent.strategyCloseStage.status.value === 'Open' &&
                (
                    tradingEngine.tradingCurrent.strategyOpenStage.status.value === 'Closed' ||
                    tradingEngine.tradingCurrent.strategyOpenStage.status.value === tradingEngine.tradingCurrent.strategyOpenStage.status.config.initialValue
                )
            ) {
                /*
                This will happen as long as the Close Stage is Open.
                */
                checkUserDefinedCode('Close Stage', 'Running', 'first');
                let tradingSystemStage = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value].closeStage
                let tradingEngineStage = tradingEngine.tradingCurrent.strategyCloseStage
                let executionNode = tradingSystemStage.closeExecution

                tradingSystem.evalConditions(tradingSystemStage, 'Close Execution')
                await tradingSystem.evalFormulas(tradingSystemStage, 'Close Execution')

                await tradingExecutionModuleObject.runExecution(
                    executionNode,
                    tradingEngine.tradingCurrent.strategyCloseStage
                )

                checkIfStageNeedsToBeClosed(tradingEngineStage, tradingSystemStage, 'Close Stage')
                /* If User Defined Code exists check for runWhileAtStage */
                if (tradingEngine.tradingCurrent.strategyCloseStage.status.value === 'Open') {
                    checkUserDefinedCode('Close Stage', 'Running', 'last');
                }
            }
        }

        async function runWhenStatusIsClosing() {
            /* Closing Status Procedure */
            if (tradingEngine.tradingCurrent.strategyCloseStage.status.value === 'Closing') {
                /*
                During the closing stage status, we do not place new orders, just check
                if the ones placed were filled, and cancel the ones not filled.
                */
                let tradingSystemStage = tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value].closeStage
                let executionNode = tradingSystemStage.closeExecution

                /*
                Check if there are unfilled orders, we will check if they were executed,
                and cancel the ones that were not.
                */
                tradingSystem.evalConditions(tradingSystemStage, 'Close Execution')
                await tradingSystem.evalFormulas(tradingSystemStage, 'Close Execution')

                await tradingExecutionModuleObject.runExecution(
                    executionNode,
                    tradingEngine.tradingCurrent.strategyCloseStage
                )

                /*
                The Closing is finished when the sizeFilled + feesPaid reaches the sizePlaced.
                This can happens either because we update the sizeFilled value when we see
                at the exchange that orders were filled, or we reduce the sizePlaced when
                we cancel not yet filled orders. Here it does not matter the targetSize since
                this status represent a force closure of this stage.
                */
                switch (tradingEngine.tradingCurrent.strategyCloseStage.stageDefinedIn.value) {
                    case 'Base Asset': {
                        if (
                            tradingEngine.tradingCurrent.strategyCloseStage.stageBaseAsset.sizeFilled.value >=
                            tradingEngine.tradingCurrent.strategyCloseStage.stageBaseAsset.sizePlaced.value
                        ) {
                            changeStageStatus('Close Stage', 'Closed')
                        }
                        break
                    }
                    case 'Quoted Asset': {
                        if (
                            tradingEngine.tradingCurrent.strategyCloseStage.stageQuotedAsset.sizeFilled.value >=
                            tradingEngine.tradingCurrent.strategyCloseStage.stageQuotedAsset.sizePlaced.value
                        ) {
                            changeStageStatus('Close Stage', 'Closed')
                        }
                        break
                    }
                }
            }
        }

        function initializeStageTargetSize() {
            /*
            Validations that all needed nodes are there.
            */
            if (tradingEngine.tradingCurrent.strategyCloseStage.stageBaseAsset === undefined) { badDefinitionUnhandledException(undefined, 'Stage Base Asset Node Missing', tradingEngine.tradingCurrent.strategyCloseStage) }
            if (tradingEngine.tradingCurrent.strategyCloseStage.stageBaseAsset.targetSize === undefined) { badDefinitionUnhandledException(undefined, 'Target Size Node Missing', tradingEngine.tradingCurrent.strategyCloseStage.stageBaseAsset) }
            if (tradingEngine.tradingCurrent.strategyCloseStage.stageQuotedAsset === undefined) { badDefinitionUnhandledException(undefined, 'Stage Quoted Asset Node Missing', tradingEngine.tradingCurrent.strategyCloseStage) }
            if (tradingEngine.tradingCurrent.strategyCloseStage.stageQuotedAsset.targetSize === undefined) { badDefinitionUnhandledException(undefined, 'Target Size Node Missing', tradingEngine.tradingCurrent.strategyCloseStage.stageQuotedAsset) }
            /*
            Here we will transform the position size into targets for each asset of the stage.
            */
            tradingEngine.tradingCurrent.strategyCloseStage.stageBaseAsset.targetSize.value = tradingEngine.tradingCurrent.position.positionBaseAsset.exitTargetSize.value
            tradingEngine.tradingCurrent.strategyCloseStage.stageQuotedAsset.targetSize.value = tradingEngine.tradingCurrent.position.positionQuotedAsset.exitTargetSize.value

            tradingEngine.tradingCurrent.strategyCloseStage.stageBaseAsset.targetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.strategyCloseStage.stageBaseAsset.targetSize.value, 10)
            tradingEngine.tradingCurrent.strategyCloseStage.stageQuotedAsset.targetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.tradingCurrent.strategyCloseStage.stageQuotedAsset.targetSize.value, 10)
        }
    }

    function exitPositionValidation() {
        /* 
        Exit Position Validation: we need all the previous stages to be either closed 
        or at their initial default value. The last is because after Closed objects are 
        initialized to their defaults.
        */
        if (tradingEngine.tradingCurrent.position.status.value !== 'Open' && tradingEngine.tradingCurrent.position.status.value !== 'Closing') { return }
        if (tradingEngine.tradingCurrent.position.status.value !== 'Close' && tradingEngine.tradingCurrent.position.status.value !== 'Closing') { return }
        if (
            (
                tradingEngine.tradingCurrent.strategyTriggerStage.status.value === 'Closed' ||
                tradingEngine.tradingCurrent.strategyTriggerStage.status.value === tradingEngine.tradingCurrent.strategyTriggerStage.status.config.initialValue
            )
            &&
            (
                tradingEngine.tradingCurrent.strategyOpenStage.status.value === 'Closed' ||
                tradingEngine.tradingCurrent.strategyOpenStage.status.value === tradingEngine.tradingCurrent.strategyOpenStage.status.config.initialValue
            )
            &&
            (
                tradingEngine.tradingCurrent.strategyManageStage.status.value === 'Closed' ||
                tradingEngine.tradingCurrent.strategyManageStage.status.value === tradingEngine.tradingCurrent.strategyManageStage.status.config.initialValue
            )
            &&
            (
                tradingEngine.tradingCurrent.strategyCloseStage.status.value === 'Closed'
            )
        ) {

            /* Closing Everything now. */
            closePositionAndStrategy()

            function closePositionAndStrategy() {
                /* Taking Position Snapshot */
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Backtesting Session') {
                    if (sessionParameters.snapshots !== undefined) {
                        if (sessionParameters.snapshots.config.position === true) {
                            snapshotsModuleObject.positionExit()
                        }
                    }
                }

                /* Taking Strategy Snapshot */
                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Backtesting Session') {
                    if (sessionParameters.snapshots !== undefined) {
                        if (sessionParameters.snapshots.config.strategy === true) {
                            snapshotsModuleObject.strategyExit()
                        }
                    }
                }

                /* Close the Position */
                tradingPositionModuleObject.closePosition()

                /* Close the Strategy */
                tradingStrategyModuleObject.closeStrategy('Position Closed')

                /* Distance-To-Trading-Events Updates */
                tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.closePosition.value = 1
                tradingEngine.tradingCurrent.tradingEpisode.distanceToTradingEvent.triggerOff.value = 1

            }
        }
    }

    function checkIfStageNeedsToBeClosed(tradingEngineStage, tradingSystemStage, stageName) {
        /*
        The Stage is closed when the fillSize + feesPaid reaches the targetSize. 
        
        The Target Size is defined by the end user either in Base Asset or Quoted Asset.
        Whatever the user chooses defines also the way we check if the Target was met.
        Why? Because the counterparty target is estimated with the Target Rate and it 
        is not synchronized with the reality we later learn when the exchange tell us the
        actual rate each of the orders where executed at. 
 
        For the same reason that the user does not know exactly which is the rate the orders
        will actually be filled, then we can not expect that the total filled will really
        reach the target size, so we introduce a rounding factor so that when it is close 
        enough we will consider the target to have been reached. 
        */
        let ROUNDING_ERROR_CORRECTION_FACTOR = 1.001
        /*
        Overwrite the default with the config at the Stage node, if exists.
        */
        if (tradingSystemStage.config.roundingErrorCorrectionFactor !== undefined) {
            ROUNDING_ERROR_CORRECTION_FACTOR = tradingSystemStage.config.roundingErrorCorrectionFactor
        }
        /*
        We will also implement a mechanism to allow users declare an absolute value to add
        to the Size Filled before checking it against the Stage Target Size.
        */
        let ABSOLUTE_DUST_IN_BASE_ASSET = 0
        if (tradingSystemStage.config.absoluteDustInBaseAsset !== undefined) {
            ABSOLUTE_DUST_IN_BASE_ASSET = tradingSystemStage.config.absoluteDustInBaseAsset
        }
        let ABSOLUTE_DUST_IN_QUOTED_ASSET = 0
        if (tradingSystemStage.config.absoluteDustInQuotedAsset !== undefined) {
            ABSOLUTE_DUST_IN_QUOTED_ASSET = tradingSystemStage.config.absoluteDustInQuotedAsset
        }

        if (
            tradingEngineStage.stageBaseAsset.sizeFilled.value
            *
            ROUNDING_ERROR_CORRECTION_FACTOR
            +
            ABSOLUTE_DUST_IN_BASE_ASSET
            >=
            tradingEngineStage.stageBaseAsset.targetSize.value
        ) {
            positionFilled()
        } else if (
            tradingEngineStage.stageQuotedAsset.sizeFilled.value
            *
            ROUNDING_ERROR_CORRECTION_FACTOR
            +
            ABSOLUTE_DUST_IN_QUOTED_ASSET
            >=
            tradingEngineStage.stageQuotedAsset.targetSize.value
        ) {
            positionFilled()
        } else {
            checkCloseStageEvent(tradingSystemStage)
        }

        function positionFilled() {
            changeStageStatus(stageName, 'Closed', 'Position Size Filled')
        }

        function checkCloseStageEvent(tradingSystemStage) {
            /* Check the Close Stage Event */
            tradingSystem.evalConditions(tradingSystemStage, 'Close Stage Event')
            if (checkStopStageEvent(tradingSystemStage) === true) {
                changeStageStatus(stageName, 'Closing', 'Close Stage Event')
            }
        }
    }

    function checkStopStageEvent(stage) {
        /* Check the Close Stage Event. */
        let closeStageEvent = stage.closeStageEvent
        if (closeStageEvent !== undefined) {
            for (let k = 0; k < closeStageEvent.situations.length; k++) {
                let situation = closeStageEvent.situations[k]
                let passed
                if (situation.conditions.length > 0) {
                    passed = true
                }

                passed = tradingSystem.checkConditions(situation, passed)

                tradingSystem.values.push([situation.id, passed])
                if (passed) {
                    tradingSystem.highlights.push(situation.id)
                    tradingSystem.highlights.push(closeStageEvent.id)
                    tradingSystem.highlights.push(stage.id)

                    outgoingTradingSignalsModuleObject.broadcastSignal(closeStageEvent)
                    announcementsModuleObject.makeAnnouncements(closeStageEvent)
                    return true
                }
            }
        }
    }

    function changeStageStatus(stageName, newStatus, exitType) {
        let stage
        switch (stageName) {
            case 'Trigger Stage': {
                stage = tradingEngine.tradingCurrent.strategyTriggerStage
                break
            }
            case 'Open Stage': {
                stage = tradingEngine.tradingCurrent.strategyOpenStage
                break
            }
            case 'Manage Stage': {
                stage = tradingEngine.tradingCurrent.strategyManageStage
                break
            }
            case 'Close Stage': {
                stage = tradingEngine.tradingCurrent.strategyCloseStage
                break
            }
        }
        stage.status.value = newStatus
        if (exitType !== undefined) {
            stage.exitType.value = exitType
        }
        if (stage.status.value === 'Open') {
            openStage(stage)
            checkUserDefinedCode(stageName, 'Open')
            checkAnnounce(stageName, stage.status.value)
        }
        if (stage.status.value === 'Closed') {
            checkUserDefinedCode(stageName, 'Closed')
            closeStage(stage, stageName)
            checkAnnounce(stageName, stage.status.value)
        }

        /*
        The way the beginning and end of the Stages object works is as follows:
        This object begins with the last cycle, that is the current cycle displayed
        backwards to the current candle. And it ends at the end of the last cycle.
        During maintenance, we add the time frame of the candle, since we assume it
        will survive the 2 cycles without the end being updated. If it closes,
        then we update the end to the end of the last cycle, overriding the
        maintenance if needed. If we assume that in the same cycle there will be
        no closing and opening of the same type of object, then there can be no 
        overlap.
        */
        function openStage(stage) {
            /* Recording the opening at the Trading Engine Data Structure */
            stage.begin.value = tradingEngine.tradingCurrent.tradingEpisode.cycle.lastBegin.value
            stage.end.value = tradingEngine.tradingCurrent.tradingEpisode.cycle.lastEnd.value
            stage.beginRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
        }

        function closeStage(stage, stageName) {
            /* Recording the closing at the Trading Engine Data Structure */
            stage.end.value = tradingEngine.tradingCurrent.tradingEpisode.cycle.lastEnd.value
            stage.endRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value

            if (stageName === 'Open Stage') {
                if (tradingEngine.tradingCurrent.strategyCloseStage.status.value !== 'Opening' && tradingEngine.tradingCurrent.strategyCloseStage.status.value !== 'Open' &&
                    tradingEngine.tradingCurrent.strategyManageStage.status.value !== 'Opening' && tradingEngine.tradingCurrent.strategyManageStage.status.value !== 'Open') {
                    changeStageStatus('Close Stage', 'Opening');
                }
            }
            if (stageName === 'Close Stage') {
                if (tradingEngine.tradingCurrent.position.status.value === 'Open') {
                    tradingPositionModuleObject.closingPosition('Close Stage Closed')
                }
            }
        }
    }

    function updateEnds() {
        /* 
        Note that we can not use the cycle here because this is executed via mantain
        which in turn is executed before the first cycle for this candle is set. 
        */
        if (tradingEngine.tradingCurrent.strategyTriggerStage.status.value === 'Open') {
            tradingEngine.tradingCurrent.strategyTriggerStage.end.value = tradingEngine.tradingCurrent.strategyTriggerStage.end.value + sessionParameters.timeFrame.config.value
            tradingEngine.tradingCurrent.strategyTriggerStage.endRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
        }
        if (tradingEngine.tradingCurrent.strategyOpenStage.status.value === 'Open') {
            tradingEngine.tradingCurrent.strategyOpenStage.end.value = tradingEngine.tradingCurrent.strategyOpenStage.end.value + sessionParameters.timeFrame.config.value
            tradingEngine.tradingCurrent.strategyOpenStage.endRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
        }
        if (tradingEngine.tradingCurrent.strategyManageStage.status.value === 'Open') {
            tradingEngine.tradingCurrent.strategyManageStage.end.value = tradingEngine.tradingCurrent.strategyManageStage.end.value + sessionParameters.timeFrame.config.value
            tradingEngine.tradingCurrent.strategyManageStage.endRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
        }
        if (tradingEngine.tradingCurrent.strategyCloseStage.status.value === 'Open') {
            tradingEngine.tradingCurrent.strategyCloseStage.end.value = tradingEngine.tradingCurrent.strategyCloseStage.end.value + sessionParameters.timeFrame.config.value
            tradingEngine.tradingCurrent.strategyCloseStage.endRate.value = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
        }
    }

    function resetTradingEngineDataStructure() {
        if (tradingEngine.tradingCurrent.strategyTriggerStage.status.value === 'Closed') {
            resetStage(tradingEngine.tradingCurrent.strategyTriggerStage.status)
        }
        if (tradingEngine.tradingCurrent.strategyOpenStage.status.value === 'Closed') {
            resetStage(tradingEngine.tradingCurrent.strategyOpenStage.status)
        }
        if (tradingEngine.tradingCurrent.strategyManageStage.status.value === 'Closed') {
            resetStage(tradingEngine.tradingCurrent.strategyManageStage.status)
        }
        if (tradingEngine.tradingCurrent.strategyCloseStage.status.value === 'Closed') {
            resetStage(tradingEngine.tradingCurrent.strategyCloseStage.status)
        }

        if (tradingEngine.tradingCurrent.position.status.value === 'Closed') {
            resetStage(tradingEngine.tradingCurrent.strategyTriggerStage)
            resetStage(tradingEngine.tradingCurrent.strategyOpenStage)
            resetStage(tradingEngine.tradingCurrent.strategyManageStage)
            resetStage(tradingEngine.tradingCurrent.strategyCloseStage)
        }
        function resetStage(stage) {
            TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_ENGINE_MODULE_OBJECT.initializeNode(stage)
        }
    }

    function updateCounters() {

    }

    function updateStatistics() {

    }

    function badDefinitionUnhandledException(err, message, node) {

        let docs = {
            project: 'Foundations',
            category: 'Topic',
            type: 'TS LF Trading Bot Error - ' + message,
            placeholder: {}
        }

        tradingSystem.addError([node.id, message, docs])

        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> " + message);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.name = " + node.name);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.type = " + node.type);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.config = " + JSON.stringify(node.config));
        if (err !== undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> err.stack = " + err.stack);
        }
        throw 'Error Already Recorded'
    }

    /* checkUserDefinedCode(): Checks if User Defined Code exists and processes if applicable. */
    function checkUserDefinedCode(stage, status, when) {
        let tradingSystemStage = getTradingSystemStage(stage);

        if (tradingSystemStage !== undefined &&
            tradingSystemStage.userDefinedCode !== undefined) {
            if (status === 'Running' && when !== tradingSystemStage.userDefinedCode.config.whileAtStageWhenToRun) { return; }

            switch (status) {
                case 'Open': {
                    if (tradingSystemStage.userDefinedCode.config.runWhenEnteringStage) {
                        tradingSystem.evalUserCode(tradingSystemStage, 'User Defined Code');
                    }
                    break;
                }
                case 'Running': {
                    if (tradingSystemStage.userDefinedCode.config.runWhileAtStage) {
                        tradingSystem.evalUserCode(tradingSystemStage, 'User Defined Code');
                    }
                    break;
                }
                case 'Closed': {
                    if (tradingSystemStage.userDefinedCode.config.runWhenExitingStage) {
                        tradingSystem.evalUserCode(tradingSystemStage, 'User Defined Code');
                    }
                    break;
                }
            }
        }
    }

    // checkAnnounce(): Check if stage announcement should be made
    function checkAnnounce(stage, status) {
        let tradingSystemStage = getTradingSystemStage(stage);
        if (status === 'Open' || status === 'Closed') {
            announcementsModuleObject.makeAnnouncements(tradingSystemStage, status)
        }
    }

    /* getTradingSystemStage(): takes stage name returns stage object. */
    function getTradingSystemStage(stage) {
        switch (stage) {
            case 'Trigger Stage': {
                return tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value].triggerStage;
                break;
            }
            case 'Open Stage': {
                return tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value].openStage;
                break;
            }
            case 'Manage Stage': {
                return tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value].manageStage;
                break
            }
            case 'Close Stage': {
                return tradingSystem.tradingStrategies[tradingEngine.tradingCurrent.strategy.index.value].closeStage;
                break;
            }
        }
    }
}
