exports.newPortfolioManagementBotModulesPortfolioStages = function (processIndex) {
    /*
    This module packages all functions related to Stages.
    */
    const MODULE_NAME = 'Portfolio Stages'
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
        resetPortfolioEngineDataStructure: resetPortfolioEngineDataStructure,
        updateCounters: updateCounters,
        updateStatistics: updateStatistics,
        initialize: initialize,
        finalize: finalize
    }

    let portfolioStrategyModuleObject = TS.projects.portfolioManagement.botModules.portfolioStrategy.newPortfolioManagementBotModulesPortfolioStrategy(processIndex)
    let portfolioPositionModuleObject = TS.projects.portfolioManagement.botModules.portfolioPosition.newPortfolioManagementBotModulesPortfolioPosition(processIndex)
    let portfolioExecutionModuleObject = TS.projects.portfolioManagement.botModules.portfolioExecution.newPortfolioManagementBotModulesPortfolioExecution(processIndex)
    let announcementsModuleObject = TS.projects.socialBots.botModules.announcements.newSocialBotsBotModulesAnnouncements(processIndex)
    let snapshotsModuleObject = TS.projects.portfolioManagement.botModules.snapshots.newPortfolioManagementBotModulesSnapshots(processIndex)
    let portfolioEpisodeModuleObject = TS.projects.portfolioManagement.botModules.portfolioEpisode.newPortfolioManagementBotModulesPortfolioEpisode(processIndex)

    let portfolioEngine
    let portfolioSystem
    let sessionParameters

    return thisObject

    function initialize() {
        portfolioSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioSystem
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters

        portfolioStrategyModuleObject.initialize()
        portfolioPositionModuleObject.initialize()
        announcementsModuleObject.initialize()
        snapshotsModuleObject.initialize()
        portfolioExecutionModuleObject.initialize()
        portfolioEpisodeModuleObject.initialize()
    }

    function finalize() {
        portfolioEngine = undefined
        portfolioSystem = undefined
        sessionParameters = undefined

        portfolioStrategyModuleObject.finalize()
        portfolioStrategyModuleObject = undefined

        portfolioPositionModuleObject.finalize()
        portfolioPositionModuleObject = undefined

        announcementsModuleObject.finalize()
        announcementsModuleObject = undefined

        snapshotsModuleObject.finalize()
        snapshotsModuleObject = undefined

        portfolioExecutionModuleObject.finalize()
        portfolioExecutionModuleObject = undefined

        portfolioEpisodeModuleObject.finalize()
        portfolioEpisodeModuleObject = undefined
    }

    function updateChart(pChart, pExchange, pMarket) {
        snapshotsModuleObject.updateChart(pChart, pExchange, pMarket)
    }

    function mantain() {
        portfolioPositionModuleObject.mantain()
        portfolioStrategyModuleObject.mantain()
        portfolioExecutionModuleObject.mantain()

        updateCounters()
        updateEnds()
    }

    function reset() {
        resetPortfolioEngineDataStructure()

        portfolioPositionModuleObject.reset()
        portfolioStrategyModuleObject.reset()
        portfolioExecutionModuleObject.reset()
    }

    function cycleBasedStatistics() {
        portfolioEpisodeModuleObject.cycleBasedStatistics()
        portfolioPositionModuleObject.cycleBasedStatistics()
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
                portfolioEngine.portfolioCurrent.strategy.index.value === portfolioEngine.portfolioCurrent.strategy.index.config.initialValue
            ) {
                /*
                To pick a new strategy we will check that any of the situations of the trigger on is true. 
                Once we enter into one strategy, we will ignore market conditions for others. However there is also
                a strategy trigger off which can be hit before taking a position. If hit, we would
                be outside a strategy again and looking for the conditions to enter all over again.
                */
                portfolioSystem.evalConditions(portfolioSystem, 'Trigger On Event')

                for (let j = 0; j < portfolioSystem.portfolioStrategies.length; j++) {
                    if ( // If a strategy was already picked during the loop, we exit the loop
                        portfolioEngine.portfolioCurrent.strategy.index.value !== portfolioEngine.portfolioCurrent.strategy.index.config.initialValue
                    ) { continue }

                    let strategy = portfolioSystem.portfolioStrategies[j]
                    let triggerStage = strategy.triggerStage

                    if (triggerStage !== undefined) {
                        if (triggerStage.triggerOn !== undefined) {
                            for (let k = 0; k < triggerStage.triggerOn.situations.length; k++) {
                                let situation = triggerStage.triggerOn.situations[k]
                                let passed
                                if (situation.conditions.length > 0) {
                                    passed = true
                                }

                                passed = portfolioSystem.checkConditions(situation, passed)

                                portfolioSystem.values.push([situation.id, passed])
                                if (passed) {
                                    portfolioSystem.highlights.push(situation.id)
                                    portfolioSystem.highlights.push(triggerStage.triggerOn.id)
                                    portfolioSystem.highlights.push(triggerStage.id)

                                    portfolioStrategyModuleObject.openStrategy(j, situation.name, strategy.name)

                                    /* Initialize this */
                                    portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.triggerOn.value = 1

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

        function checkTriggerOff() {
            if (portfolioEngine.portfolioCurrent.strategyTriggerStage.status.value === 'Open') {
                checkUserDefinedCode('Trigger Stage', 'Running', 'first');

                let strategy = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value]
                let triggerStage = strategy.triggerStage

                portfolioSystem.evalConditions(strategy, 'Trigger Off Event')

                if (triggerStage !== undefined) {
                    if (triggerStage.triggerOff !== undefined) {
                        for (let k = 0; k < triggerStage.triggerOff.situations.length; k++) {
                            let situation = triggerStage.triggerOff.situations[k]
                            let passed
                            if (situation.conditions.length > 0) {
                                passed = true
                            }

                            passed = portfolioSystem.checkConditions(situation, passed)

                            portfolioSystem.values.push([situation.id, passed])
                            if (passed) {
                                portfolioSystem.highlights.push(situation.id)
                                portfolioSystem.highlights.push(triggerStage.triggerOff.id)
                                portfolioSystem.highlights.push(triggerStage.id)

                                portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.triggerOff.value = 1
                                announcementsModuleObject.makeAnnouncements(triggerStage.triggerOff)
                                changeStageStatus('Trigger Stage', 'Closed', 'Trigger Off Event')
                                portfolioStrategyModuleObject.closeStrategy('Trigger Off')
                            }
                        }
                    }
                }
            }
        }

        function checkTakePosition() {
            if (
                portfolioEngine.portfolioCurrent.strategyTriggerStage.status.value === 'Open'
            ) {
                let strategy = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value]
                let triggerStage = strategy.triggerStage

                portfolioSystem.evalConditions(strategy, 'Take Position Event')
                portfolioSystem.evalFormulas(strategy, 'Take Position Event')

                if (triggerStage !== undefined) {
                    if (triggerStage.takePosition !== undefined) {
                        for (let k = 0; k < triggerStage.takePosition.situations.length; k++) {
                            let situation = triggerStage.takePosition.situations[k]
                            let passed
                            if (situation.conditions.length > 0) {
                                passed = true
                            }

                            passed = portfolioSystem.checkConditions(situation, passed)

                            portfolioSystem.values.push([situation.id, passed])
                            if (passed) {
                                portfolioSystem.highlights.push(situation.id)
                                portfolioSystem.highlights.push(triggerStage.takePosition.id)
                                portfolioSystem.highlights.push(triggerStage.id)

                                portfolioPositionModuleObject.openPosition(situation.name)

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
        runWhenStatusIsOpening()
        await runWhenStatusIsOpen()
        await runWhenStatusIsClosing()

        function checkIfWeNeedToAbortTheStage() {
            /* Abort Open Stage Check */
            if (portfolioEngine.portfolioCurrent.strategyOpenStage.status.value === 'Open' &&
                (portfolioEngine.portfolioCurrent.strategyCloseStage.status.value === 'Opening' || portfolioEngine.portfolioCurrent.strategyCloseStage.status.value === 'Open') ){
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
            if (portfolioEngine.portfolioCurrent.strategyOpenStage.status.value === 'Opening') {
                /*
                The system allows the user not to define an Open Stage, because the Open Stage is optional.
                Here we are going to see if that is the case and if it is, we will immediately consider 
                the Open Stage as closed.
                */
                if (portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].openStage === undefined) {
                    changeStageStatus('Open Stage', 'Closed', 'Open Stage Undefined')
                    changeStageStatus('Close Stage', 'Opening')
                    return
                }

                /* This procedure is intended to run only once */
                let portfolioSystemStage = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].openStage
                let portfolioEngineStage = portfolioEngine.portfolioCurrent.strategyOpenStage

                /* Reset the Exchange Orders data structure to its initial value */
                TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.initializeNode(portfolioEngine.exchangeOrders)

                /* Entry Position size and rate */
                portfolioSystem.evalFormulas(portfolioSystemStage, 'Initial Targets')
                portfolioPositionModuleObject.initialTargets(portfolioSystemStage, portfolioEngineStage)
                initializeStageTargetSize()

                /* From here on, the stage is officially Open */
                changeStageStatus('Open Stage', 'Open')
            }
        }

        async function runWhenStatusIsOpen() {
            /* Open Status Procedure */
            if (portfolioEngine.portfolioCurrent.strategyOpenStage.status.value === 'Open') {
                /*
                While the Open Stage is Open, we do our regular stuff: place orders and check 
                what happened to the orders already placed.
                */
                checkUserDefinedCode('Open Stage', 'Running', 'first');
                let portfolioSystemStage = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].openStage
                let portfolioEngineStage = portfolioEngine.portfolioCurrent.strategyOpenStage
                let executionNode = portfolioSystemStage.openExecution

                /* Evaluate conditions and formulas so they are ready during the execution run */
                portfolioSystem.evalConditions(executionNode, 'Open Execution')
                portfolioSystem.evalFormulas(executionNode, 'Open Execution')

                await portfolioExecutionModuleObject.runExecution(
                    executionNode,
                    portfolioEngineStage
                )
                checkIfStageNeedsToBeClosed(portfolioEngineStage, portfolioSystemStage, 'Open Stage')

                /* User Defined Code if runWhileAtStage==true */
                if (portfolioEngine.portfolioCurrent.strategyOpenStage.status.value === 'Open') {
                  checkUserDefinedCode('Open Stage', 'Running', 'last');
                }
            }
        }

        async function runWhenStatusIsClosing() {
            /* Closing Status Procedure */
            if (portfolioEngine.portfolioCurrent.strategyOpenStage.status.value === 'Closing') {
                /*
                During the closing stage status, we do not place new orders, just check 
                if the ones placed were filled, and cancel the ones not filled.
                */
                let portfolioSystemStage = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].openStage
                let executionNode = portfolioSystemStage.openExecution

                /* 
                Check if there are unfilled orders, we will check if they were executed, 
                and cancel the ones that were not. 
                */
                portfolioSystem.evalConditions(portfolioSystemStage, 'Open Execution')
                portfolioSystem.evalFormulas(portfolioSystemStage, 'Open Execution')

                await portfolioExecutionModuleObject.runExecution(
                    executionNode,
                    portfolioEngine.portfolioCurrent.strategyOpenStage
                )

                /*
                The Closing is finished when the sizeFilled + feesPaid reaches the sizePlaced.
                This can happens either because we update the sizeFilled value when we see 
                at the exchange that orders were filled, or we reduce the sizePlaced when
                we cancel not yet filled orders. Here it does not matter the targetSize since
                this status represent a force closure of this stage.
                */
                switch (portfolioEngine.portfolioCurrent.strategyOpenStage.stageDefinedIn.value) {
                    case 'Base Asset': {
                        if (
                            portfolioEngine.portfolioCurrent.strategyOpenStage.stageBaseAsset.sizeFilled.value >=
                            portfolioEngine.portfolioCurrent.strategyOpenStage.stageBaseAsset.sizePlaced.value
                        ) {
                            changeStageStatus('Open Stage', 'Closed')
                        }
                        break
                    }
                    case 'Quoted Asset': {
                        if (
                            portfolioEngine.portfolioCurrent.strategyOpenStage.stageQuotedAsset.sizeFilled.value >=
                            portfolioEngine.portfolioCurrent.strategyOpenStage.stageQuotedAsset.sizePlaced.value
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
            if (portfolioEngine.portfolioCurrent.strategyOpenStage.stageBaseAsset === undefined) { badDefinitionUnhandledException(undefined, 'Stage Base Asset Node Missing', portfolioEngine.portfolioCurrent.strategyOpenStage) }
            if (portfolioEngine.portfolioCurrent.strategyOpenStage.stageBaseAsset.targetSize === undefined) { badDefinitionUnhandledException(undefined, 'Target Size Node Missing', portfolioEngine.portfolioCurrent.strategyOpenStage.stageBaseAsset) }
            if (portfolioEngine.portfolioCurrent.strategyOpenStage.stageQuotedAsset === undefined) { badDefinitionUnhandledException(undefined, 'Stage Quoted Asset Node Missing', portfolioEngine.portfolioCurrent.strategyOpenStage) }
            if (portfolioEngine.portfolioCurrent.strategyOpenStage.stageQuotedAsset.targetSize === undefined) { badDefinitionUnhandledException(undefined, 'Target Size Node Missing', portfolioEngine.portfolioCurrent.strategyOpenStage.stageQuotedAsset) }
            /*
            Here we will transform the position size into targets for each asset of the stage.
            */
            portfolioEngine.portfolioCurrent.strategyOpenStage.stageBaseAsset.targetSize.value = portfolioEngine.portfolioCurrent.position.positionBaseAsset.entryTargetSize.value
            portfolioEngine.portfolioCurrent.strategyOpenStage.stageQuotedAsset.targetSize.value = portfolioEngine.portfolioCurrent.position.positionQuotedAsset.entryTargetSize.value

            portfolioEngine.portfolioCurrent.strategyOpenStage.stageBaseAsset.targetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.strategyOpenStage.stageBaseAsset.targetSize.value, 10)
            portfolioEngine.portfolioCurrent.strategyOpenStage.stageQuotedAsset.targetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.strategyOpenStage.stageQuotedAsset.targetSize.value, 10)
        }
    }

    function runManageStage() {

        if (portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.value !== 'First') { return }

        runWhenStatusIsOpening()
        runWhenStatusIsOpen()

        function runWhenStatusIsOpening() {
            /* Opening Status Procedure */
            if (portfolioEngine.portfolioCurrent.strategyManageStage.status.value === 'Opening') {
                let strategy = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value]
                let manageStage = strategy.manageStage

                /*
                The system allows the user not to define a Manage Stage, because the Manage Stage is optional.
                Here we are going to see if that is the case and if it is, we will inmidiatelly consider 
                the Manage Stage as closed.
                */
                if (manageStage === undefined) {
                    changeStageStatus('Manage Stage', 'Closed', 'Manage Stage Undefined')
                    if (portfolioEngine.portfolioCurrent.strategyOpenStage.status.value !== 'Open' && portfolioEngine.portfolioCurrent.strategyOpenStage.status.value !== 'Opening') {
                        changeStageStatus('Close Stage', 'Opening');
                    }
                    return
                }

                /* Now we switch to the Open status. */
                changeStageStatus('Manage Stage', 'Open')
            }
        }

        function runWhenStatusIsOpen() {
            /* Open Status Procedure */
            if (portfolioEngine.portfolioCurrent.strategyManageStage.status.value === 'Open') {
                checkUserDefinedCode('Manage Stage', 'Running', 'first');
                let strategy = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value]
                let manageStage = strategy.manageStage

                /* Evaluate all the stage conditions and formulas to have them ready */
                portfolioSystem.evalConditions(manageStage, 'Manage Stage')
                portfolioSystem.evalFormulas(manageStage, 'Manage Stage')

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
                if (portfolioEngine.portfolioCurrent.strategyManageStage.status.value === 'Open') {
                  checkUserDefinedCode('Manage Stage', 'Running', 'last');
                }
            }

            function calculateStopLoss() {
                let strategy = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value]
                let manageStage = strategy.manageStage
                let phase

                if (manageStage !== undefined) {
                    if (manageStage.managedStopLoss !== undefined) {
                        phase = manageStage.managedStopLoss.phases[portfolioEngine.portfolioCurrent.position.stopLoss.stopLossPhase.value - 1]
                    }
                }

                if (phase !== undefined) {
                    if (phase.formula !== undefined) {
                        let previousValue = portfolioEngine.portfolioCurrent.position.stopLoss.value
                        portfolioPositionModuleObject.applyStopLossFormula(portfolioSystem.formulas, phase.formula.id)

                        if (portfolioEngine.portfolioCurrent.position.stopLoss.value !== previousValue) {
                            announcementsModuleObject.makeAnnouncements(phase)
                        }
                    }
                }
            }

            function calculateTakeProfit() {
                let strategy = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value]
                let manageStage = strategy.manageStage
                let phase

                if (manageStage !== undefined) {
                    if (manageStage.managedTakeProfit !== undefined) {
                        phase = manageStage.managedTakeProfit.phases[portfolioEngine.portfolioCurrent.position.takeProfit.takeProfitPhase.value - 1]
                    }
                }

                if (phase !== undefined) {
                    if (phase.formula !== undefined) {
                        let previousValue = portfolioEngine.portfolioCurrent.position.takeProfit.value
                        portfolioPositionModuleObject.applyTakeProfitFormula(portfolioSystem.formulas, phase.formula.id)

                        if (portfolioEngine.portfolioCurrent.position.takeProfit.value !== previousValue) {
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
                if (portfolioEngine.portfolioCurrent.position.stopLoss.stopLossPosition.value === portfolioEngine.portfolioCurrent.position.stopLoss.stopLossPosition.config.initialValue) {
                    if (portfolioEngine.portfolioCurrent.position.stopLoss.value > portfolioEngine.portfolioCurrent.position.entryTargetRate.value) {
                        portfolioEngine.portfolioCurrent.position.stopLoss.stopLossPosition.value = 'Above'
                    } else {
                        portfolioEngine.portfolioCurrent.position.stopLoss.stopLossPosition.value = 'Below'
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
                if (portfolioEngine.portfolioCurrent.position.takeProfit.takeProfitPosition.value === portfolioEngine.portfolioCurrent.position.takeProfit.takeProfitPosition.config.initialValue) {
                    if (portfolioEngine.portfolioCurrent.position.takeProfit.value > portfolioEngine.portfolioCurrent.position.entryTargetRate.value) {
                        portfolioEngine.portfolioCurrent.position.takeProfit.takeProfitPosition.value = 'Above'
                    } else {
                        portfolioEngine.portfolioCurrent.position.takeProfit.takeProfitPosition.value = 'Below'
                    }
                }
            }

            function checkStopPhasesEvents() {
                let strategy = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value]
                let manageStage = strategy.manageStage
                let parentNode
                let phaseIndex
                let phase
                let stopLoss

                if (manageStage !== undefined) {
                    if (manageStage.managedStopLoss !== undefined) {
                        parentNode = manageStage
                        phaseIndex = portfolioEngine.portfolioCurrent.position.stopLoss.stopLossPhase.value - 1
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

                            passed = portfolioSystem.checkConditions(situation, passed)

                            portfolioSystem.values.push([situation.id, passed])
                            if (passed) {
                                portfolioSystem.highlights.push(situation.id)
                                portfolioSystem.highlights.push(nextPhaseEvent.id)
                                portfolioSystem.highlights.push(phase.id)
                                portfolioSystem.highlights.push(stopLoss.id)
                                portfolioSystem.highlights.push(parentNode.id)
                                portfolioSystem.highlights.push(manageStage.id)

                                portfolioPositionModuleObject.updateStopLoss(portfolioEngine.portfolioCurrent.position.stopLoss.stopLossPhase.value + 1)

                                announcementsModuleObject.makeAnnouncements(nextPhaseEvent)

                                /* Reset this counter */
                                portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.nextPhase.value = 1
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

                                passed = portfolioSystem.checkConditions(situation, passed)

                                portfolioSystem.values.push([situation.id, passed])
                                if (passed) {
                                    portfolioSystem.highlights.push(situation.id)
                                    portfolioSystem.highlights.push(moveToPhaseEvent.id)
                                    portfolioSystem.highlights.push(phase.id)
                                    portfolioSystem.highlights.push(stopLoss.id)
                                    portfolioSystem.highlights.push(parentNode.id)
                                    portfolioSystem.highlights.push(manageStage.id)

                                    let moveToPhase = moveToPhaseEvent.referenceParent
                                    if (moveToPhase !== undefined) {
                                        for (let q = 0; q < stopLoss.phases.length; q++) {
                                            if (stopLoss.phases[q].id === moveToPhase.id) {
                                                portfolioPositionModuleObject.updateStopLoss(q + 1)
                                            }
                                        }
                                    } else {

                                        let docs = {
                                            project: 'Foundations',
                                            category: 'Topic',
                                            type: 'TS LF Portfolio Bot Error - Reference to Phase Node Missing',
                                            placeholder: {}
                                        }

                                        portfolioSystem.addError([moveToPhaseEvent.id, 'This Node needs to reference a Phase.', docs])
                                        continue
                                    }

                                    announcementsModuleObject.makeAnnouncements(moveToPhaseEvent)

                                    /* Reset this counter */
                                    portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.moveToPhase.value = 1
                                    return // only one event can pass at the time
                                }
                            }
                        }
                    }
                }
            }

            function checkTakeProfitPhaseEvents() {
                let strategy = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value]
                let openStage = strategy.openStage
                let manageStage = strategy.manageStage
                let parentNode
                let phaseIndex
                let phase
                let takeProfit

                if (manageStage !== undefined) {
                    if (manageStage.managedTakeProfit !== undefined) {
                        parentNode = manageStage
                        phaseIndex = portfolioEngine.portfolioCurrent.position.takeProfit.takeProfitPhase.value - 1
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

                            passed = portfolioSystem.checkConditions(situation, passed)

                            portfolioSystem.values.push([situation.id, passed])
                            if (passed) {
                                portfolioSystem.highlights.push(situation.id)
                                portfolioSystem.highlights.push(nextPhaseEvent.id)
                                portfolioSystem.highlights.push(phase.id)
                                portfolioSystem.highlights.push(takeProfit.id)
                                portfolioSystem.highlights.push(parentNode.id)
                                portfolioSystem.highlights.push(manageStage.id)

                                portfolioPositionModuleObject.updateTakeProfit(portfolioEngine.portfolioCurrent.position.takeProfit.takeProfitPhase.value + 1)

                                announcementsModuleObject.makeAnnouncements(nextPhaseEvent)

                                /* Reset this counter */
                                portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.nextPhase.value = 1
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

                                passed = portfolioSystem.checkConditions(situation, passed)

                                portfolioSystem.values.push([situation.id, passed])
                                if (passed) {
                                    portfolioSystem.highlights.push(situation.id)
                                    portfolioSystem.highlights.push(moveToPhaseEvent.id)
                                    portfolioSystem.highlights.push(phase.id)
                                    portfolioSystem.highlights.push(takeProfit.id)
                                    portfolioSystem.highlights.push(parentNode.id)
                                    portfolioSystem.highlights.push(manageStage.id)

                                    let moveToPhase = moveToPhaseEvent.referenceParent
                                    if (moveToPhase !== undefined) {
                                        for (let q = 0; q < takeProfit.phases.length; q++) {
                                            if (takeProfit.phases[q].id === moveToPhase.id) {
                                                portfolioPositionModuleObject.updateTakeProfit(q + 1)
                                            }
                                        }
                                    } else {

                                        let docs = {
                                            project: 'Foundations',
                                            category: 'Topic',
                                            type: 'TS LF Portfolio Bot Error - Reference to Phase Node Missing',
                                            placeholder: {}
                                        }

                                        portfolioSystem.addError([moveToPhaseEvent.id, 'This Node needs to reference a Phase.', docs])
                                        continue
                                    }

                                    announcementsModuleObject.makeAnnouncements(moveToPhaseEvent)

                                    /* Reset this counter */
                                    portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.moveToPhase.value = 1
                                    return // only one event can pass at the time
                                }
                            }
                        }
                    }
                }
            }

            function checkStopLossOrTakeProfitWasHit() {
                let strategy = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value]
                /* 
                Checking what happened since the last execution. We need to know if the Stop Loss
                or our Take Profit were hit. 
                */

                /* Stop Loss condition: Here we verify if the Stop Loss was hit or not. */
                if (
                    (
                        portfolioEngine.portfolioCurrent.position.stopLoss.stopLossPosition.value === 'Above' &&
                        portfolioEngine.portfolioCurrent.portfolioEpisode.candle.max.value >= portfolioEngine.portfolioCurrent.position.stopLoss.value
                    ) ||
                    (
                        portfolioEngine.portfolioCurrent.position.stopLoss.stopLossPosition.value === 'Below' &&
                        portfolioEngine.portfolioCurrent.portfolioEpisode.candle.min.value <= portfolioEngine.portfolioCurrent.position.stopLoss.value
                    )
                ) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] checkStopLossOrTakeProfitWasHit -> Stop Loss was hit.')

                    portfolioPositionModuleObject.closingPosition('Stop Loss')
                    changeStageStatus('Close Stage', 'Opening')
                    changeStageStatus('Manage Stage', 'Closed', 'Stop Loss Hit')
                    return
                }

                /* Take Profit condition: Here we verify if the Take Profit was hit or not. */
                if (
                    (
                        portfolioEngine.portfolioCurrent.position.takeProfit.takeProfitPosition.value === 'Below' &&
                        portfolioEngine.portfolioCurrent.portfolioEpisode.candle.min.value <= portfolioEngine.portfolioCurrent.position.takeProfit.value
                    ) ||
                    (
                        portfolioEngine.portfolioCurrent.position.takeProfit.takeProfitPosition.value === 'Above' &&
                        portfolioEngine.portfolioCurrent.portfolioEpisode.candle.max.value >= portfolioEngine.portfolioCurrent.position.takeProfit.value
                    )
                ) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] checkStopLossOrTakeProfitWasHit -> Take Profit was hit.')

                    portfolioPositionModuleObject.closingPosition('Take Profit')
                    changeStageStatus('Close Stage', 'Opening')
                    changeStageStatus('Manage Stage', 'Closed', 'Take Profit Hit')
                    return
                }
                return
            }
        }
    }

    async function runCloseStage() {

        runWhenStatusIsOpening()
        await runWhenStatusIsOpen()
        await runWhenStatusIsClosing()

        function runWhenStatusIsOpening() {

            /* Opening Status Procedure */
            if (portfolioEngine.portfolioCurrent.strategyCloseStage.status.value === 'Opening') {
                /*
                The system allows the user not to define a close stage, because the close stage is optional.
                Here we are goint to see if that is the case and if it is, we will inmidiatelly consider 
                the close stage as closed.
                */
                if (portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].closeStage === undefined) {
                    changeStageStatus('Close Stage', 'Closed', 'Close Stage Undefined')
                    return
                }

                /* 
                This will happen only once, as soon as the Take Profit or Stop was hit.
                */
                let portfolioSystemStage = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].closeStage

                /* Exit Position size and rate */
                portfolioSystem.evalFormulas(portfolioSystemStage, 'Initial Targets')
                if (portfolioPositionModuleObject.initialTargets(portfolioSystemStage, portfolioEngine.portfolioCurrent.strategyCloseStage, 'Close Stage') === false) {
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
                portfolioEngine.portfolioCurrent.strategyCloseStage.status.value === 'Open' &&
                (
                    portfolioEngine.portfolioCurrent.strategyOpenStage.status.value === 'Closed' ||
                    portfolioEngine.portfolioCurrent.strategyOpenStage.status.value === portfolioEngine.portfolioCurrent.strategyOpenStage.status.config.initialValue
                )
            ) {
                /*
                This will happen as long as the Close Stage is Open.
                */
                checkUserDefinedCode('Close Stage', 'Running', 'first');
                let portfolioSystemStage = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].closeStage
                let portfolioEngineStage = portfolioEngine.portfolioCurrent.strategyCloseStage
                let executionNode = portfolioSystemStage.closeExecution

                portfolioSystem.evalConditions(portfolioSystemStage, 'Close Execution')
                portfolioSystem.evalFormulas(portfolioSystemStage, 'Close Execution')

                await portfolioExecutionModuleObject.runExecution(
                    executionNode,
                    portfolioEngine.portfolioCurrent.strategyCloseStage
                )

                checkIfStageNeedsToBeClosed(portfolioEngineStage, portfolioSystemStage, 'Close Stage')
                /* If User Defined Code exists check for runWhileAtStage */
                if (portfolioEngine.portfolioCurrent.strategyCloseStage.status.value === 'Open') {
                  checkUserDefinedCode('Close Stage', 'Running', 'last');
                }
            }
        }

        async function runWhenStatusIsClosing() {
            /* Closing Status Procedure */
            if (portfolioEngine.portfolioCurrent.strategyCloseStage.status.value === 'Closing') {
                /*
                During the closing stage status, we do not place new orders, just check
                if the ones placed were filled, and cancel the ones not filled.
                */
                let portfolioSystemStage = portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].closeStage
                let executionNode = portfolioSystemStage.closeExecution

                /*
                Check if there are unfilled orders, we will check if they were executed,
                and cancel the ones that were not.
                */
                portfolioSystem.evalConditions(portfolioSystemStage, 'Close Execution')
                portfolioSystem.evalFormulas(portfolioSystemStage, 'Close Execution')

                await portfolioExecutionModuleObject.runExecution(
                    executionNode,
                    portfolioEngine.portfolioCurrent.strategyCloseStage
                )

                /*
                The Closing is finished when the sizeFilled + feesPaid reaches the sizePlaced.
                This can happens either because we update the sizeFilled value when we see
                at the exchange that orders were filled, or we reduce the sizePlaced when
                we cancel not yet filled orders. Here it does not matter the targetSize since
                this status represent a force closure of this stage.
                */
                switch (portfolioEngine.portfolioCurrent.strategyCloseStage.stageDefinedIn.value) {
                    case 'Base Asset': {
                        if (
                            portfolioEngine.portfolioCurrent.strategyCloseStage.stageBaseAsset.sizeFilled.value >=
                            portfolioEngine.portfolioCurrent.strategyCloseStage.stageBaseAsset.sizePlaced.value
                        ) {
                            changeStageStatus('Close Stage', 'Closed')
                        }
                        break
                    }
                    case 'Quoted Asset': {
                        if (
                            portfolioEngine.portfolioCurrent.strategyCloseStage.stageQuotedAsset.sizeFilled.value >=
                            portfolioEngine.portfolioCurrent.strategyCloseStage.stageQuotedAsset.sizePlaced.value
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
            if (portfolioEngine.portfolioCurrent.strategyCloseStage.stageBaseAsset === undefined) { badDefinitionUnhandledException(undefined, 'Stage Base Asset Node Missing', portfolioEngine.portfolioCurrent.strategyCloseStage) }
            if (portfolioEngine.portfolioCurrent.strategyCloseStage.stageBaseAsset.targetSize === undefined) { badDefinitionUnhandledException(undefined, 'Target Size Node Missing', portfolioEngine.portfolioCurrent.strategyCloseStage.stageBaseAsset) }
            if (portfolioEngine.portfolioCurrent.strategyCloseStage.stageQuotedAsset === undefined) { badDefinitionUnhandledException(undefined, 'Stage Quoted Asset Node Missing', portfolioEngine.portfolioCurrent.strategyCloseStage) }
            if (portfolioEngine.portfolioCurrent.strategyCloseStage.stageQuotedAsset.targetSize === undefined) { badDefinitionUnhandledException(undefined, 'Target Size Node Missing', portfolioEngine.portfolioCurrent.strategyCloseStage.stageQuotedAsset) }
            /*
            Here we will transform the position size into targets for each asset of the stage.
            */
            portfolioEngine.portfolioCurrent.strategyCloseStage.stageBaseAsset.targetSize.value = portfolioEngine.portfolioCurrent.position.positionBaseAsset.exitTargetSize.value
            portfolioEngine.portfolioCurrent.strategyCloseStage.stageQuotedAsset.targetSize.value = portfolioEngine.portfolioCurrent.position.positionQuotedAsset.exitTargetSize.value

            portfolioEngine.portfolioCurrent.strategyCloseStage.stageBaseAsset.targetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.strategyCloseStage.stageBaseAsset.targetSize.value, 10)
            portfolioEngine.portfolioCurrent.strategyCloseStage.stageQuotedAsset.targetSize.value = TS.projects.foundations.utilities.miscellaneousFunctions.truncateToThisPrecision(portfolioEngine.portfolioCurrent.strategyCloseStage.stageQuotedAsset.targetSize.value, 10)
        }
    }

    function exitPositionValidation() {
        /* 
        Exit Position Validation: we need all the previous stages to be either closed 
        or at their initial default value. The last is because after Closed objects are 
        initialized to their defaults.
        */
        if (portfolioEngine.portfolioCurrent.position.status.value !== 'Open' && portfolioEngine.portfolioCurrent.position.status.value !== 'Closing') { return }
        if (portfolioEngine.portfolioCurrent.position.status.value !== 'Close' && portfolioEngine.portfolioCurrent.position.status.value !== 'Closing') { return }
        if (
            (
                portfolioEngine.portfolioCurrent.strategyTriggerStage.status.value === 'Closed' ||
                portfolioEngine.portfolioCurrent.strategyTriggerStage.status.value === portfolioEngine.portfolioCurrent.strategyTriggerStage.status.config.initialValue
            )
            &&
            (
                portfolioEngine.portfolioCurrent.strategyOpenStage.status.value === 'Closed' ||
                portfolioEngine.portfolioCurrent.strategyOpenStage.status.value === portfolioEngine.portfolioCurrent.strategyOpenStage.status.config.initialValue
            )
            &&
            (
                portfolioEngine.portfolioCurrent.strategyManageStage.status.value === 'Closed' ||
                portfolioEngine.portfolioCurrent.strategyManageStage.status.value === portfolioEngine.portfolioCurrent.strategyManageStage.status.config.initialValue
            )
            &&
            (
                portfolioEngine.portfolioCurrent.strategyCloseStage.status.value === 'Closed'
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
                portfolioPositionModuleObject.closePosition()

                /* Close the Strategy */
                portfolioStrategyModuleObject.closeStrategy('Position Closed')

                /* Distance-To-Portfolio-Events Updates */
                portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.closePosition.value = 1
                portfolioEngine.portfolioCurrent.portfolioEpisode.distanceToPortfolioEvent.triggerOff.value = 1

            }
        }
    }

    function checkIfStageNeedsToBeClosed(portfolioEngineStage, portfolioSystemStage, stageName) {
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
        if (portfolioSystemStage.config.roundingErrorCorrectionFactor !== undefined) {
            ROUNDING_ERROR_CORRECTION_FACTOR = portfolioSystemStage.config.roundingErrorCorrectionFactor
        }
        /*
        We will also implement a mechanism to allow users declare an absolute value to add
        to the Size Filled before checking it againt the Stage Target Size.
        */
        let ABSOLUTE_DUST_IN_BASE_ASSET = 0
        if (portfolioSystemStage.config.absoluteDustInBaseAsset !== undefined) {
            ABSOLUTE_DUST_IN_BASE_ASSET = portfolioSystemStage.config.absoluteDustInBaseAsset
        }
        let ABSOLUTE_DUST_IN_QUOTED_ASSET = 0
        if (portfolioSystemStage.config.absoluteDustInQuotedAsset !== undefined) {
            ABSOLUTE_DUST_IN_QUOTED_ASSET = portfolioSystemStage.config.absoluteDustInQuotedAsset
        }

        if (
            portfolioEngineStage.stageBaseAsset.sizeFilled.value
            *
            ROUNDING_ERROR_CORRECTION_FACTOR
            +
            ABSOLUTE_DUST_IN_BASE_ASSET
            >=
            portfolioEngineStage.stageBaseAsset.targetSize.value
        ) {
            positionFilled()
        } else if (
            portfolioEngineStage.stageQuotedAsset.sizeFilled.value
            *
            ROUNDING_ERROR_CORRECTION_FACTOR
            +
            ABSOLUTE_DUST_IN_QUOTED_ASSET
            >=
            portfolioEngineStage.stageQuotedAsset.targetSize.value
        ) {
            positionFilled()
        } else {
            checkCloseStageEvent(portfolioSystemStage)
        }

        function positionFilled() {
            changeStageStatus(stageName, 'Closed', 'Position Size Filled')
        }

        function checkCloseStageEvent(portfolioSystemStage) {
            /* Check the Close Stage Event */
            portfolioSystem.evalConditions(portfolioSystemStage, 'Close Stage Event')
            if (checkStopStageEvent(portfolioSystemStage) === true) {
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

                passed = portfolioSystem.checkConditions(situation, passed)

                portfolioSystem.values.push([situation.id, passed])
                if (passed) {
                    portfolioSystem.highlights.push(situation.id)
                    portfolioSystem.highlights.push(closeStageEvent.id)
                    portfolioSystem.highlights.push(stage.id)

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
                stage = portfolioEngine.portfolioCurrent.strategyTriggerStage
                break
            }
            case 'Open Stage': {
                stage = portfolioEngine.portfolioCurrent.strategyOpenStage
                break
            }
            case 'Manage Stage': {
                stage = portfolioEngine.portfolioCurrent.strategyManageStage
                break
            }
            case 'Close Stage': {
                stage = portfolioEngine.portfolioCurrent.strategyCloseStage
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
            checkAnnounce(stageName, 'Open')
        }
        if (stage.status.value === 'Closed') {
            checkUserDefinedCode(stageName, 'Closed')
            checkAnnounce(stageName, 'Closed')
            closeStage(stage, stageName)
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
            /* Recording the opening at the Portfolio Engine Data Structure */
            stage.begin.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastBegin.value
            stage.end.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastEnd.value
            stage.beginRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
        }

        function closeStage(stage, stageName) {
            /* Recording the closing at the Portfolio Engine Data Structure */
            stage.end.value = portfolioEngine.portfolioCurrent.portfolioEpisode.cycle.lastEnd.value
            stage.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
            
            if (stageName === 'Open Stage') {
                if (portfolioEngine.portfolioCurrent.strategyCloseStage.status.value !== 'Opening' && portfolioEngine.portfolioCurrent.strategyCloseStage.status.value !== 'Open' &&
                    portfolioEngine.portfolioCurrent.strategyManageStage.status.value !== 'Opening' && portfolioEngine.portfolioCurrent.strategyManageStage.status.value !== 'Open') {
                    changeStageStatus('Close Stage', 'Opening');
                }
            }
            if (stageName === 'Close Stage') {
                if (portfolioEngine.portfolioCurrent.position.status.value === 'Open') {
                    portfolioPositionModuleObject.closingPosition('Close Stage Closed')
                }
            }
        }
    }

    function updateEnds() {
        /* 
        Note that we can not use the cycle here because this is executed via mantain
        which in turn is executed before the first cycle for this candle is set. 
        */
        if (portfolioEngine.portfolioCurrent.strategyTriggerStage.status.value === 'Open') {
            portfolioEngine.portfolioCurrent.strategyTriggerStage.end.value = portfolioEngine.portfolioCurrent.strategyTriggerStage.end.value + sessionParameters.timeFrame.config.value
            portfolioEngine.portfolioCurrent.strategyTriggerStage.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
        }
        if (portfolioEngine.portfolioCurrent.strategyOpenStage.status.value === 'Open') {
            portfolioEngine.portfolioCurrent.strategyOpenStage.end.value = portfolioEngine.portfolioCurrent.strategyOpenStage.end.value + sessionParameters.timeFrame.config.value
            portfolioEngine.portfolioCurrent.strategyOpenStage.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
        }
        if (portfolioEngine.portfolioCurrent.strategyManageStage.status.value === 'Open') {
            portfolioEngine.portfolioCurrent.strategyManageStage.end.value = portfolioEngine.portfolioCurrent.strategyManageStage.end.value + sessionParameters.timeFrame.config.value
            portfolioEngine.portfolioCurrent.strategyManageStage.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
        }
        if (portfolioEngine.portfolioCurrent.strategyCloseStage.status.value === 'Open') {
            portfolioEngine.portfolioCurrent.strategyCloseStage.end.value = portfolioEngine.portfolioCurrent.strategyCloseStage.end.value + sessionParameters.timeFrame.config.value
            portfolioEngine.portfolioCurrent.strategyCloseStage.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
        }
    }

    function resetPortfolioEngineDataStructure() {
        if (portfolioEngine.portfolioCurrent.strategyTriggerStage.status.value === 'Closed') {
            resetStage(portfolioEngine.portfolioCurrent.strategyTriggerStage.status)
        }
        if (portfolioEngine.portfolioCurrent.strategyOpenStage.status.value === 'Closed') {
            resetStage(portfolioEngine.portfolioCurrent.strategyOpenStage.status)
        }
        if (portfolioEngine.portfolioCurrent.strategyManageStage.status.value === 'Closed') {
            resetStage(portfolioEngine.portfolioCurrent.strategyManageStage.status)
        }
        if (portfolioEngine.portfolioCurrent.strategyCloseStage.status.value === 'Closed') {
            resetStage(portfolioEngine.portfolioCurrent.strategyCloseStage.status)
        }

        if (portfolioEngine.portfolioCurrent.position.status.value === 'Closed') {
            resetStage(portfolioEngine.portfolioCurrent.strategyTriggerStage)
            resetStage(portfolioEngine.portfolioCurrent.strategyOpenStage)
            resetStage(portfolioEngine.portfolioCurrent.strategyManageStage)
            resetStage(portfolioEngine.portfolioCurrent.strategyCloseStage)
        }
        function resetStage(stage) {
            TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.initializeNode(stage)
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
            type: 'TS LF Portfolio Bot Error - ' + message,
            placeholder: {}
        }

        portfolioSystem.addError([node.id, message, docs])

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
        let portfolioSystemStage = getPortfolioSystemStage(stage);

        if (portfolioSystemStage !== undefined &&
            portfolioSystemStage.userDefinedCode !== undefined) {
            if (status === 'Running' && when !== portfolioSystemStage.userDefinedCode.config.whileAtStageWhenToRun) { return; }

            switch(status) {
                case 'Open' : {
                    if (portfolioSystemStage.userDefinedCode.config.runWhenEnteringStage) {
                        portfolioSystem.evalUserCode(portfolioSystemStage, 'User Defined Code');
                    }
                    break;
                }
                case 'Running' : {
                    if (portfolioSystemStage.userDefinedCode.config.runWhileAtStage) {
                        portfolioSystem.evalUserCode(portfolioSystemStage, 'User Defined Code');
                    }
                    break;
                }
                case 'Closed' : {
                    if (portfolioSystemStage.userDefinedCode.config.runWhenExitingStage) {
                        portfolioSystem.evalUserCode(portfolioSystemStage, 'User Defined Code');
                    }
                    break;
                }
            }
        }
    }

    // checkAnnounce(): Check if stage announcement should be made
    function checkAnnounce(stage, status) {
        let portfolioSystemStage = getPortfolioSystemStage(stage);
        if (status === 'Open' || status === 'Closed') {
            announcementsModuleObject.makeAnnouncements(portfolioSystemStage, status)
        }
    }

    /* getPortfolioSystemStage(): takes stage name returns stage object. */
    function getPortfolioSystemStage(stage) {
      switch(stage) {
        case 'Trigger Stage' : {
          return portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].triggerStage;
          break;
        }
        case 'Open Stage' : {
          return portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].openStage;
          break;
        }
        case 'Manage Stage' : {
          return portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].manageStage;
          break
        }
        case 'Close Stage' : {
          return portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].closeStage;
          break;
        }
      }
    }
}
