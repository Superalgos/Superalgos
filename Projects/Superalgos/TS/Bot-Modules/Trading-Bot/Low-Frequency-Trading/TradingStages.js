exports.newSuperalgosBotModulesTradingStages = function (processIndex, tradingEngineModuleObject) {
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
        updateEnds: updateEnds,
        resetTradingEngineDataStructure: resetTradingEngineDataStructure,
        updateCounters: updateCounters,
        updateStatistics: updateStatistics,
        initialize: initialize,
        finalize: finalize
    }

    let tradingStrategyModuleObject = TS.projects.superalgos.botModules.tradingStrategy.newSuperalgosBotModulesTradingStrategy(processIndex, tradingEngineModuleObject)
    let tradingPositionModuleObject = TS.projects.superalgos.botModules.tradingPosition.newSuperalgosBotModulesTradingPosition(processIndex, tradingEngineModuleObject)
    let tradingExecutionModuleObject = TS.projects.superalgos.botModules.tradingExecution.newSuperalgosBotModulesTradingExecution(processIndex, tradingEngineModuleObject)

    const ANNOUNCEMENTS_MODULE = require('./Announcements.js')
    let announcementsModule = ANNOUNCEMENTS_MODULE.newAnnouncements(processIndex)

    const SNAPSHOTS_MODULE = require('./Snapshots.js')
    let snapshotsModule = SNAPSHOTS_MODULE.newSnapshots(processIndex)

    let tradingEpisodeModuleObject = TS.projects.superalgos.botModules.tradingEpisode.newSuperalgosBotModulesTradingEpisode(processIndex)

    let tradingEngine
    let tradingSystem
    let sessionParameters

    return thisObject

    function initialize() {
        tradingSystem = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        tradingEngine = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        sessionParameters = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters

        tradingStrategyModuleObject.initialize()
        tradingPositionModuleObject.initialize()
        announcementsModule.initialize()
        snapshotsModule.initialize()
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

        announcementsModule.finalize()
        announcementsModule = undefined

        snapshotsModule.finalize()
        snapshotsModule = undefined

        tradingExecutionModuleObject.finalize()
        tradingExecutionModuleObject = undefined

        tradingEpisodeModuleObject.finalize()
        tradingEpisodeModuleObject = undefined
    }

    function updateChart(pChart) {
        snapshotsModule.updateChart(pChart)
    }

    function mantain() {
        tradingPositionModuleObject.mantain()
        tradingStrategyModuleObject.mantain()
        tradingExecutionModuleObject.mantain()

        updateCounters()
        updateEnds()
    }

    function reset() {
        tradingPositionModuleObject.reset()
        tradingStrategyModuleObject.reset()
        tradingExecutionModuleObject.reset()

        resetTradingEngineDataStructure()
    }

    function cycleBasedStatistics() {
        tradingEpisodeModuleObject.cycleBasedStatistics()
        tradingPositionModuleObject.cycleBasedStatistics()
    }

    function runTriggerStage() {
        /*
        We check if we will be triggering on, off or taking position.
        */
        checkTriggerOn()
        checkTriggerOff()
        checkTakePosition()

        function checkTriggerOn() {
            if (
                tradingEngine.current.strategy.index.value === tradingEngine.current.strategy.index.config.initialValue
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
                        tradingEngine.current.strategy.index.value !== tradingEngine.current.strategy.index.config.initialValue
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
                                if (passed) {
                                    tradingSystem.highlights.push(situation.id)
                                    tradingSystem.highlights.push(triggerStage.triggerOn.id)
                                    tradingSystem.highlights.push(triggerStage.id)

                                    tradingStrategyModuleObject.openStrategy(j, situation.name, strategy.name)

                                    /* Initialize this */
                                    tradingEngine.current.episode.distanceToEvent.triggerOn.value = 1

                                    announcementsModule.makeAnnoucements(triggerStage.triggerOn)
                                    announcementsModule.makeAnnoucements(triggerStage)

                                    if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Backtesting Session') {
                                        if (sessionParameters.snapshots !== undefined) {
                                            if (sessionParameters.snapshots.config.strategy === true) {
                                                snapshotsModule.strategyEntry()
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

        function checkTriggerOff() {
            if (tradingEngine.current.strategyTriggerStage.status.value === 'Open') {

                let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
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
                            if (passed) {
                                tradingSystem.highlights.push(situation.id)
                                tradingSystem.highlights.push(triggerStage.triggerOff.id)
                                tradingSystem.highlights.push(triggerStage.id)

                                tradingEngine.current.episode.distanceToEvent.triggerOff.value = 1
                                announcementsModule.makeAnnoucements(triggerStage.triggerOff)
                                changeStageStatus('Trigger Stage', 'Closed')
                                tradingStrategyModuleObject.closeStrategy('Trigger Off')
                            }
                        }
                    }
                }
            }
        }

        function checkTakePosition() {
            if (
                tradingEngine.current.strategyTriggerStage.status.value === 'Open'
            ) {
                let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
                let triggerStage = strategy.triggerStage

                tradingSystem.evalConditions(strategy, 'Take Position Event')
                tradingSystem.evalFormulas(strategy, 'Take Position Event')

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
                            if (passed) {
                                tradingSystem.highlights.push(situation.id)
                                tradingSystem.highlights.push(triggerStage.takePosition.id)
                                tradingSystem.highlights.push(triggerStage.id)

                                tradingPositionModuleObject.openPosition(situation.name)

                                announcementsModule.makeAnnoucements(triggerStage.takePosition)
                                announcementsModule.makeAnnoucements(strategy.openStage)

                                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Backtesting Session') {
                                    if (sessionParameters.snapshots !== undefined) {
                                        if (sessionParameters.snapshots.config.position === true) {
                                            snapshotsModule.positionEntry()
                                        }
                                    }
                                }

                                changeStageStatus('Trigger Stage', 'Closed')
                                changeStageStatus('Open Stage', 'Opening')
                                changeStageStatus('Manage Stage', 'Opening')
                            }
                        }
                    }
                }
            }
        }
    }

    async function runOpenStage() {

        checkIfWeNeedToAbortTheStage()
        runWhenStatusIsOpening()
        await runWhenStatusIsOpen()
        await runWhenStatusIsClosing()

        function checkIfWeNeedToAbortTheStage() {
            /* Abort Open Stage Check */
            if (tradingEngine.current.strategyOpenStage.status.value === 'Open' && tradingEngine.current.strategyCloseStage.status.value === 'Open') {
                /* 
                if the Close stage is opened while the open stage is still open that means that
                we need to stop placing orders, check what happened to the orders already placed,
                and cancel all unfilled limit orders. We call this the Closing status of the Open Stage.
                */
                changeStageStatus('Open Stage', 'Closing')
            }
        }

        function runWhenStatusIsOpening() {
            /* Opening Status Procedure */
            if (tradingEngine.current.strategyOpenStage.status.value === 'Opening') {

                /* This procedure is intended to run only once */
                let tradingSystemStage = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].openStage
                let tradingEngineStage = tradingEngine.current.strategyOpenStage

                /* Reset the Exchange Orders data structure to its initial value */
                tradingEngineModuleObject.initializeNode(tradingEngine.exchangeOrders)

                /* Entry Position size and rate */
                tradingSystem.evalFormulas(tradingSystemStage, 'Initial Targets')
                tradingPositionModuleObject.initialTargets(tradingSystemStage, tradingEngineStage)
                initializeStageTargetSize()

                /* From here on, the stage is officialy Open */
                changeStageStatus('Open Stage', 'Open')
            }
        }

        async function runWhenStatusIsOpen() {
            /* Open Status Procedure */
            if (tradingEngine.current.strategyOpenStage.status.value === 'Open') {
                /*
                While the Open Stage is Open, we do our regular stuff: place orders and check 
                what happened to the orders already placed.
                */
                let tradingSystemStage = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].openStage
                let tradingEngineStage = tradingEngine.current.strategyOpenStage
                let executionNode = tradingSystemStage.openExecution

                /* Evaluate conditions and formulas so they are ready during the execution run */
                tradingSystem.evalConditions(executionNode, 'Open Execution')
                tradingSystem.evalFormulas(executionNode, 'Open Execution')

                await tradingExecutionModuleObject.runExecution(
                    executionNode,
                    tradingEngineStage
                )
                checkIfStageNeedsToBeClosed(tradingEngineStage, tradingSystemStage, 'Open Stage')
            }
        }

        async function runWhenStatusIsClosing() {
            /* Closing Status Procedure */
            if (tradingEngine.current.strategyOpenStage.status.value === 'Closing') {
                /*
                During the closing stage status, we do not place new orders, just check 
                if the ones placed were filled, and cancel the ones not filled.
                */
                let tradingSystemStage = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].openStage
                let executionNode = tradingSystemStage.openExecution

                /* 
                Check if there are unfilled orders, we will check if they were executed, 
                and cancel the ones that were not. 
                */
                tradingSystem.evalConditions(tradingSystemStage, 'Open Execution')
                tradingSystem.evalFormulas(tradingSystemStage, 'Open Execution')

                await tradingExecutionModuleObject.runExecution(
                    executionNode,
                    tradingEngine.current.strategyOpenStage
                )

                /*
                The Closing is finished when the sizeFilled + feesPaid reaches the sizePlaced.
                This can happens either because we update the sizeFilled value when we see 
                at the exchange that orders were filled, or we reduce the sizePlaced when
                we cancel not yet filled orders. Here it does not matter the targetSize since
                this status represent a force closure of this stage.
                */
                switch (tradingEngine.current.strategyOpenStage.stageDefinedIn.value) {
                    case 'Base Asset': {
                        if (
                            tradingEngine.current.strategyOpenStage.stageBaseAsset.sizeFilled.value >=
                            tradingEngine.current.strategyOpenStage.stageBaseAsset.sizePlaced.value
                        ) {
                            changeStageStatus('Open Stage', 'Closed')
                        }
                        break
                    }
                    case 'Quoted Asset': {
                        if (
                            tradingEngine.current.strategyOpenStage.stageQuotedAsset.sizeFilled.value >=
                            tradingEngine.current.strategyOpenStage.stageQuotedAsset.sizePlaced.value
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
            Here we will transform the position size into targets for each asset of the stage.
            */
            tradingEngine.current.strategyOpenStage.stageBaseAsset.targetSize.value = tradingEngine.current.position.positionBaseAsset.entryTargetSize.value
            tradingEngine.current.strategyOpenStage.stageQuotedAsset.targetSize.value = tradingEngine.current.position.positionQuotedAsset.entryTargetSize.value

            tradingEngine.current.strategyOpenStage.stageBaseAsset.targetSize.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.strategyOpenStage.stageBaseAsset.targetSize.value, 10)
            tradingEngine.current.strategyOpenStage.stageQuotedAsset.targetSize.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.strategyOpenStage.stageQuotedAsset.targetSize.value, 10)
        }
    }

    function runManageStage() {

        if (tradingEngine.current.episode.cycle.value !== 'First') { return }

        runWhenStatusIsOpening()
        runWhenStatusIsOpen()

        function runWhenStatusIsOpening() {
            /* Opening Status Procedure */
            if (tradingEngine.current.strategyManageStage.status.value === 'Opening') {

                /* Now we switch to the Open status. */
                changeStageStatus('Manage Stage', 'Open')
            }
        }

        function runWhenStatusIsOpen() {
            /* Open Status Procedure */
            if (tradingEngine.current.strategyManageStage.status.value === 'Open') {
                let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
                let manageStage = strategy.manageStage

                /* Evaluate all the stage conditions and formulas to have them ready */
                tradingSystem.evalConditions(manageStage, 'Manage Stage')
                tradingSystem.evalFormulas(manageStage, 'Manage Stage')

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
            }

            function calculateStopLoss() {
                let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
                let manageStage = strategy.manageStage
                let phase

                if (manageStage !== undefined) {
                    if (manageStage.managedStopLoss !== undefined) {
                        phase = manageStage.managedStopLoss.phases[tradingEngine.current.position.stopLoss.stopLossPhase.value - 1]
                    }
                }

                if (phase !== undefined) {
                    if (phase.formula !== undefined) {
                        let previousValue = tradingEngine.current.position.stopLoss.value
                        tradingPositionModuleObject.applyStopLossFormula(tradingSystem.formulas, phase.formula.id)

                        if (tradingEngine.current.position.stopLoss.value !== previousValue) {
                            announcementsModule.makeAnnoucements(phase)
                        }
                    }
                }
            }

            function calculateTakeProfit() {
                let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
                let manageStage = strategy.manageStage
                let phase

                if (manageStage !== undefined) {
                    if (manageStage.managedTakeProfit !== undefined) {
                        phase = manageStage.managedTakeProfit.phases[tradingEngine.current.position.takeProfit.takeProfitPhase.value - 1]
                    }
                }

                if (phase !== undefined) {
                    if (phase.formula !== undefined) {
                        let previousValue = tradingEngine.current.position.takeProfit.value
                        tradingPositionModuleObject.applyTakeProfitFormula(tradingSystem.formulas, phase.formula.id)

                        if (tradingEngine.current.position.takeProfit.value !== previousValue) {
                            announcementsModule.makeAnnoucements(phase)
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
                if (tradingEngine.current.position.stopLoss.stopLossPosition.value === tradingEngine.current.position.stopLoss.stopLossPosition.config.initialValue) {
                    if (tradingEngine.current.position.stopLoss.value > tradingEngine.current.position.entryTargetRate.value) {
                        tradingEngine.current.position.stopLoss.stopLossPosition.value = 'Above'
                    } else {
                        tradingEngine.current.position.stopLoss.stopLossPosition.value = 'Below'
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
                if (tradingEngine.current.position.takeProfit.takeProfitPosition.value === tradingEngine.current.position.takeProfit.takeProfitPosition.config.initialValue) {
                    if (tradingEngine.current.position.takeProfit.value > tradingEngine.current.position.entryTargetRate.value) {
                        tradingEngine.current.position.takeProfit.takeProfitPosition.value = 'Above'
                    } else {
                        tradingEngine.current.position.takeProfit.takeProfitPosition.value = 'Below'
                    }
                }
            }

            function checkStopPhasesEvents() {
                let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
                let manageStage = strategy.manageStage
                let parentNode
                let phaseIndex
                let phase
                let stopLoss

                if (manageStage !== undefined) {
                    if (manageStage.managedStopLoss !== undefined) {
                        parentNode = manageStage
                        phaseIndex = tradingEngine.current.position.stopLoss.stopLossPhase.value - 1
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

                                tradingPositionModuleObject.updateStopLoss(tradingEngine.current.position.stopLoss.stopLossPhase.value + 1)

                                announcementsModule.makeAnnoucements(nextPhaseEvent)

                                /* Reset this counter */
                                tradingEngine.current.episode.distanceToEvent.nextPhase.value = 1
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
                                        tradingSystem.errors.push([moveToPhaseEvent.id, 'This Node needs to reference a Phase.'])
                                        continue
                                    }

                                    announcementsModule.makeAnnoucements(moveToPhaseEvent)

                                    /* Reset this counter */
                                    tradingEngine.current.episode.distanceToEvent.moveToPhase.value = 1
                                    return // only one event can pass at the time
                                }
                            }
                        }
                    }
                }
            }

            function checkTakeProfitPhaseEvents() {
                let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
                let openStage = strategy.openStage
                let manageStage = strategy.manageStage
                let parentNode
                let phaseIndex
                let phase
                let takeProfit

                if (manageStage !== undefined) {
                    if (manageStage.managedTakeProfit !== undefined) {
                        parentNode = manageStage
                        phaseIndex = tradingEngine.current.position.takeProfit.takeProfitPhase.value - 1
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

                                tradingPositionModuleObject.updateTakeProfit(tradingEngine.current.position.takeProfit.takeProfitPhase.value + 1)

                                announcementsModule.makeAnnoucements(nextPhaseEvent)

                                /* Reset this counter */
                                tradingEngine.current.episode.distanceToEvent.nextPhase.value = 1
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
                                        tradingSystem.errors.push([moveToPhaseEvent.id, 'This Node needs to reference a Phase.'])
                                        continue
                                    }

                                    announcementsModule.makeAnnoucements(moveToPhaseEvent)

                                    /* Reset this counter */
                                    tradingEngine.current.episode.distanceToEvent.moveToPhase.value = 1
                                    return // only one event can pass at the time
                                }
                            }
                        }
                    }
                }
            }

            function checkStopLossOrTakeProfitWasHit() {
                {
                    let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
                    /* 
                    Checking what happened since the last execution. We need to know if the Stop Loss
                    or our Take Profit were hit. 
                    */

                    /* Stop Loss condition: Here we verify if the Stop Loss was hitted or not. */
                    if (
                        (
                            tradingEngine.current.position.stopLoss.stopLossPosition.value === 'Above' &&
                            tradingEngine.current.episode.candle.max.value >= tradingEngine.current.position.stopLoss.value
                        ) ||
                        (
                            tradingEngine.current.position.stopLoss.stopLossPosition.value === 'Below' &&
                            tradingEngine.current.episode.candle.min.value <= tradingEngine.current.position.stopLoss.value
                        )
                    ) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, '[INFO] checkStopLossOrTakeProfitWasHit -> Stop Loss was hit.')

                        tradingPositionModuleObject.closingPosition('Stop Loss')
                        changeStageStatus('Close Stage', 'Opening')
                        changeStageStatus('Manage Stage', 'Closed')
                        announcementsModule.makeAnnoucements(strategy.closeStage)
                        return
                    }

                    /* Take Profit condition: Here we verify if the Take Profit was hit or not. */
                    if (
                        (
                            tradingEngine.current.position.takeProfit.takeProfitPosition.value === 'Below' &&
                            tradingEngine.current.episode.candle.min.value <= tradingEngine.current.position.takeProfit.value
                        ) ||
                        (
                            tradingEngine.current.position.takeProfit.takeProfitPosition.value === 'Above' &&
                            tradingEngine.current.episode.candle.max.value >= tradingEngine.current.position.takeProfit.value
                        )
                    ) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, '[INFO] checkStopLossOrTakeProfitWasHit -> Take Profit was hit.')

                        tradingPositionModuleObject.closingPosition('Take Profit')
                        changeStageStatus('Close Stage', 'Opening')
                        changeStageStatus('Manage Stage', 'Closed')
                        announcementsModule.makeAnnoucements(strategy.closeStage)
                        return
                    }
                    return
                }
            }
        }
    }

    async function runCloseStage() {

        runWhenStatusIsOpening()
        await runWhenStatusIsOpen()

        function runWhenStatusIsOpening() {
            /* Opening Status Procedure */
            if (tradingEngine.current.strategyCloseStage.status.value === 'Opening') {
                /* 
                This will happen only once, as soon as the Take Profit or Stop was hit.
                */
                let tradingSystemStage = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].closeStage

                /* Exit Position size and rate */
                tradingSystem.evalFormulas(tradingSystemStage, 'Initial Targets')
                tradingPositionModuleObject.initialTargets(tradingSystemStage, tradingEngine.current.strategyCloseStage)

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
                tradingEngine.current.strategyCloseStage.status.value === 'Open' &&
                (
                    tradingEngine.current.strategyOpenStage.status.value === 'Closed' ||
                    tradingEngine.current.strategyOpenStage.status.value == tradingEngine.current.strategyOpenStage.status.config.initialValue
                )
            ) {
                /*
                This will happen as long as the Close Stage is Open.
                */
                let tradingSystemStage = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].closeStage
                let tradingEngineStage = tradingEngine.current.strategyCloseStage
                let executionNode = tradingSystemStage.closeExecution

                tradingSystem.evalConditions(tradingSystemStage, 'Close Execution')
                tradingSystem.evalFormulas(tradingSystemStage, 'Close Execution')

                await tradingExecutionModuleObject.runExecution(
                    executionNode,
                    tradingEngine.current.strategyCloseStage
                )

                checkIfStageNeedsToBeClosed(tradingEngineStage, tradingSystemStage, 'Close Stage')
            }

            /* 
            Exit Position Validation: we need al the previous stages to be either closed 
            or at their initial default value. The last is becasue after Closed objects are 
            initialized to their defualts.  
            */
            if (
                (
                    tradingEngine.current.strategyTriggerStage.status.value === 'Closed' ||
                    tradingEngine.current.strategyTriggerStage.status.value === tradingEngine.current.strategyTriggerStage.status.config.initialValue
                )
                &&
                (
                    tradingEngine.current.strategyOpenStage.status.value === 'Closed' ||
                    tradingEngine.current.strategyOpenStage.status.value === tradingEngine.current.strategyOpenStage.status.config.initialValue
                )
                &&
                (
                    tradingEngine.current.strategyManageStage.status.value === 'Closed' ||
                    tradingEngine.current.strategyManageStage.status.value === tradingEngine.current.strategyManageStage.status.config.initialValue
                )
                &&
                (
                    tradingEngine.current.strategyCloseStage.status.value === 'Closed'
                )
            ) {

                /* Closing Everything now. */
                closePositionAndStrategy()
            }
        }

        function initializeStageTargetSize() {
            /*
            Here we will transform the position size into targets for each asset of the stage.
            */
            tradingEngine.current.strategyCloseStage.stageBaseAsset.targetSize.value = tradingEngine.current.position.positionBaseAsset.exitTargetSize.value
            tradingEngine.current.strategyCloseStage.stageQuotedAsset.targetSize.value = tradingEngine.current.position.positionQuotedAsset.exitTargetSize.value

            tradingEngine.current.strategyCloseStage.stageBaseAsset.targetSize.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.strategyCloseStage.stageBaseAsset.targetSize.value, 10)
            tradingEngine.current.strategyCloseStage.stageQuotedAsset.targetSize.value = TS.projects.superalgos.utilities.miscellaneousFunctions.truncateToThisPrecision(tradingEngine.current.strategyCloseStage.stageQuotedAsset.targetSize.value, 10)
        }

        function closePositionAndStrategy() {
            /* Taking Position Snapshot */
            if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Backtesting Session') {
                if (sessionParameters.snapshots !== undefined) {
                    if (sessionParameters.snapshots.config.position === true) {
                        snapshotsModule.positionExit()
                    }
                }
            }

            /* Taking Strategy Snapshot */
            if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.type === 'Backtesting Session') {
                if (sessionParameters.snapshots !== undefined) {
                    if (sessionParameters.snapshots.config.strategy === true) {
                        snapshotsModule.strategyExit()
                    }
                }
            }

            /* Close the Position */
            tradingPositionModuleObject.closePosition()

            /* Close the Strategy */
            tradingStrategyModuleObject.closeStrategy('Position Closed')

            /* Distance to Events Updates */
            tradingEngine.current.episode.distanceToEvent.closePosition.value = 1
            tradingEngine.current.episode.distanceToEvent.triggerOff.value = 1

        }
    }

    function checkIfStageNeedsToBeClosed(tradingEngineStage, tradingSystemStage, stageName) {
        /*
        The Stage is closed when the fillSize + feesPaid reaches the targetSize. 
        
        The Target Size is defined by the end user either in Base Asset or Quoted Asset.
        Whatever the user chooses defines also the way we check if the Target was met.
        Why? Because the counterparty target is estimated with the Target Rate and it 
        is not syncronized with the reality we later learn when the exchange tell us the
        actual rate each of the orders where executed at. 
 
        For the same reason that the user does not know exactly which is the rate the orders
        will actually be filled, then we can not expect that the total filled will really
        reach the target size, so we introduce a rounding factor so that when it is close 
        enough we will consider the target to have been reached. 
        */
        const ROUNDING_ERROR_CORRECTION_FACTOR = 1.001

        switch (tradingEngineStage.stageDefinedIn.value) {
            case 'Base Asset': {
                if (
                    (
                        tradingEngineStage.stageBaseAsset.sizeFilled.value
                    )
                    * ROUNDING_ERROR_CORRECTION_FACTOR
                    >=
                    tradingEngineStage.stageBaseAsset.targetSize.value
                ) {
                    positionFilled()
                } else {
                    checkCloseStageEvent(tradingSystemStage)
                }
                break
            }
            case 'Quoted Asset': {
                if (
                    (
                        tradingEngineStage.stageQuotedAsset.sizeFilled.value
                    )
                    * ROUNDING_ERROR_CORRECTION_FACTOR
                    >=
                    tradingEngineStage.stageQuotedAsset.targetSize.value
                ) {
                    positionFilled()
                } else {
                    checkCloseStageEvent(tradingSystemStage)
                }
                break
            }
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

                    announcementsModule.makeAnnoucements(closeStageEvent)
                    return true
                }
            }
        }
    }

    function changeStageStatus(stageName, newStatus, exitType) {
        let stage
        switch (stageName) {
            case 'Trigger Stage': {
                stage = tradingEngine.current.strategyTriggerStage
                break
            }
            case 'Open Stage': {
                stage = tradingEngine.current.strategyOpenStage
                break
            }
            case 'Manage Stage': {
                stage = tradingEngine.current.strategyManageStage
                break
            }
            case 'Close Stage': {
                stage = tradingEngine.current.strategyCloseStage
                break
            }
        }
        stage.status.value = newStatus
        if (exitType !== undefined) {
            stage.exitType.value = exitType
        }
        if (stage.status.value === 'Open') {
            openStage(stage)
        }
        if (stage.status.value === 'Closed') {
            closeStage(stage)
        }

        /*
        The way the begining and end of the Stages object works is as follows:
        This object begins with the last cycle, that is the current cycle diplaced
        backwards to the current candle. And it ends at the end of the last cycle.
        During mantainance, we add the time frame of the candle, since we assume it 
        will survive the 2 cycles without the end being updated. If it closes,
        then we update the end to the end of the last cycle, overrinding the 
        mantainance if needed. If we assume that in the same cycle there will be
        no closing and opening of the same type of object, then there can be no 
        overlap.
        */
        function openStage(stage) {
            /* Recording the opening at the Trading Engine Data Structure */
            stage.begin.value = tradingEngine.current.episode.cycle.lastBegin.value
            stage.end.value = tradingEngine.current.episode.cycle.lastEnd.value
            stage.beginRate.value = tradingEngine.current.episode.candle.close.value
        }

        function closeStage(stage) {
            /* Recording the closing at the Trading Engine Data Structure */
            stage.end.value = tradingEngine.current.episode.cycle.lastEnd.value
            stage.endRate.value = tradingEngine.current.episode.candle.close.value
        }
    }

    function updateEnds() {
        /* 
        Note that we can not use the cycle here because this is executed via mantain
        which in turn is executed before the first cycle for this candle is set. 
        */
        if (tradingEngine.current.strategyTriggerStage.status.value === 'Open') {
            tradingEngine.current.strategyTriggerStage.end.value = tradingEngine.current.strategyTriggerStage.end.value + sessionParameters.timeFrame.config.value
            tradingEngine.current.strategyTriggerStage.endRate.value = tradingEngine.current.episode.candle.close.value
        }
        if (tradingEngine.current.strategyOpenStage.status.value === 'Open') {
            tradingEngine.current.strategyOpenStage.end.value = tradingEngine.current.strategyOpenStage.end.value + sessionParameters.timeFrame.config.value
            tradingEngine.current.strategyOpenStage.endRate.value = tradingEngine.current.episode.candle.close.value
        }
        if (tradingEngine.current.strategyManageStage.status.value === 'Open') {
            tradingEngine.current.strategyManageStage.end.value = tradingEngine.current.strategyManageStage.end.value + sessionParameters.timeFrame.config.value
            tradingEngine.current.strategyManageStage.endRate.value = tradingEngine.current.episode.candle.close.value
        }
        if (tradingEngine.current.strategyCloseStage.status.value === 'Open') {
            tradingEngine.current.strategyCloseStage.end.value = tradingEngine.current.strategyCloseStage.end.value + sessionParameters.timeFrame.config.value
            tradingEngine.current.strategyCloseStage.endRate.value = tradingEngine.current.episode.candle.close.value
        }
    }

    function resetTradingEngineDataStructure() {
        if (tradingEngine.current.strategyTriggerStage.status.value === 'Closed') {
            resetStage(tradingEngine.current.strategyTriggerStage.status)
        }
        if (tradingEngine.current.strategyOpenStage.status.value === 'Closed') {
            resetStage(tradingEngine.current.strategyOpenStage.status)
        }
        if (tradingEngine.current.strategyManageStage.status.value === 'Closed') {
            resetStage(tradingEngine.current.strategyManageStage.status)
        }
        if (tradingEngine.current.strategyCloseStage.status.value === 'Closed') {
            resetStage(tradingEngine.current.strategyTriggerStage)
            resetStage(tradingEngine.current.strategyOpenStage)
            resetStage(tradingEngine.current.strategyManageStage)
            resetStage(tradingEngine.current.strategyCloseStage)
        }

        function resetStage(stage) {
            tradingEngineModuleObject.initializeNode(stage)
        }
    }

    function updateCounters() {

    }

    function updateStatistics() {

    }
}