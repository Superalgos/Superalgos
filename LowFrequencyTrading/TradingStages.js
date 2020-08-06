exports.newTradingStages = function newTradingStages(bot, logger, tradingEngineModule) {
    /*
    This module packages all functions related to Stages.
    */
    const MODULE_NAME = 'Trading Stages'
    let thisObject = {
        updateChart: updateChart,
        mantain: mantain,
        runTriggerStage: runTriggerStage,
        runOpenStage: runOpenStage,
        runManageStage: runManageStage,
        runCloseStage: runCloseStage,
        updateEnds: updateEnds,
        updateStatus: updateStatus,
        updateCounters: updateCounters,
        updateStatistics: updateStatistics,
        resetStage: resetStage,
        initialize: initialize,
        finalize: finalize
    }

    const TRADING_STRATEGY_MODULE = require('./TradingStrategy.js')
    let tradingStrategyModule = TRADING_STRATEGY_MODULE.newTradingStrategy(bot, logger, tradingEngineModule)

    const TRADING_POSITION_MODULE = require('./TradingPosition.js')
    let tradingPositionModule = TRADING_POSITION_MODULE.newTradingPosition(bot, logger, tradingEngineModule)

    const TRADING_ENGINE_EXECUTION = require('./TradingExecution.js')
    let tradingExecutionModule = TRADING_ENGINE_EXECUTION.newTradingExecution(bot, logger, tradingEngineModule)

    const ANNOUNCEMENTS_MODULE = require('./Announcements.js')
    let announcementsModule = ANNOUNCEMENTS_MODULE.newAnnouncements(bot, logger)

    const SNAPSHOTS_MODULE = require('./Snapshots.js')
    let snapshotsModule = SNAPSHOTS_MODULE.newSnapshots(bot, logger)


    let tradingEngine
    let tradingSystem
    let sessionParameters

    return thisObject

    function initialize() {
        tradingSystem = bot.simulationState.tradingSystem
        tradingEngine = bot.simulationState.tradingEngine
        sessionParameters = bot.SESSION.parameters

        tradingStrategyModule.initialize()
        tradingPositionModule.initialize()
        announcementsModule.initialize()
        snapshotsModule.initialize()
        tradingExecutionModule.initialize()
    }

    function finalize() {
        tradingEngine = undefined
        tradingSystem = undefined
        sessionParameters = undefined

        tradingStrategyModule.finalize()
        tradingStrategyModule = undefined

        tradingPositionModule.finalize()
        tradingPositionModule = undefined

        announcementsModule.finalize()
        announcementsModule = undefined

        snapshotsModule.finalize()
        snapshotsModule = undefined

        tradingExecutionModule.finalize()
        tradingExecutionModule = undefined
    }

    function updateChart(pChart) {
        snapshotsModule.updateChart(pChart)
    }

    function mantain() {
        mantainPositions()
        mantainStrategies()
        mantainStages()
        mantainOrders()

        function mantainStrategies() {
            tradingStrategyModule.updateStatus()
            tradingStrategyModule.updateCounters()
            tradingStrategyModule.updateEnds()
        }

        function mantainStages() {
            updateStatus()
            updateCounters()
            updateEnds()
        }

        function mantainPositions() {
            tradingPositionModule.updateStatus()
            tradingPositionModule.updateCounters()
            tradingPositionModule.updateEnds()
        }

        function mantainOrders() {
            /* Reset All Exchange Orders that are on Closed status, to their initial value */
            if (tradingEngine.current.strategy.index.value === tradingEngine.current.strategy.index.config.initialValue) { return }

            let stageNode
            let executionNode

            stageNode = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].openStage
            executionNode = stageNode.openExecution
            resetExecution(executionNode, tradingEngine.current.strategyOpenStage.status.value)

            stageNode = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].closeStage
            executionNode = stageNode.closeExecution
            resetExecution(executionNode, tradingEngine.current.strategyCloseStage.status.value)

            function resetExecution(executionNode, stageStatus) {

                resetExecutionAlgorithms(executionNode)

                function resetExecutionAlgorithms(executionNode) {
                    for (let i = 0; i < executionNode.executionAlgorithms.length; i++) {
                        let executionAlgorithm = executionNode.executionAlgorithms[i]
                        resetOrders(executionAlgorithm.marketBuyOrders)
                        resetOrders(executionAlgorithm.marketSellOrders)
                        resetOrders(executionAlgorithm.limitBuyOrders)
                        resetOrders(executionAlgorithm.limitSellOrders)
                    }
                }

                function resetOrders(orders) {
                    for (let i = 0; i < orders.length; i++) {
                        let tradingSystemOrder = orders[i]
                        if (tradingSystemOrder.referenceParent === undefined) { continue }
                        let tradingEngineOrder = tradingEngineModule.getNodeById(tradingSystemOrder.referenceParent.id)
                        if (tradingEngineOrder.status === undefined) { continue }
                        if (tradingEngineOrder.status.value === 'Closed') {
                            /* We reset the order data structure inside the Trading Engine to its initial value */
                            tradingEngineOrder.initialize(tradingEngineOrder)
                            if (tradingSystemOrder.config.spawnMultipleOrders !== true) {
                                /* 
                                We close the lock so as to prevent this data structure to be used again during this same stage execution.
                                 */
                                if (stageStatus === 'Open') {
                                    tradingEngineOrder.lock.value = 'Closed'
                                }
                            }
                        }
                    }
                }
            }
        }
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

                                    tradingStrategyModule.openStrategy(j, situation.name, strategy.name)

                                    /* Updating Episode Counters */
                                    tradingEngine.episode.episodeCounters.strategies.value++

                                    /* Initialize this */
                                    tradingEngine.current.distanceToEvent.triggerOn.value = 1

                                    announcementsModule.makeAnnoucements(triggerStage.triggerOn)
                                    announcementsModule.makeAnnoucements(triggerStage)

                                    if (bot.SESSION.type === 'Backtesting Session') {
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

                                tradingEngine.current.distanceToEvent.triggerOff.value = 1
                                announcementsModule.makeAnnoucements(triggerStage.triggerOff)
                                changeStageStatus('Trigger Stage', 'Closed')
                                tradingStrategyModule.closeStrategy('Trigger Off')
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

                                tradingPositionModule.openPosition(situation.name)

                                announcementsModule.makeAnnoucements(triggerStage.takePosition)
                                announcementsModule.makeAnnoucements(strategy.openStage)

                                if (bot.SESSION.type === 'Backtesting Session') {
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
        /* Abort Open Stage Check */
        if (tradingEngine.current.strategyOpenStage.status.value === 'Open' && tradingEngine.current.strategyCloseStage.status.value === 'Open') {
            /* 
            if the Close stage is opened while the open stage is still open that means that
            we need to stop placing orders, check what happened to the orders already placed,
            and cancel all unfilled limit orders. We call this the Closing status of the Open Stage.
            */
            changeStageStatus('Open Stage', 'Closing')
        }

        /* Opening Status Procedure */
        if (tradingEngine.current.strategyOpenStage.status.value === 'Opening') {

            /* This procedure is intended to run only once */
            let stageNode = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].openStage
            let executionNode = stageNode.openExecution

            /* Reset the Exchange Orders data structure to its initial value */
            tradingEngine.exchangeOrders.initialize(tradingEngine.exchangeOrders)

            tradingSystem.evalConditions(stageNode, 'Initial Definition')
            tradingSystem.evalFormulas(stageNode, 'Initial Definition')

            /* Remember the balance we had before taking the position to later calculate profit or loss */
            tradingEngine.previous.balance.baseAsset.value = tradingEngine.current.balance.baseAsset.value
            tradingEngine.previous.balance.quotedAsset.value = tradingEngine.current.balance.quotedAsset.value

            /* Entry Position size and rate */
            tradingSystem.evalFormulas(stageNode, 'Initial Targets')
            tradingPositionModule.initialTargets(stageNode)
            initializeStageTargetSize()

            /* Check Execution at open stage node */
            tradingSystem.evalConditions(stageNode, 'Open Execution')
            tradingSystem.evalFormulas(stageNode, 'Open Execution')

            await tradingExecutionModule.runExecution(
                executionNode,
                false,
                tradingEngine.current.strategyOpenStage
            )

            /* From here on, the state is officialy Open */
            changeStageStatus('Open Stage', 'Open')
            return
        }

        /* Open Status Procedure */
        if (tradingEngine.current.strategyOpenStage.status.value === 'Open') {
            /*
            While the Open Stage is Open, we do our regular stuff: place orders and check 
            what happened to the orders already placed.
            */
            let stageNode = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].openStage
            let executionNode = stageNode.openExecution

            /* Every Loop Cycle Activity */
            tradingSystem.evalConditions(stageNode, 'Open Execution')
            tradingSystem.evalFormulas(stageNode, 'Open Execution')

            await tradingExecutionModule.runExecution(
                executionNode,
                false,
                tradingEngine.current.strategyOpenStage
            )
            /*
            The Open is finished when the placedSize reaches the targetSize in any of the 
            stage assets, and the fillSize + feesPaid reaches the placedSize also in any
            of the stage Assets.
            This can happens at any time when we update the sizeFilled and the feesPaid values 
            when we see at the exchange that orders were filled. 
            */
            if (
                (
                    tradingEngine.current.strategyOpenStage.stageBaseAsset.sizePlaced >=
                    tradingEngine.current.strategyOpenStage.stageBaseAsset.targetSize

                    ||

                    tradingEngine.current.strategyOpenStage.stageQuotedAsset.sizePlaced >=
                    tradingEngine.current.strategyOpenStage.stageQuotedAsset.targetSize
                )
                &&
                (
                    tradingEngine.current.strategyOpenStage.stageBaseAsset.sizeFilled.value +
                    tradingEngine.current.strategyOpenStage.stageBaseAsset.feesPaid.value >=
                    tradingEngine.current.strategyOpenStage.stageBaseAsset.sizePlaced.value

                    ||

                    tradingEngine.current.strategyOpenStage.stageQuotedAsset.sizeFilled.value +
                    tradingEngine.current.strategyOpenStage.stageQuotedAsset.feesPaid.value >=
                    tradingEngine.current.strategyOpenStage.stageQuotedAsset.sizePlaced.value
                )
            ) {
                changeStageStatus('Open Stage', 'Closed', 'Position Size Filled')
            } else {
                /* Check the Close Stage Event */
                tradingSystem.evalConditions(stageNode, 'Close Stage Event')
                if (checkStopStageEvent(stageNode) === true) {
                    changeStageStatus('Open Stage', 'Closing', 'Close Stage Event')
                }
            }
        }

        /* Closing Status Procedure */
        if (tradingEngine.current.strategyOpenStage.status.value === 'Closing') {
            /*
            During the closing stage status, we do not place new orders, just check 
            if the ones placed were filled, and cancel the ones not filled.
            */
            let stageNode = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].openStage
            let executionNode = stageNode.openExecution

            /* 
            Check if there are unfilled orders, we will check if they were executed, 
            and cancel the ones that were not. 
            */
            tradingSystem.evalConditions(stageNode, 'Open Execution')
            tradingSystem.evalFormulas(stageNode, 'Open Execution')

            await tradingExecutionModule.runExecution(
                executionNode,
                true,
                tradingEngine.current.strategyOpenStage
            )

            /*
            The Closing is finished when the fillSize + feesPaid reaches the ordersSize.
            This can happens either because we update the sizeFilled value when we see 
            at the exchange that orders were filled, or we reduce the ordersSize when
            we cancel not yet filled orders. Here it does not matter the targetSize since
            this status represent a force closure of this stage.
            */
            if (
                tradingEngine.current.strategyOpenStage.stageBaseAsset.sizeFilled.value +
                tradingEngine.current.strategyOpenStage.stageBaseAsset.feesPaid.value >=
                tradingEngine.current.strategyOpenStage.stageBaseAsset.sizePlaced.value

                ||

                tradingEngine.current.strategyOpenStage.stageQuotedAsset.sizeFilled.value +
                tradingEngine.current.strategyOpenStage.stageQuotedAsset.feesPaid.value >=
                tradingEngine.current.strategyOpenStage.stageQuotedAsset.sizePlaced.value
            ) {
                changeStageStatus('Open Stage', 'Closed')
            }
        }

        function initializeStageTargetSize() {
            /*
            Here we will transform the position size into targets for each asset of the stage.
            */
            tradingEngine.current.strategyOpenStage.stageBaseAsset.targetSize.value = tradingEngine.current.position.positionBaseAsset.entryTargetSize.value
            tradingEngine.current.strategyOpenStage.stageQuotedAsset.targetSize.value = tradingEngine.current.position.positionQuotedAsset.entryTargetSize.value

            tradingEngine.current.strategyOpenStage.stageBaseAsset.targetSize.value = global.PRECISE(tradingEngine.current.strategyOpenStage.stageBaseAsset.targetSize.value, 10)
            tradingEngine.current.strategyOpenStage.stageQuotedAsset.targetSize.value = global.PRECISE(tradingEngine.current.strategyOpenStage.stageQuotedAsset.targetSize.value, 10)
        }
    }

    function runManageStage() {
        /* Opening Status Procedure */
        if (tradingEngine.current.strategyManageStage.status.value === 'Opening') {
            /* We jump the management at the loop cycle where the position is being taken. */
            changeStageStatus('Manage Stage', 'Open')
            return
        }

        /* Open Status Procedure */
        if (tradingEngine.current.strategyManageStage.status.value === 'Open') {
            let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
            let manageStage = strategy.manageStage
            tradingSystem.evalConditions(manageStage, 'Manage Stage')
            tradingSystem.evalFormulas(manageStage, 'Manage Stage')

            if (
                tradingEngine.current.position.stopLoss.stopLossStage.value === 'Open Stage' ||
                tradingEngine.current.position.takeProfit.takeProfitStage.value === 'Open Stage') {
                let stageNode = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].openStage
                tradingSystem.evalConditions(stageNode, 'Initial Definition')
                tradingSystem.evalFormulas(stageNode, 'Initial Definition')
            }

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
            let openStage = strategy.openStage
            let manageStage = strategy.manageStage
            let phase

            if (tradingEngine.current.position.stopLoss.stopLossStage.value === 'Open Stage' && openStage !== undefined) {
                if (openStage.initialDefinition !== undefined) {
                    if (openStage.initialDefinition.initialStopLoss !== undefined) {
                        phase = openStage.initialDefinition.initialStopLoss.phases[tradingEngine.current.position.stopLoss.stopLossPhase.value]
                    }
                }
            }

            if (tradingEngine.current.position.stopLoss.stopLossStage.value === 'Manage Stage' && manageStage !== undefined) {
                if (manageStage.managedStopLoss !== undefined) {
                    phase = manageStage.managedStopLoss.phases[tradingEngine.current.position.stopLoss.stopLossPhase.value - 1]
                }
            }

            if (phase !== undefined) {
                if (phase.formula !== undefined) {
                    let previousValue = tradingEngine.current.position.stopLoss.value
                    tradingPositionModule.applyStopLossFormula(tradingSystem.formulas, phase.formula.id)

                    if (tradingEngine.current.position.stopLoss.value !== previousValue) {
                        announcementsModule.makeAnnoucements(phase)
                    }
                }
            }
        }

        function calculateTakeProfit() {
            let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
            let openStage = strategy.openStage
            let manageStage = strategy.manageStage
            let phase

            if (tradingEngine.current.position.takeProfit.takeProfitStage.value === 'Open Stage' && openStage !== undefined) {
                if (openStage.initialDefinition !== undefined) {
                    if (openStage.initialDefinition.initialTakeProfit !== undefined) {
                        phase = openStage.initialDefinition.initialTakeProfit.phases[tradingEngine.current.position.takeProfit.takeProfitPhase.value]
                    }
                }
            }

            if (tradingEngine.current.position.takeProfit.takeProfitStage.value === 'Manage Stage' && manageStage !== undefined) {
                if (manageStage.managedTakeProfit !== undefined) {
                    phase = manageStage.managedTakeProfit.phases[tradingEngine.current.position.takeProfit.takeProfitPhase.value - 1]
                }
            }

            if (phase !== undefined) {
                if (phase.formula !== undefined) {
                    let previousValue = tradingEngine.current.position.takeProfit.value
                    tradingPositionModule.applyTakeProfitFormula(tradingSystem.formulas, phase.formula.id)

                    if (tradingEngine.current.position.takeProfit.value !== previousValue) {
                        announcementsModule.makeAnnoucements(phase)
                    }
                }
            }
        }

        function calculateStopLossPosition() {
            /*
            The position of the Stop Loss (above or below the price) is needed in order to know
            later if the price hit the Stop Loss or not at every Simulation cycle. When we get 
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
            later if the price hit the Take Profit or not at every Simulation cycle. When we get 
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
            let openStage = strategy.openStage
            let manageStage = strategy.manageStage
            let parentNode
            let phaseIndex
            let phase
            let stopLoss
            let stage

            if (tradingEngine.current.position.stopLoss.stopLossStage.value === 'Open Stage' && openStage !== undefined) {
                stage = openStage
                if (openStage.initialDefinition !== undefined) {
                    if (openStage.initialDefinition.initialStopLoss !== undefined) {
                        parentNode = openStage.initialDefinition
                        phaseIndex = tradingEngine.current.position.stopLoss.stopLossPhase.value
                        stopLoss = openStage.initialDefinition.initialStopLoss
                        phase = stopLoss.phases[phaseIndex]
                    }
                }
            }

            if (tradingEngine.current.position.stopLoss.stopLossStage.value === 'Manage Stage' && manageStage !== undefined) {
                stage = manageStage
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
                            tradingSystem.highlights.push(stage.id)

                            tradingPositionModule.updateStopLoss(tradingEngine.current.position.stopLoss.stopLossPhase.value + 1, 'Manage Stage')

                            announcementsModule.makeAnnoucements(nextPhaseEvent)
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
                                tradingSystem.highlights.push(stage.id)

                                let moveToPhase = moveToPhaseEvent.referenceParent
                                if (moveToPhase !== undefined) {
                                    for (let q = 0; q < stopLoss.phases.length; q++) {
                                        if (stopLoss.phases[q].id === moveToPhase.id) {
                                            tradingPositionModule.updateStopLoss(q + 1, 'Manage Stage')
                                        }
                                    }
                                } else {
                                    tradingSystem.errors.push([moveToPhaseEvent.id, 'This Node needs to reference a Phase.'])
                                    continue
                                }

                                announcementsModule.makeAnnoucements(moveToPhaseEvent)
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
            let stage

            if (tradingEngine.current.position.takeProfit.takeProfitStage.value === 'Open Stage' && openStage !== undefined) {
                stage = openStage
                if (openStage.initialDefinition !== undefined) {
                    if (openStage.initialDefinition.initialTakeProfit !== undefined) {
                        parentNode = openStage.initialDefinition
                        phaseIndex = tradingEngine.current.position.takeProfit.takeProfitPhase.value
                        takeProfit = openStage.initialDefinition.initialTakeProfit
                        phase = takeProfit.phases[phaseIndex]
                    }
                }
            }

            if (tradingEngine.current.position.takeProfit.takeProfitStage.value === 'Manage Stage' && manageStage !== undefined) {
                stage = manageStage
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
                            tradingSystem.highlights.push(stage.id)

                            tradingPositionModule.updateTakeProfit(tradingEngine.current.position.takeProfit.takeProfitPhase.value + 1, 'Manage Stage')

                            announcementsModule.makeAnnoucements(nextPhaseEvent)
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
                                tradingSystem.highlights.push(stage.id)

                                let moveToPhase = moveToPhaseEvent.referenceParent
                                if (moveToPhase !== undefined) {
                                    for (let q = 0; q < takeProfit.phases.length; q++) {
                                        if (takeProfit.phases[q].id === moveToPhase.id) {
                                            tradingPositionModule.updateTakeProfit(q + 1, 'Manage Stage')
                                        }
                                    }
                                } else {
                                    tradingSystem.errors.push([moveToPhaseEvent.id, 'This Node needs to reference a Phase.'])
                                    continue
                                }

                                announcementsModule.makeAnnoucements(moveToPhaseEvent)
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
                        tradingEngine.current.candle.max.value >= tradingEngine.current.position.stopLoss.value
                    ) ||
                    (
                        tradingEngine.current.position.stopLoss.stopLossPosition.value === 'Below' &&
                        tradingEngine.current.candle.min.value <= tradingEngine.current.position.stopLoss.value
                    )
                ) {
                    logger.write(MODULE_NAME, '[INFO] checkStopLossOrTakeProfitWasHit -> Stop Loss was hit.')

                    tradingPositionModule.closingPosition('Stop Loss')
                    changeStageStatus('Close Stage', 'Opening')
                    changeStageStatus('Manage Stage', 'Closed')
                    announcementsModule.makeAnnoucements(strategy.closeStage)
                    return
                }

                /* Take Profit condition: Here we verify if the Take Profit was hit or not. */
                if (
                    (
                        tradingEngine.current.position.takeProfit.takeProfitPosition.value === 'Below' &&
                        tradingEngine.current.candle.min.value <= tradingEngine.current.position.takeProfit.value
                    ) ||
                    (
                        tradingEngine.current.position.takeProfit.takeProfitPosition.value === 'Above' &&
                        tradingEngine.current.candle.max.value >= tradingEngine.current.position.takeProfit.value
                    )
                ) {
                    logger.write(MODULE_NAME, '[INFO] checkStopLossOrTakeProfitWasHit -> Take Profit was hit.')

                    tradingPositionModule.closingPosition('Take Profit')
                    changeStageStatus('Close Stage', 'Opening')
                    changeStageStatus('Manage Stage', 'Closed')
                    announcementsModule.makeAnnoucements(strategy.closeStage)
                    return
                }
                return
            }
        }
    }

    async function runCloseStage() {
        /* Opening Status Procedure */
        if (tradingEngine.current.strategyCloseStage.status.value === 'Opening') {
            /* 
            This will happen only once, as soon as the Take Profit or Stop was hit.
            We wil not be placing orders at this time because we do not know
            the total filled size of the Open Stage. By skiping execution now
            we allow the open stage to get a final value for sizeFilled that we can use.
            */
            let stageNode = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].closeStage

            /* Exit Position size and rate */
            tradingSystem.evalFormulas(stageNode, 'Initial Targets')
            tradingPositionModule.initialTargets(stageNode)

            initializeStageTargetSize()
            changeStageStatus('Close Stage', 'Open')
            return
        }

        /* Open Status Procedure */
        if (tradingEngine.current.strategyCloseStage.status.value === 'Open') {
            /*
            This will happen as long as the Close Stage is Open.
            */
            let stageNode = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].closeStage
            let executionNode = stageNode.closeExecution

            tradingSystem.evalConditions(stageNode, 'Close Execution')
            tradingSystem.evalFormulas(stageNode, 'Close Execution')

            await tradingExecutionModule.runExecution(
                executionNode,
                false,
                tradingEngine.current.strategyCloseStage
            )

            /*
            The Open is finished when the placedSize reaches the targetSize in any of the 
            stage assets, and the fillSize + feesPaid reaches the placedSize also in any
            of the stage Assets.
            This can happens at any time when we update the sizeFilled and the feesPaid values 
            when we see at the exchange that orders were filled. 
            */
            if (
                (
                    tradingEngine.current.strategyOpenStage.stageBaseAsset.sizePlaced >=
                    tradingEngine.current.strategyOpenStage.stageBaseAsset.targetSize

                    ||

                    tradingEngine.current.strategyOpenStage.stageQuotedAsset.sizePlaced >=
                    tradingEngine.current.strategyOpenStage.stageQuotedAsset.targetSize
                )
                &&
                (
                    tradingEngine.current.strategyOpenStage.stageBaseAsset.sizeFilled.value +
                    tradingEngine.current.strategyOpenStage.stageBaseAsset.feesPaid.value >=
                    tradingEngine.current.strategyOpenStage.stageBaseAsset.sizePlaced.value

                    ||

                    tradingEngine.current.strategyOpenStage.stageQuotedAsset.sizeFilled.value +
                    tradingEngine.current.strategyOpenStage.stageQuotedAsset.feesPaid.value >=
                    tradingEngine.current.strategyOpenStage.stageQuotedAsset.sizePlaced.value
                )
            ) {
                changeStageStatus('Close Stage', 'Closed', 'Size Placed Filled')
            } else {
                /* Check the Close Stage Event */
                tradingSystem.evalConditions(stageNode, 'Close Stage Event')
                if (checkStopStageEvent(stageNode) === true) {
                    changeStageStatus('Close Stage', 'Closing', 'Close Stage Event')
                }
            }
        }

        /* Exit Position Validation */
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

            /* Exiting Everything now. */
            exitPositionAndStrategy()
        }

        function initializeStageTargetSize() {
            /*
            Here we will transform the position size into targets for each asset of the stage.
            */
            tradingEngine.current.strategyOpenStage.stageBaseAsset.targetSize.value = tradingEngine.current.position.positionBaseAsset.exitTargetSize.value
            tradingEngine.current.strategyOpenStage.stageQuotedAsset.targetSize.value = tradingEngine.current.position.positionQuotedAsset.exitTargetSize.value

            tradingEngine.current.strategyOpenStage.stageBaseAsset.targetSize.value = global.PRECISE(tradingEngine.current.strategyOpenStage.stageBaseAsset.targetSize.value, 10)
            tradingEngine.current.strategyOpenStage.stageQuotedAsset.targetSize.value = global.PRECISE(tradingEngine.current.strategyOpenStage.stageQuotedAsset.targetSize.value, 10)
        }

        function exitPositionAndStrategy() {

            /* Position Statistics & Results */
            tradingPositionModule.updateStatistics()
            tradingPositionModule.updateResults()

            updatingEpisodeAssets()
            updatingEpisodeStatistics()

            /* Taking Position Snapshot */
            if (bot.SESSION.type === 'Backtesting Session') {
                if (sessionParameters.snapshots !== undefined) {
                    if (sessionParameters.snapshots.config.position === true) {
                        snapshotsModule.positionExit()
                    }
                }
            }

            /* Taking Strategy Snapshot */
            if (bot.SESSION.type === 'Backtesting Session') {
                if (sessionParameters.snapshots !== undefined) {
                    if (sessionParameters.snapshots.config.strategy === true) {
                        snapshotsModule.strategyExit()
                    }
                }
            }

            /* Close the Position */
            tradingPositionModule.closePosition()

            /* Close the Strategy */
            tradingStrategyModule.closeStrategy('Position Closed')

            /* Distance to Events Updates */
            tradingEngine.current.distanceToEvent.closePosition.value = 1
            tradingEngine.current.distanceToEvent.triggerOff.value = 1

            function updatingEpisodeAssets() {

                /* Updating Hits & Fails */
                if (tradingEngine.current.position.positionBaseAsset.profitLoss.value > 0) {
                    tradingEngine.episode.episodeBaseAsset.hits.value++
                } else {
                    tradingEngine.episode.episodeBaseAsset.fails.value++
                }
                if (tradingEngine.current.position.positionQuotedAsset.profitLoss.value > 0) {
                    tradingEngine.episode.episodeQuotedAsset.hits.value++
                } else {
                    tradingEngine.episode.episodeQuotedAsset.fails.value++
                }

                /* Updating Profit Loss */
                tradingEngine.episode.episodeBaseAsset.profitLoss.value =
                    tradingEngine.current.balance.baseAsset.value -
                    sessionParameters.sessionBaseAsset.config.initialBalance

                tradingEngine.episode.episodeQuotedAsset.profitLoss.value =
                    tradingEngine.current.balance.quotedAsset.value -
                    sessionParameters.sessionQuotedAsset.config.initialBalance

                tradingEngine.episode.episodeBaseAsset.profitLoss.value = global.PRECISE(tradingEngine.episode.episodeBaseAsset.profitLoss.value, 10)
                tradingEngine.episode.episodeQuotedAsset.profitLoss.value = global.PRECISE(tradingEngine.episode.episodeQuotedAsset.profitLoss.value, 10)

                /* Updating ROI */
                tradingEngine.episode.episodeBaseAsset.ROI.value =
                    (sessionParameters.sessionBaseAsset.config.initialBalance + tradingEngine.episode.episodeBaseAsset.profitLoss.value) /
                    sessionParameters.sessionBaseAsset.config.initialBalance - 1

                tradingEngine.episode.episodeQuotedAsset.ROI.value =
                    (sessionParameters.sessionQuotedAsset.config.initialBalance + tradingEngine.episode.episodeQuotedAsset.profitLoss.value) /
                    sessionParameters.sessionQuotedAsset.config.initialBalance - 1

                tradingEngine.episode.episodeBaseAsset.ROI.value = global.PRECISE(tradingEngine.episode.episodeBaseAsset.ROI.value, 10)
                tradingEngine.episode.episodeQuotedAsset.ROI.value = global.PRECISE(tradingEngine.episode.episodeQuotedAsset.ROI.value, 10)

                /* Updating Hit Ratio */
                tradingEngine.episode.episodeBaseAsset.hitRatio.value =
                    tradingEngine.episode.episodeBaseAsset.hits.value /
                    tradingEngine.episode.episodeCounters.positions.value

                tradingEngine.episode.episodeQuotedAsset.hitRatio.value =
                    tradingEngine.episode.episodeQuotedAsset.hits.value /
                    tradingEngine.episode.episodeCounters.positions.value

                tradingEngine.episode.episodeBaseAsset.hitRatio.value = global.PRECISE(tradingEngine.episode.episodeBaseAsset.hitRatio.value, 10)
                tradingEngine.episode.episodeQuotedAsset.hitRatio.value = global.PRECISE(tradingEngine.episode.episodeQuotedAsset.hitRatio.value, 10)

                /* Updating Anualized Rate Of Return */
                tradingEngine.episode.episodeBaseAsset.anualizedRateOfReturn.value =
                    tradingEngine.episode.episodeBaseAsset.ROI.value /
                    tradingEngine.episode.episodeStatistics.days.value * 365

                tradingEngine.episode.episodeQuotedAsset.anualizedRateOfReturn.value =
                    tradingEngine.episode.episodeQuotedAsset.ROI.value /
                    tradingEngine.episode.episodeStatistics.days.value * 365

                tradingEngine.episode.episodeBaseAsset.anualizedRateOfReturn.value = global.PRECISE(tradingEngine.episode.episodeBaseAsset.anualizedRateOfReturn.value, 10)
                tradingEngine.episode.episodeQuotedAsset.anualizedRateOfReturn.value = global.PRECISE(tradingEngine.episode.episodeQuotedAsset.anualizedRateOfReturn.value, 10)

                /* Updating Hit or Fail */
                if (tradingEngine.episode.episodeBaseAsset.profitLoss.value > 0) {
                    tradingEngine.episode.episodeBaseAsset.hitFail.value = 'Hit'
                } else {
                    tradingEngine.episode.episodeBaseAsset.hitFail.value = 'Fail'
                }
                if (tradingEngine.episode.episodeQuotedAsset.profitLoss.value > 0) {
                    tradingEngine.episode.episodeQuotedAsset.hitFail.value = 'Hit'
                } else {
                    tradingEngine.episode.episodeQuotedAsset.hitFail.value = 'Fail'
                }
            }

            function updatingEpisodeStatistics() {

                /* Updating Profit Loss */
                tradingEngine.episode.episodeStatistics.profitLoss.value =
                    tradingEngine.episode.episodeBaseAsset.profitLoss.value * tradingEngine.current.candle.close.value +
                    tradingEngine.episode.episodeQuotedAsset.profitLoss.value

                tradingEngine.episode.episodeStatistics.profitLoss.value = global.PRECISE(tradingEngine.episode.episodeStatistics.profitLoss.value, 10)

                /* Updating ROI */
                tradingEngine.episode.episodeStatistics.ROI.value =
                    (
                        sessionParameters.sessionBaseAsset.config.initialBalance * tradingEngine.current.candle.close.value +
                        tradingEngine.episode.episodeBaseAsset.profitLoss.value * tradingEngine.current.candle.close.value +
                        sessionParameters.sessionQuotedAsset.config.initialBalance +
                        tradingEngine.episode.episodeQuotedAsset.profitLoss.value
                    ) / (
                        sessionParameters.sessionBaseAsset.config.initialBalance * tradingEngine.current.candle.close.value +
                        sessionParameters.sessionQuotedAsset.config.initialBalance
                    ) - 1

                tradingEngine.episode.episodeStatistics.ROI.value = global.PRECISE(tradingEngine.episode.episodeStatistics.ROI.value, 10)

                /* Updating Anualized Rate Of Return */
                tradingEngine.episode.episodeStatistics.anualizedRateOfReturn.value =
                    tradingEngine.episode.episodeStatistics.ROI.value /
                    tradingEngine.episode.episodeStatistics.days.value * 365

                tradingEngine.episode.episodeStatistics.anualizedRateOfReturn.value = global.PRECISE(tradingEngine.episode.episodeStatistics.anualizedRateOfReturn.value, 10)

                /* Updating Hit or Fail */
                if (tradingEngine.episode.episodeStatistics.profitLoss.value > 0) {
                    tradingEngine.episode.episodeStatistics.hitFail.value = 'Hit'
                } else {
                    tradingEngine.episode.episodeStatistics.hitFail.value = 'Fail'
                }
            }
        }
    }

    function checkStopStageEvent(stage) {

        /* Check the Close Stage Event. */
        let stopStageEvent = stage.stopStageEvent
        if (stopStageEvent !== undefined) {
            for (let k = 0; k < stopStageEvent.situations.length; k++) {
                let situation = stopStageEvent.situations[k]
                let passed
                if (situation.conditions.length > 0) {
                    passed = true
                }

                passed = tradingSystem.checkConditions(situation, passed)

                tradingSystem.values.push([situation.id, passed])
                if (passed) {
                    tradingSystem.highlights.push(situation.id)
                    tradingSystem.highlights.push(stopStageEvent.id)
                    tradingSystem.highlights.push(stage.id)

                    announcementsModule.makeAnnoucements(stopStageEvent)
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

        function openStage(stage) {
            /* Recording the opening at the Trading Engine Data Structure */
            stage.begin.value = tradingEngine.current.candle.begin.value
            stage.beginRate.value = tradingEngine.current.candle.close.value
            stage.end.value = tradingEngine.current.candle.end.value
        }

        function closeStage(stage) {
            /* Recording the closing at the Trading Engine Data Structure */
            stage.end.value = tradingEngine.current.candle.end.value
            stage.endRate.value = tradingEngine.current.candle.close.value
        }
    }

    function resetStage(stage) {
        stage.initialize(stage)
    }

    function updateEnds() {
        if (tradingEngine.current.strategyTriggerStage.status.value === 'Open') {
            tradingEngine.current.strategyTriggerStage.end.value = tradingEngine.current.candle.end.value
        }
        if (tradingEngine.current.strategyOpenStage.status.value === 'Open') {
            tradingEngine.current.strategyOpenStage.end.value = tradingEngine.current.candle.end.value
        }
        if (tradingEngine.current.strategyManageStage.status.value === 'Open') {
            tradingEngine.current.strategyManageStage.end.value = tradingEngine.current.candle.end.value
        }
        if (tradingEngine.current.strategyCloseStage.status.value === 'Open') {
            tradingEngine.current.strategyCloseStage.end.value = tradingEngine.current.candle.end.value
        }
    }

    function updateStatus() {
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
    }

    function updateCounters() {

    }

    function updateStatistics() {

    }
}