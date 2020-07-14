exports.newTradingSystem = function newTradingSystem(bot, logger, tradingEngineModule) {
    /*
    The Trading System is the user defined set of rules compliant with the Trading Protocol that
    defines the trading logic to be applied during each cycle of the Simulation.
    */
    const MODULE_NAME = 'Trading System'
    let thisObject = {
        reset: reset,
        mantainStrategies: mantainStrategies,
        mantainPositions: mantainPositions,
        triggerStage: triggerStage,
        openStage: openStage,
        manageStage: manageStage,
        closeStage: closeStage,
        initialize: initialize,
        finalize: finalize
    }

    let chart

    let tradingSystem
    let tradingEngine
    let sessionParameters

    let conditions = new Map()
    let formulas = new Map()

    const TRADING_STRATEGY_MODULE = require('./TradingStrategy.js')
    let tradingStrategyModule = TRADING_STRATEGY_MODULE.newTradingStrategy(bot, logger, tradingEngineModule)

    const TRADING_POSITION_MODULE = require('./TradingPosition.js')
    let tradingPositionModule = TRADING_POSITION_MODULE.newTradingPosition(bot, logger, tradingEngineModule)

    const ANNOUNCEMENTS_MODULE = require('./Announcements.js')
    let announcementsModule = ANNOUNCEMENTS_MODULE.newAnnouncements(bot, logger)

    const SNAPSHOTS_MODULE = require('./Snapshots.js')
    let snapshotsModule = SNAPSHOTS_MODULE.newSnapshots(bot, logger)

    const TRADING_ENGINE_EXECUTION = require('./TradingExecution.js')
    let tradingExecutionModule = TRADING_ENGINE_EXECUTION.newTradingExecution(bot, logger)

    /* Variables to know when we need to open or close a position. */
    let triggeringOn
    let triggeringOff
    let takingPosition
    let closingPosition

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

        chart = undefined

        conditions = undefined
        formulas = undefined

        tradingSystem.highlights = undefined
        tradingSystem.errors = undefined
        tradingSystem.values = undefined
        tradingSystem.status = undefined
        tradingSystem.progress = undefined
        tradingSystem.running = undefined

        tradingSystem = undefined
        tradingEngine = undefined
        sessionParameters = undefined
    }

    function reset(pChart) {
        /* This function helps reset data structures at every cycle of the simulation loop/=. */
        chart = pChart // We need chat to be a local object accessible from conditions and formulas.
        snapshotsModule.reset(chart)

        tradingSystem.highlights = []
        tradingSystem.errors = []
        tradingSystem.values = []
        tradingSystem.status = []
        tradingSystem.progress = []
        tradingSystem.running = []
        tradingSystem.announcements = []
    }

    function mantainStrategies() {
        tradingStrategyModule.updateStatus()
        tradingStrategyModule.updateCounters()
        tradingStrategyModule.updateEnds()
    }

    function mantainPositions() {
        tradingPositionModule.updateStatus()
        tradingPositionModule.updateCounters()
        tradingPositionModule.updateEnds()
    }

    function evalConditions(startingNode, descendentOfNodeType) {
        evalNode(startingNode, 'Conditions', descendentOfNodeType)
    }

    function evalFormulas(startingNode, descendentOfNodeType) {
        evalNode(startingNode, 'Formulas', descendentOfNodeType)
    }

    function evalNode(node, evaluating, descendentOfNodeType, isDescendent) {
        if (node === undefined) { return }

        /* Verify if this node is decendent of the specified node type */
        if (isDescendent !== true) {
            if (node.type === descendentOfNodeType) {
                isDescendent = true
            }
        }

        /* Here we check if there is a codition to be evaluated */
        if (node.type === 'Condition' && evaluating === 'Conditions') {
            /* We will eval this condition */
            if (isDescendent === true) {
                evalCondition(node)
            }
        }

        /* Here we check if there is a formula to be evaluated */
        if (node.type === 'Formula' && evaluating === 'Formulas') {
            if (node.code !== undefined) {
                /* We will eval this formula */
                if (isDescendent === true) {
                    evalFormula(node)
                }
            }
        }

        /* Now we go down through all this node children */
        let nodeDefinition = bot.APP_SCHEMA_MAP.get(node.type)
        if (nodeDefinition === undefined) { return }

        if (nodeDefinition.properties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
            for (let i = 0; i < nodeDefinition.properties.length; i++) {
                let property = nodeDefinition.properties[i]

                switch (property.type) {
                    case 'node': {
                        if (property.name !== previousPropertyName) {
                            if (node[property.name] !== undefined) {
                                evalNode(node[property.name], evaluating, descendentOfNodeType, isDescendent)
                            }
                            previousPropertyName = property.name
                        }
                        break
                    }
                    case 'array': {
                        if (node[property.name] !== undefined) {
                            let nodePropertyArray = node[property.name]
                            for (let m = 0; m < nodePropertyArray.length; m++) {
                                evalNode(nodePropertyArray[m], evaluating, descendentOfNodeType, isDescendent)
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function evalCondition(node) {
        let value
        let error
        /*
        The code can be at the condition node if it was done with the Conditions Editor, or it can also be
        at a Javascript Code node. If there is a Javascript object we will give it preference and take the code
        from there. Otherwise we will take the code from the Condition node.
        */
        let code = node.code
        if (node.javascriptCode !== undefined) {
            if (node.javascriptCode.code !== undefined) {
                code = node.javascriptCode.code
            }
        }

        try {
            logger.write(MODULE_NAME, '[INFO] evalCondition -> code = ' + code)
            value = eval(code)
        } catch (err) {
            /*
                One possible error is that the conditions references a .previous that is undefined. This
                will not be considered an error.
            */
            value = false

            if (code.indexOf('previous') > -1 && err.message.indexOf('of undefined') > -1 ||
                code.indexOf('chart') > -1 && err.message.indexOf('of undefined') > -1
            ) {
                /*
                    We are not going to set an error for the casess we are using previous and the error is that the indicator is undefined.
                */
            } else {
                error = err.message
            }
        }

        conditions.set(node.id, value)

        if (value === true) {
            tradingSystem.highlights.push(node.id)
        }
        if (error !== undefined) {
            tradingSystem.errors.push([node.id, error])
        }
        if (value !== undefined) {
            tradingSystem.values.push([node.id, value])
        }

        logger.write(MODULE_NAME, '[INFO] evalCondition -> value = ' + value)
        logger.write(MODULE_NAME, '[INFO] evalCondition -> error = ' + error)
    }

    function evalFormula(node) {
        let value
        let error

        try {
            logger.write(MODULE_NAME, '[INFO] evalFormula -> code = ' + node.code)
            value = eval(node.code)
        } catch (err) {
            /*
                One possible error is that the formula references a .previous that is undefined. This
                will not be considered an error.
            */
            value = 0

            if (node.code.indexOf('previous') > -1 && err.message.indexOf('of undefined') > -1 ||
                node.code.indexOf('chart') > -1 && err.message.indexOf('of undefined') > -1
            ) {
                /*
                    We are not going to set an error for the casess we are using previous and the error is that the indicator is undefined.
                */
            } else {
                error = err.message
            }
        }

        formulas.set(node.id, value)

        if (error !== undefined) {
            tradingSystem.errors.push([node.id, error])
        }
        if (value !== undefined) {
            tradingSystem.values.push([node.id, value])
        }

        logger.write(MODULE_NAME, '[INFO] evalFormula -> value = ' + value)
        logger.write(MODULE_NAME, '[INFO] evalFormula -> error = ' + error)
    }

    function triggerStage() {
        /*
        We check if we will be triggering on, off or taking position.
        */
        triggeringOn = checkTriggerOn()
        triggeringOff = checkTriggerOff()
        takingPosition = checkTakePosition()

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
                evalConditions(tradingSystem, 'Trigger On Event')

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

                                passed = checkConditions(situation, passed)

                                tradingSystem.values.push([situation.id, passed])
                                if (passed) {
                                    tradingSystem.highlights.push(situation.id)
                                    tradingSystem.highlights.push(triggerStage.triggerOn.id)
                                    tradingSystem.highlights.push(triggerStage.id)

                                    tradingStrategyModule.openStrategy(j, situation.name, strategy.name)
                                    tradingStrategyModule.updateStageType('Trigger Stage')

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

                                    logger.write(MODULE_NAME, '[INFO] checkTriggerOn -> Entering into Strategy: ' + strategy.name)
                                    return true // This Means that we have just met the conditions to trigger on.
                                }
                            }
                        }
                    }
                }
            }
            return false // This Means that we have not met the conditions to trigger on.
        }

        function checkTriggerOff() {
            if (tradingEngine.current.strategy.stageType.value === 'Trigger Stage') {

                let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
                let triggerStage = strategy.triggerStage

                evalConditions(strategy, 'Trigger Off Event')

                if (triggerStage !== undefined) {
                    if (triggerStage.triggerOff !== undefined) {
                        for (let k = 0; k < triggerStage.triggerOff.situations.length; k++) {
                            let situation = triggerStage.triggerOff.situations[k]
                            let passed
                            if (situation.conditions.length > 0) {
                                passed = true
                            }

                            passed = checkConditions(situation, passed)

                            tradingSystem.values.push([situation.id, passed])
                            if (passed) {
                                tradingSystem.highlights.push(situation.id)
                                tradingSystem.highlights.push(triggerStage.triggerOff.id)
                                tradingSystem.highlights.push(triggerStage.id)

                                tradingStrategyModule.closeStrategy('Trigger Off')

                                tradingEngine.current.distanceToEvent.triggerOff.value = 1

                                announcementsModule.makeAnnoucements(triggerStage.triggerOff)

                                logger.write(MODULE_NAME, '[INFO] checkTriggerOff -> Closing Strategy: ' + strategy.name)
                                return true // This Means that we have just met the conditions to trigger off.
                            }
                        }
                    }
                }
            }
            return false // This Means that we have not met the conditions to trigger off.
        }

        function checkTakePosition() {
            /* Take Position Condition */
            if (
                tradingEngine.current.strategy.stageType.value === 'Trigger Stage' &&
                tradingEngine.current.strategy.status.value === 'Open'
            ) {
                let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
                let triggerStage = strategy.triggerStage

                evalConditions(strategy, 'Take Position Event')
                evalFormulas(strategy, 'Take Position Event')

                if (triggerStage !== undefined) {
                    if (triggerStage.takePosition !== undefined) {
                        for (let k = 0; k < triggerStage.takePosition.situations.length; k++) {
                            let situation = triggerStage.takePosition.situations[k]
                            let passed
                            if (situation.conditions.length > 0) {
                                passed = true
                            }

                            passed = checkConditions(situation, passed)

                            tradingSystem.values.push([situation.id, passed])
                            if (passed) {
                                tradingSystem.highlights.push(situation.id)
                                tradingSystem.highlights.push(triggerStage.takePosition.id)
                                tradingSystem.highlights.push(triggerStage.id)

                                tradingStrategyModule.updateStageType('Open Stage')
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

                                logger.write(MODULE_NAME, '[INFO] checkTakePosition -> Conditions at the Take Position Event were met.')
                                return true // This Means that we have just met the conditions to take position.
                            }
                        }
                    }
                }
            }
            return false // This Means that we have not met the conditions to take position.
        }
    }

    function openStage() {

        if (tradingEngine.current.strategy.stageType.value === 'Open Stage') {
            let stageNode = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].openStage
            let executionNode = stageNode.openExecution

            evalConditions(stageNode, 'Initial Definition')
            evalFormulas(stageNode, 'Initial Definition')

            /* Taking a Position */
            if (takingPosition === true) {
                getReadyToTakePosition()

                calculateTakeProfit()
                calculateStopLoss()

                tradingExecutionModule.takePosition()
                takePosition()
            }

            /* Every Loop Cycle Activity */
            evalConditions(stageNode, 'Open Execution')
            evalFormulas(stageNode, 'Open Execution')

            checkExecution(executionNode)

        }

        function getReadyToTakePosition() {
            /* Updating Episode Counters */
            tradingEngine.episode.episodeCounters.positions.value++

            /* Inicializing this counter */
            tradingEngine.current.distanceToEvent.takePosition.value = 1

            /* Position size and rate */
            tradingPositionModule.updateSizeAndRate(getPositionSize(), getPositionRate())

            /* We take what was calculated at the formula of position rate and apply the slippage. */
            tradingPositionModule.applySlippageToRate()

            function getPositionSize() {
                let balance
                if (bot.sessionAndMarketBaseAssetsAreEqual) {
                    balance = tradingEngine.current.balance.baseAsset.value
                } else {
                    balance = tradingEngine.current.balance.quotedAsset.value
                }
                const DEFAULT_VALUE = balance
                let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]

                if (strategy.openStage === undefined) return DEFAULT_VALUE
                if (strategy.openStage.initialDefinition === undefined) return DEFAULT_VALUE
                if (strategy.openStage.initialDefinition.positionSize === undefined) return DEFAULT_VALUE
                if (strategy.openStage.initialDefinition.positionSize.formula === undefined) return DEFAULT_VALUE

                let value = formulas.get(strategy.openStage.initialDefinition.positionSize.formula.id)
                if (value === undefined) return DEFAULT_VALUE
                return value
            }

            function getPositionRate() {
                const DEFAULT_VALUE = tradingEngine.current.candle.close.value
                let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]

                if (strategy.openStage === undefined) return DEFAULT_VALUE
                if (strategy.openStage.initialDefinition === undefined) return DEFAULT_VALUE
                if (strategy.openStage.initialDefinition.positionRate === undefined) return DEFAULT_VALUE
                if (strategy.openStage.initialDefinition.positionRate.formula === undefined) return DEFAULT_VALUE

                let value = formulas.get(strategy.openStage.initialDefinition.positionRate.formula.id)
                if (value === undefined) return DEFAULT_VALUE
                return value
            }
        }

        function takePosition() {
            tradingEngine.previous.balance.baseAsset.value = tradingEngine.current.balance.baseAsset.value
            tradingEngine.previous.balance.quotedAsset.value = tradingEngine.current.balance.quotedAsset.value

            let feePaid = 0

            if (bot.sessionAndMarketBaseAssetsAreEqual) {
                feePaid = tradingEngine.current.position.size.value * tradingEngine.current.position.rate.value * bot.SESSION.parameters.feeStructure.config.taker / 100

                tradingEngine.current.balance.quotedAsset.value = tradingEngine.current.balance.quotedAsset.value + tradingEngine.current.position.size.value * tradingEngine.current.position.rate.value - feePaid
                tradingEngine.current.balance.baseAsset.value = tradingEngine.current.balance.baseAsset.value - tradingEngine.current.position.size.value
            } else {
                feePaid = tradingEngine.current.position.size.value / tradingEngine.current.position.rate.value * bot.SESSION.parameters.feeStructure.config.taker / 100

                tradingEngine.current.balance.baseAsset.value = tradingEngine.current.balance.baseAsset.value + tradingEngine.current.position.size.value / tradingEngine.current.position.rate.value - feePaid
                tradingEngine.current.balance.quotedAsset.value = tradingEngine.current.balance.quotedAsset.value - tradingEngine.current.position.size.value
            }
        }
    }

    function manageStage() {
        if (takingPosition === true) {
            /* We jump the management at the loop cycle where the position is being taken. */
            takingPosition = false
            return
        }

        if (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage') {
            let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
            let manageStage = strategy.manageStage
            evalConditions(manageStage, 'Manage Stage')
            evalFormulas(manageStage, 'Manage Stage')

            /* Stop Loss Management */
            checkStopPhasesEvents()
            calculateStopLoss()

            /* Take Profit Management */
            checkTakeProfitPhaseEvents()
            calculateTakeProfit()

            /* Checking if Stop or Take Profit were hit */
            closingPosition = checkStopLossOrTakeProfitWasHit()
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

                        passed = checkConditions(situation, passed)

                        tradingSystem.values.push([situation.id, passed])
                        if (passed) {
                            tradingSystem.highlights.push(situation.id)
                            tradingSystem.highlights.push(nextPhaseEvent.id)
                            tradingSystem.highlights.push(phase.id)
                            tradingSystem.highlights.push(stopLoss.id)
                            tradingSystem.highlights.push(parentNode.id)
                            tradingSystem.highlights.push(stage.id)

                            tradingPositionModule.updateStopLoss(tradingEngine.current.position.stopLoss.stopLossPhase.value + 1, 'Manage Stage')

                            if (tradingEngine.current.position.takeProfit.takeProfitPhase.value > 0) {
                                tradingStrategyModule.updateStageType('Manage Stage')
                                announcementsModule.makeAnnoucements(manageStage)
                            }
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

                            passed = checkConditions(situation, passed)

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

                                if (tradingEngine.current.position.takeProfit.takeProfitPhase.value > 0) {
                                    tradingStrategyModule.updateStageType('Manage Stage')
                                    announcementsModule.makeAnnoucements(manageStage)
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

                        passed = checkConditions(situation, passed)

                        tradingSystem.values.push([situation.id, passed])
                        if (passed) {
                            tradingSystem.highlights.push(situation.id)
                            tradingSystem.highlights.push(nextPhaseEvent.id)
                            tradingSystem.highlights.push(phase.id)
                            tradingSystem.highlights.push(takeProfit.id)
                            tradingSystem.highlights.push(parentNode.id)
                            tradingSystem.highlights.push(stage.id)

                            tradingPositionModule.updateTakeProfit(tradingEngine.current.position.takeProfit.takeProfitPhase.value + 1, 'Manage Stage')

                            if (tradingEngine.current.position.stopLoss.stopLossPhase.value > 0) {
                                tradingStrategyModule.updateStageType('Manage Stage')
                                announcementsModule.makeAnnoucements(manageStage)
                            }
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

                            passed = checkConditions(situation, passed)

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

                                if (tradingEngine.current.position.stopLoss.stopLossPhase.value > 0) {
                                    tradingStrategyModule.updateStageType('Manage Stage')
                                    announcementsModule.makeAnnoucements(manageStage)
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
                    (bot.sessionAndMarketBaseAssetsAreEqual && tradingEngine.current.candle.max.value >= tradingEngine.current.position.stopLoss.value) ||
                    (!bot.sessionAndMarketBaseAssetsAreEqual && tradingEngine.current.candle.min.value <= tradingEngine.current.position.stopLoss.value)
                ) {
                    logger.write(MODULE_NAME, '[INFO] checkStopLossOrTakeProfitWasHit -> Stop Loss was hit.')

                    tradingPositionModule.preventStopLossDistortion()
                    tradingPositionModule.applySlippageToStopLoss()
                    tradingPositionModule.closePosition('Stop Loss')
                    tradingStrategyModule.updateStageType('Close Stage')
                    announcementsModule.makeAnnoucements(strategy.closeStage)
                    return true // This means that the STOP was hit.
                }

                /* Take Profit condition: Here we verify if the Take Profit was hit or not. */
                if (
                    (bot.sessionAndMarketBaseAssetsAreEqual && tradingEngine.current.candle.min.value <= tradingEngine.current.position.takeProfit.value) ||
                    (!bot.sessionAndMarketBaseAssetsAreEqual && tradingEngine.current.candle.max.value >= tradingEngine.current.position.takeProfit.value)
                ) {
                    logger.write(MODULE_NAME, '[INFO] checkStopLossOrTakeProfitWasHit -> Take Profit was hit.')

                    tradingPositionModule.preventTakeProfitDistortion()
                    tradingPositionModule.applySlippageToTakeProfit()
                    tradingPositionModule.closePosition('Take Profit')
                    tradingStrategyModule.updateStageType('Close Stage')
                    announcementsModule.makeAnnoucements(strategy.closeStage)
                    return true // This means that the Take Profit was hit.
                }
                return false // This means that the neither the STOP nor the Take Profit were hit.
            }
        }
    }

    function closeStage() {

        if (tradingEngine.current.strategy.stageType.value === 'Close Stage') {
            let stageNode = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value].closeStage
            let executionNode = stageNode.closeExecution

            evalConditions(stageNode, 'Close Execution')
            evalFormulas(stageNode, 'Close Execution')

            /* Closing a Position */
            if (closingPosition === true) {
                getReadyToClosePosition()
                tradingExecutionModule.closePosition()
                closePosition()
                closingPosition = false
            }

            checkExecution(executionNode)
        }

        /* After a position was closed, we need to close the strategy. */
        exitStrategyAfterPosition()

        function getReadyToClosePosition() {
            /* Inicializing this counter */
            tradingEngine.current.distanceToEvent.closePosition.value = 1

            /* Position size and rate */
            let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
        }

        function closePosition() {
            /* We calculate the new balances after the position is closed. */
            let feePaid = 0
            if (bot.sessionAndMarketBaseAssetsAreEqual) {
                feePaid = tradingEngine.current.balance.quotedAsset.value / tradingEngine.current.position.endRate.value * bot.SESSION.parameters.feeStructure.config.taker / 100
                tradingEngine.current.balance.baseAsset.value = tradingEngine.current.balance.baseAsset.value + tradingEngine.current.balance.quotedAsset.value / tradingEngine.current.position.endRate.value - feePaid
                tradingEngine.current.balance.quotedAsset.value = 0
            } else {
                feePaid = tradingEngine.current.balance.baseAsset.value * tradingEngine.current.position.endRate.value * bot.SESSION.parameters.feeStructure.config.taker / 100
                tradingEngine.current.balance.quotedAsset.value = tradingEngine.current.balance.quotedAsset.value + tradingEngine.current.balance.baseAsset.value * tradingEngine.current.position.endRate.value - feePaid
                tradingEngine.current.balance.baseAsset.value = 0
            }

            tradingPositionModule.updateStatistics()

            /* Recalculating Episode Counters */
            if (tradingEngine.current.position.positionStatistics.profitLoss.value > 0) {
                tradingEngine.episode.episodeCounters.hits.value++
            } else {
                tradingEngine.episode.episodeCounters.fails.value++
            }

            /* Recalculating Episode Statistics */
            if (bot.sessionAndMarketBaseAssetsAreEqual) {
                tradingEngine.episode.episodeStatistics.profitLoss.value = tradingEngine.current.balance.baseAsset.value - sessionParameters.sessionBaseAsset.config.initialBalance
                tradingEngine.episode.episodeStatistics.ROI.value = (sessionParameters.sessionBaseAsset.config.initialBalance + tradingEngine.episode.episodeStatistics.profitLoss.value) / sessionParameters.sessionBaseAsset.config.initialBalance - 1
                tradingEngine.episode.episodeStatistics.hitRatio.value = tradingEngine.episode.episodeCounters.hits.value / tradingEngine.episode.episodeCounters.positions.value
                tradingEngine.episode.episodeStatistics.anualizedRateOfReturn.value = tradingEngine.episode.episodeStatistics.ROI.value / tradingEngine.episode.episodeStatistics.days.value * 365
            } else {
                tradingEngine.episode.episodeStatistics.profitLoss.value = tradingEngine.current.balance.quotedAsset.value - sessionParameters.sessionQuotedAsset.config.initialBalance
                tradingEngine.episode.episodeStatistics.ROI.value = (sessionParameters.sessionQuotedAsset.config.initialBalance + tradingEngine.episode.episodeStatistics.profitLoss.value) / sessionParameters.sessionQuotedAsset.config.initialBalance - 1
                tradingEngine.episode.episodeStatistics.hitRatio.value = tradingEngine.episode.episodeCounters.hits.value / tradingEngine.episode.episodeCounters.positions.value
                tradingEngine.episode.episodeStatistics.anualizedRateOfReturn.value = tradingEngine.episode.episodeStatistics.ROI.value / tradingEngine.episode.episodeStatistics.days.value * 365
            }
        }

        function exitStrategyAfterPosition() {
            if (tradingEngine.current.strategy.stageType.value !== 'Close Stage') { return }

            tradingStrategyModule.closeStrategy('Position Closed')
            tradingEngine.current.distanceToEvent.triggerOff.value = 1

            if (bot.SESSION.type === 'Backtesting Session') {
                if (sessionParameters.snapshots !== undefined) {
                    if (sessionParameters.snapshots.config.strategy === true) {
                        snapshotsModule.strategyExit()
                    }
                }
            }

            if (bot.SESSION.type === 'Backtesting Session') {
                if (sessionParameters.snapshots !== undefined) {
                    if (sessionParameters.snapshots.config.position === true) {
                        snapshotsModule.positionExit()
                    }
                }
            }
        }
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
                tradingPositionModule.applyStopLossFormula(formulas, phase.formula.id)

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
                tradingPositionModule.applyTakeProfitFormula(formulas, phase.formula.id)

                if (tradingEngine.current.position.takeProfit.value !== previousValue) {
                    announcementsModule.makeAnnoucements(phase)
                }
            }
        }
    }

    function checkExecution(executionNode) {

        checkExecutionAlgorithms(executionNode)

        function checkExecutionAlgorithms(executionNode) {
            for (let i = 0; i < executionNode.executionAlgorithms.length; i++) {
                let executionAlgorithm = executionNode.executionAlgorithms[i]
                checkOrders(executionAlgorithm.marketBuyOrders, executionAlgorithm, executionNode)
                checkOrders(executionAlgorithm.marketSellOrders, executionAlgorithm, executionNode)
                checkOrders(executionAlgorithm.limitBuyOrders, executionAlgorithm, executionNode)
                checkOrders(executionAlgorithm.limitSellOrders, executionAlgorithm, executionNode)
            }
        }

        function checkOrders(orders, executionAlgorithm, executionNode) {
            for (let i = 0; i < orders.length; i++) {
                let tradingSystemOrder = orders[i]

                /* Basic Validations */
                if (tradingSystemOrder.config.positionSizePercentage === undefined) { continue }

                let tradingEngineOrder = tradingEngineModule.getNodeById(tradingSystemOrder.referenceParent.id)

                if (tradingEngineOrder.identifier === undefined) { continue }
                if (tradingEngineOrder.begin === undefined) { continue }
                if (tradingEngineOrder.end === undefined) { continue }
                if (tradingEngineOrder.rate === undefined) { continue }
                if (tradingEngineOrder.size === undefined) { continue }
                if (tradingEngineOrder.status === undefined) { continue }
                if (tradingEngineOrder.algorithmName === undefined) { continue }
                if (tradingEngineOrder.orderCounters === undefined) { continue }
                if (tradingEngineOrder.orderCounters.periods === undefined) { continue }
                if (tradingEngineOrder.orderStatistics.days === undefined) { continue }
                if (tradingEngineOrder.orderStatistics.percentageFilled === undefined) { continue }
                if (tradingEngineOrder.orderStatistics.actualRate === undefined) { continue }
                if (tradingEngineOrder.orderStatistics.feesPaid === undefined) { continue }

                switch (tradingEngineOrder.status.value) {
                    case 'Open': {
                        tradingEngineOrder.end.value = tradingEngine.current.candle.end.value
                        tradingEngineOrder.orderCounters.periods.value++
                        tradingEngineOrder.orderStatistics.days.value = tradingEngineOrder.orderCounters.periods.value * sessionParameters.timeFrame.config.value / global.ONE_DAY_IN_MILISECONDS

                        let mustCancelOrder = checkOrderEvent(tradingSystemOrder.cancelOrderEvent, tradingSystemOrder, executionAlgorithm, executionNode)
                        if (mustCancelOrder === true) {
                            // Cancel Order
                            tradingEngineOrder.status.value = 'Closed'
                            tradingEngineOrder.exitType.value = 'Cancelled'
                            break
                        }

                        let mustMoveOrder = checkOrderEvent(tradingSystemOrder.moveOrderEvent, tradingSystemOrder, executionAlgorithm, executionNode)
                        if (mustMoveOrder === true && tradingEngineOrder.status.value === 'Open') {
                            // Move Order
                            tradingEngineOrder.status.value = 'Open'
                            break
                        }

                        simulateExchangeEvents(tradingSystemOrder, tradingEngineOrder)
                    }
                        break
                    case 'Closed': {
                        // Nothing to do here
                    }
                        break
                    default: {
                        tradingEngineOrder.status.value = 'Not Open'
                        let situationName = checkOrderEvent(tradingSystemOrder.createOrderEvent, tradingSystemOrder, executionAlgorithm, executionNode)
                        if (situationName !== undefined) {
                            // Create Order
                            tradingEngineOrder.identifier.value = global.UNIQUE_ID()
                            tradingEngineOrder.begin.value = tradingEngine.current.candle.begin.value
                            tradingEngineOrder.end.value = tradingEngine.current.candle.end.value
                            tradingEngineOrder.rate.value = tradingEngine.current.position.rate.value
                            tradingEngineOrder.size.value = formulas.get(executionAlgorithm.positionSize.formula.id) * tradingSystemOrder.config.positionSizePercentage / 100
                            tradingEngineOrder.status.value = 'Open'
                            tradingEngineOrder.orderName.value = tradingSystemOrder.name
                            tradingEngineOrder.algorithmName.value = executionAlgorithm.name
                            tradingEngineOrder.situationName.value = situationName
                        }
                    }
                }
            }
        }

        function simulateExchangeEvents(tradingSystemOrder, tradingEngineOrder) {
            switch (bot.SESSION.type) {
                case 'Backtesting Session': {
                    break
                }
                case 'Live Trading Session': {
                    return
                }
                case 'Fordward Testing Session': {
                    return
                }
                case 'Paper Trading Session': {
                    break
                }
            }

            if (tradingSystemOrder.simulatedExchangeEvents === undefined) { return }

            /* Partial Fill Simulation */
            if (tradingSystemOrder.simulatedExchangeEvents.simulatedPartialFill !== undefined) {
                if (tradingSystemOrder.simulatedExchangeEvents.simulatedPartialFill.config.fillProbability !== undefined) {
                    tradingEngineOrder.orderStatistics.percentageFilled.value = tradingEngineOrder.orderStatistics.percentageFilled.value + tradingSystemOrder.simulatedExchangeEvents.simulatedPartialFill.config.fillProbability * 100
                    if (tradingEngineOrder.orderStatistics.percentageFilled.value >= 100) {
                        tradingEngineOrder.orderStatistics.percentageFilled.value = 100
                        tradingEngineOrder.status.value = 'Closed'
                        tradingEngineOrder.exitType.value = 'Filled'
                    }
                }
            }

            /* Actual Rate Simulation */
            if (tradingSystemOrder.simulatedExchangeEvents.simulatedActualRate !== undefined) {
                if (tradingSystemOrder.simulatedExchangeEvents.simulatedActualRate.formula !== undefined) {
                    if (tradingEngineOrder.orderStatistics.actualRate.value === tradingEngineOrder.orderStatistics.actualRate.config.initialValue) {
                        tradingEngineOrder.orderStatistics.actualRate.value = formulas.get(tradingSystemOrder.simulatedExchangeEvents.simulatedActualRate.formula.id)
                    }
                }
            }

            /* Fees Paid Simulation */
            if (tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid !== undefined) {
                if (tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid.config.percentage !== undefined) {
                    if (tradingEngineOrder.orderStatistics.feesPaid.value === tradingEngineOrder.orderStatistics.feesPaid.config.initialValue) {
                        tradingEngineOrder.orderStatistics.feesPaid.value = tradingEngineOrder.size.value * tradingSystemOrder.simulatedExchangeEvents.simulatedFeesPaid.config.percentage / 100
                    }
                }
            }
        }

        function checkOrderEvent(event, order, executionAlgorithm, executionNode) {
            if (event !== undefined) {
                for (let k = 0; k < event.situations.length; k++) {
                    let situation = event.situations[k]
                    let passed
                    if (situation.conditions.length > 0) {
                        passed = true
                    }

                    passed = checkConditions(situation, passed)

                    tradingSystem.values.push([situation.id, passed])
                    if (passed) {
                        tradingSystem.highlights.push(situation.id)
                        tradingSystem.highlights.push(event.id)
                        tradingSystem.highlights.push(order.id)
                        tradingSystem.highlights.push(executionAlgorithm.id)
                        tradingSystem.highlights.push(executionNode.id)

                        announcementsModule.makeAnnoucements(event)
                        return situation.name  // if the event is triggered, we return the name of the situation that passed
                    }
                }
            }
        }
    }

    function isItInside(elementWithTimestamp, elementWithBeginEnd) {
        /* 
        The function is to allow in Conditions and Formulas to easily know when an element with timestamp (like the ones of single files) are inside the time range
        of an element with a time range, like a candle.
        */
        if (elementWithTimestamp.timestamp >= elementWithBeginEnd.begin && elementWithTimestamp.timestamp <= elementWithBeginEnd.end) {
            return true
        } else {
            return false
        }
    }

    function checkConditions(situation, passed) {
        /* Given a Situation, we check if all children conditions are true or not */
        for (let m = 0; m < situation.conditions.length; m++) {

            let condition = situation.conditions[m]
            let value = false
            if (conditions.get(condition.id) !== undefined) {
                value = conditions.get(condition.id)
            }
            if (value === true) {
                tradingSystem.highlights.push(condition.id)
            }
            else {
                passed = false
            }
            tradingSystem.values.push([condition.id, value])
        }
        return passed
    }
}

