exports.newTradingSystem = function newTradingSystem(bot, logger) {
    /*
    The Trading System is the user defined set of rules compliant with the Trading Protocol that
    defines the trading logic to be applied during each cycle of the Simulation.
    */
    const MODULE_NAME = 'Trading System'
    let thisObject = {
        reset: reset,
        mantainStrategies: mantainStrategies,
        mantainPositions: mantainPositions,
        evalConditions: evalConditions,
        evalFormulas: evalFormulas,
        checkTriggerOn: checkTriggerOn,
        checkTriggerOff: checkTriggerOff,
        checkTakePosition: checkTakePosition,
        checkStopPhasesEvents: checkStopPhasesEvents,
        calculateStopLoss: calculateStopLoss,
        checkTakeProfitPhaseEvents: checkTakeProfitPhaseEvents,
        calculateTakeProfit: calculateTakeProfit,
        checkStopLossOrTakeProfitWasHit: checkStopLossOrTakeProfitWasHit,
        getReadyToTakePosition: getReadyToTakePosition,
        takePosition: takePosition,
        getReadyToClosePosition: getReadyToClosePosition,
        closePosition: closePosition,
        exitStrategyAfterPosition: exitStrategyAfterPosition,
        getPositionSize: getPositionSize,
        getPositionRate: getPositionRate,
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
    let tradingStrategyModule = TRADING_STRATEGY_MODULE.newTradingStrategy(bot, logger)

    return thisObject

    function initialize() {
        tradingSystem = bot.simulationState.tradingSystem
        tradingEngine = bot.simulationState.tradingEngine
        sessionParameters = bot.SESSION.parameters

        tradingStrategyModule.initialize()
    }

    function finalize() {
        tradingStrategyModule.finalize()
        tradingStrategyModule = undefined

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
        chart = pChart // We need chat to be a local object accessible from conditions and formulas.
        tradingSystem.highlights = []
        tradingSystem.errors = []
        tradingSystem.values = []
        tradingSystem.status = []
        tradingSystem.progress = []
        tradingSystem.running = []
    }

    function mantainStrategies() {
        tradingStrategyModule.updateStatus()
        tradingStrategyModule.updateCounters()
        tradingStrategyModule.updateEnds()
    }

    function mantainPositions() {

    }

    function evalConditions() {
        evalNode(bot.simulationState.tradingSystem, 'Conditions')
    }

    function evalFormulas() {
        evalNode(bot.simulationState.tradingSystem, 'Formulas')
    }

    function evalNode(node, evaluating) {
        if (node === undefined) { return }

        /* Here we check if there is a codition to be evaluated */
        if (node.type === 'Condition' && evaluating === 'Conditions') {
            /* We will eval this condition */
            evalCondition(node)
        }

        /* Here we check if there is a formula to be evaluated */
        if (node.type === 'Formula' && evaluating === 'Formulas') {
            if (node.code !== undefined) {
                /* We will eval this condition */
                evalFormula(node)
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
                                evalNode(node[property.name], evaluating)
                            }
                            previousPropertyName = property.name
                        }
                        break
                    }
                    case 'array': {
                        if (node[property.name] !== undefined) {
                            let nodePropertyArray = node[property.name]
                            for (let m = 0; m < nodePropertyArray.length; m++) {
                                evalNode(nodePropertyArray[m], evaluating)
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

                            for (let m = 0; m < situation.conditions.length; m++) {
                                let condition = situation.conditions[m]
                                let value = false
                                if (conditions.get(condition.id) !== undefined) {
                                    value = conditions.get(condition.id)
                                }
                                if (value !== true) { passed = false }
                            }

                            tradingSystem.values.push([situation.id, passed])
                            if (passed) {
                                tradingSystem.highlights.push(situation.id)
                                tradingSystem.highlights.push(triggerStage.triggerOn.id)
                                tradingSystem.highlights.push(triggerStage.id)

                                tradingStrategyModule.openStrategy('Trigger Stage', j, situation.name, strategy.name)

                                tradingEngine.current.distanceToEvent.triggerOn.value = 1

                                /* TODO See what to do with this:
                                checkAnnouncements(triggerStage.triggerOn)
                                checkAnnouncements(triggerStage)
                                saveAsLastTriggerOnSnapshot = true
                                */

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

            if (triggerStage !== undefined) {
                if (triggerStage.triggerOff !== undefined) {
                    for (let k = 0; k < triggerStage.triggerOff.situations.length; k++) {
                        let situation = triggerStage.triggerOff.situations[k]
                        let passed
                        if (situation.conditions.length > 0) {
                            passed = true
                        }

                        for (let m = 0; m < situation.conditions.length; m++) {
                            let condition = situation.conditions[m]
                            let value = false
                            if (conditions.get(condition.id) !== undefined) {
                                value = conditions.get(condition.id)
                            }
                            if (value !== true) { passed = false }
                        }

                        tradingSystem.values.push([situation.id, passed])
                        if (passed) {
                            tradingSystem.highlights.push(situation.id)
                            tradingSystem.highlights.push(triggerStage.triggerOff.id)
                            tradingSystem.highlights.push(triggerStage.id)

                            tradingStrategyModule.closeStrategy()

                            tradingEngine.current.distanceToEvent.triggerOff.value = 1

                            /* TODO See what to do with this:
                            checkAnnouncements(triggerStage.triggerOff)
                            */

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
        if (tradingEngine.current.strategy.stageType.value === 'Trigger Stage') {
            let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
            let triggerStage = strategy.triggerStage

            if (triggerStage !== undefined) {
                if (triggerStage.takePosition !== undefined) {
                    for (let k = 0; k < triggerStage.takePosition.situations.length; k++) {
                        let situation = triggerStage.takePosition.situations[k]
                        let passed
                        if (situation.conditions.length > 0) {
                            passed = true
                        }

                        for (let m = 0; m < situation.conditions.length; m++) {
                            let condition = situation.conditions[m]
                            let value = false
                            if (conditions.get(condition.id) !== undefined) {
                                value = conditions.get(condition.id)
                            }

                            if (value !== true) { passed = false }
                        }

                        tradingSystem.values.push([situation.id, passed])
                        if (passed) {
                            tradingSystem.highlights.push(situation.id)
                            tradingSystem.highlights.push(triggerStage.takePosition.id)
                            tradingSystem.highlights.push(triggerStage.id)

                            tradingStrategyModule.updateStageType('Open Stage')

                            tradingEngine.current.position.stopLoss.stopLossStage.value = 'Open Stage'
                            tradingEngine.current.position.takeProfit.takeProfitStage.value = 'Open Stage'
                            tradingEngine.current.position.stopLoss.stopLossPhase.value = 0
                            tradingEngine.current.position.takeProfit.takeProfitPhase.value = 0
                            tradingEngine.current.position.situationName.value = situation.name

                            /* TODO See what to do with this:
                            checkAnnouncements(triggerStage.takePosition)
                            checkAnnouncements(strategy.openStage)
                            saveAsLastTakePositionSnapshot = true
                            */

                            logger.write(MODULE_NAME, '[INFO] checkTakePosition -> Conditions at the Take Position Event were met.')
                            return true // This Means that we have just met the conditions to take position.
                        }
                    }
                }
            }
        }
        return false // This Means that we have not met the conditions to take position.
    }

    function checkStopPhasesEvents() {
        if (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage') {
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

                        for (let m = 0; m < situation.conditions.length; m++) {
                            let condition = situation.conditions[m]
                            let value = false
                            if (conditions.get(condition.id) !== undefined) {
                                value = conditions.get(condition.id).value
                            }
                            if (value === false) { passed = false }
                        }

                        tradingSystem.values.push([situation.id, passed])
                        if (passed) {
                            tradingSystem.highlights.push(situation.id)
                            tradingSystem.highlights.push(nextPhaseEvent.id)
                            tradingSystem.highlights.push(phase.id)
                            tradingSystem.highlights.push(stopLoss.id)
                            tradingSystem.highlights.push(parentNode.id)
                            tradingSystem.highlights.push(stage.id)

                            tradingEngine.current.position.stopLoss.stopLossPhase.value++
                            tradingEngine.current.position.stopLoss.stopLossStage.value = 'Manage Stage'
                            if (tradingEngine.current.position.takeProfit.takeProfitPhase.value > 0) {
                                tradingStrategyModule.updateStageType('Manage Stage')
                                /* TODO ANNOUNCEMENT
                                checkAnnouncements(manageStage, 'Take Profit')
                                */
                            }

                            /* TODO ANNOUNCEMENT
                            checkAnnouncements(nextPhaseEvent)
                            */
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

                            for (let m = 0; m < situation.conditions.length; m++) {

                                let condition = situation.conditions[m]
                                let value = false
                                if (conditions.get(condition.id) !== undefined) {
                                    value = conditions.get(condition.id).value
                                }
                                if (value === false) { passed = false }
                            }

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
                                            tradingEngine.current.position.stopLoss.stopLossPhase.value = q + 1
                                        }
                                    }
                                } else {
                                    tradingSystem.errors.push([moveToPhaseEvent.id, 'This Node needs to reference a Phase.'])
                                    continue
                                }

                                tradingEngine.current.position.stopLoss.stopLossStage.value = 'Manage Stage'
                                if (tradingEngine.current.position.takeProfit.takeProfitPhase.value > 0) {
                                    tradingStrategyModule.updateStageType('Manage Stage')
                                    /* TODO ANNOUNCEMENT
                                    checkAnnouncements(manageStage, 'Take Profit')
                                    */
                                }
                                /*
                                checkAnnouncements(moveToPhaseEvent)
                                */
                                return // only one event can pass at the time
                            }
                        }
                    }
                }
            }
        }
    }

    function calculateStopLoss() {
        if (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage') {
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
                    tradingEngine.current.position.stopLoss.value = formulas.get(phase.formula.id)

                    /* TODO ANNOUNCEMENTS
                    if (tradingEngine.current.position.stopLoss.value !== previousValue) {
                        checkAnnouncements(phase, tradingEngine.current.position.stopLoss.value)
                    }
                    */
                }
            }
        }
    }

    function checkTakeProfitPhaseEvents() {
        if (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage') {
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

                        for (let m = 0; m < situation.conditions.length; m++) {
                            let condition = situation.conditions[m]
                            let value = false
                            if (conditions.get(condition.id) !== undefined) {
                                value = conditions.get(condition.id).value
                            }
                            if (value === false) { passed = false }
                        }

                        tradingSystem.values.push([situation.id, passed])
                        if (passed) {
                            tradingSystem.highlights.push(situation.id)
                            tradingSystem.highlights.push(nextPhaseEvent.id)
                            tradingSystem.highlights.push(phase.id)
                            tradingSystem.highlights.push(takeProfit.id)
                            tradingSystem.highlights.push(parentNode.id)
                            tradingSystem.highlights.push(stage.id)

                            tradingEngine.current.position.takeProfit.takeProfitPhase.value++
                            tradingEngine.current.position.takeProfit.takeProfitStage.value = 'Manage Stage'
                            if (tradingEngine.current.position.stopLoss.stopLossPhase.value > 0) {
                                tradingStrategyModule.updateStageType('Manage Stage')
                                /* TODO ANNOUNCEMENT
                                checkAnnouncements(manageStage, 'Stop')
                                */
                            }
                            /* TODO ANNOUNCEMENT
                            checkAnnouncements(nextPhaseEvent)
                            */
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

                            for (let m = 0; m < situation.conditions.length; m++) {

                                let condition = situation.conditions[m]
                                let value = false
                                if (conditions.get(condition.id) !== undefined) {
                                    value = conditions.get(condition.id).value
                                }
                                if (value === false) { passed = false }
                            }

                            tradingSystem.values.push([situation.id, passed])
                            if (passed) {
                                tradingSystem.highlights.push(situation.id)
                                tradingSystem.highlights.push(nextPhaseEvent.id)
                                tradingSystem.highlights.push(phase.id)
                                tradingSystem.highlights.push(takeProfit.id)
                                tradingSystem.highlights.push(parentNode.id)
                                tradingSystem.highlights.push(stage.id)

                                let moveToPhase = moveToPhaseEvent.referenceParent
                                if (moveToPhase !== undefined) {
                                    for (let q = 0; q < takeProfit.phases.length; q++) {
                                        if (takeProfit.phases[q].id === moveToPhase.id) {
                                            tradingEngine.current.position.takeProfit.takeProfitPhase.value = q + 1
                                        }
                                    }
                                } else {
                                    tradingSystem.errors.push([moveToPhaseEvent.id, 'This Node needs to reference a Phase.'])
                                    continue
                                }

                                tradingEngine.current.position.takeProfit.takeProfitStage.value = 'Manage Stage'
                                if (tradingEngine.current.position.stopLoss.stopLossPhase.value > 0) {
                                    tradingStrategyModule.updateStageType('Manage Stage')
                                    /* TODO ANNOUNCEMENT
                                    checkAnnouncements(manageStage, 'Stop')
                                    */
                                }
                                /* TODO ANNOUNCEMENT
                                checkAnnouncements(moveToPhaseEvent)
                                */
                                return // only one event can pass at the time
                            }
                        }
                    }
                }
            }
        }
    }

    function calculateTakeProfit() {
        if (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage') {
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
                    let previousValue = tradingEngine.current.position.stopLoss.value
                    tradingEngine.current.position.takeProfit.value = formulas.get(phase.formula.id)

                    /* TODO ANNOUNCEMENTS 
                    if (tradingEngine.current.position.takeProfit.value !== previousValue) {
                        checkAnnouncements(phase, tradingEngine.current.position.takeProfit.value)
                    }
                    */
                }
            }
        }
    }

    function checkStopLossOrTakeProfitWasHit() {
        {
            if (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage') {
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
                    /*
                    Hit Point Validation
    
                    This prevents misscalculations when a formula places the stop loss in this case way beyond the market price.
                    If we take the stop loss value at those situation would be a huge distortion of facts.
                    */
                    if (bot.sessionAndMarketBaseAssetsAreEqual) {
                        if (tradingEngine.current.position.stopLoss.value < tradingEngine.current.candle.min.value) {
                            tradingEngine.current.position.stopLoss.value = tradingEngine.current.candle.min.value
                        }
                    } else {
                        if (tradingEngine.current.position.stopLoss.value > tradingEngine.current.candle.max.value) {
                            tradingEngine.current.position.stopLoss.value = tradingEngine.current.candle.max.value
                        }
                    }

                    let slippedStopLoss = tradingEngine.current.position.stopLoss.value

                    /* Apply the Slippage */
                    let slippageAmount = slippedStopLoss * bot.SESSION.parameters.slippage.config.stopLoss / 100

                    if (bot.sessionAndMarketBaseAssetsAreEqual) {
                        slippedStopLoss = slippedStopLoss + slippageAmount
                    } else {
                        slippedStopLoss = slippedStopLoss - slippageAmount
                    }

                    tradingEngine.current.position.endRate.value = slippedStopLoss

                    tradingStrategyModule.updateStageType('Close Stage')
                    /* TODO ANNOUNCEMENT
                    checkAnnouncements(strategy.closeStage, 'Stop')
                    */
                    tradingEngine.current.position.stopLoss.stopLossStage.value = 'No Stage'
                    tradingEngine.current.position.takeProfit.takeProfitStage.value = 'No Stage'
                    tradingEngine.current.position.end.value = tradingEngine.current.candle.end.value
                    tradingEngine.current.position.status.value = 1
                    tradingEngine.current.position.exitType.value = 1

                    return true // This means that the STOP was hit.
                }

                /* Take Profit condition: Here we verify if the Take Profit was hit or not. */
                if (
                    (bot.sessionAndMarketBaseAssetsAreEqual && tradingEngine.current.candle.min.value <= tradingEngine.current.position.takeProfit.value) ||
                    (!bot.sessionAndMarketBaseAssetsAreEqual && tradingEngine.current.candle.max.value >= tradingEngine.current.position.takeProfit.value)
                ) {
                    logger.write(MODULE_NAME, '[INFO] checkStopLossOrTakeProfitWasHit -> Take Profit was hit.')
                    /*
                    Hit Point Validation:
    
                    This prevents misscalculations when a formula places the take profit in this case way beyond the market price.
                    If we take the stop loss value at those situation would be a huge distortion of facts.
                    */
                    if (bot.sessionAndMarketBaseAssetsAreEqual) {
                        if (tradingEngine.current.position.takeProfit.value > tradingEngine.current.candle.max.value) {
                            tradingEngine.current.position.takeProfit.value = tradingEngine.current.candle.max.value
                        }
                    } else {
                        if (tradingEngine.current.position.takeProfit.value < tradingEngine.current.candle.min.value) {
                            tradingEngine.current.position.takeProfit.value = tradingEngine.current.candle.min.value
                        }
                    }

                    let slippedTakeProfit = tradingEngine.current.position.takeProfit.value
                    /* Apply the Slippage */
                    let slippageAmount = slippedTakeProfit * bot.SESSION.parameters.slippage.config.takeProfit / 100

                    if (bot.sessionAndMarketBaseAssetsAreEqual) {
                        slippedTakeProfit = slippedTakeProfit + slippageAmount
                    } else {
                        slippedTakeProfit = slippedTakeProfit - slippageAmount
                    }

                    tradingEngine.current.position.endRate.value = slippedTakeProfit

                    tradingStrategyModule.updateStageType('Close Stage')
                    /* TODO ANNOUNCEMENT
                    checkAnnouncements(strategy.closeStage, 'Take Profit')
                    */
                    tradingEngine.current.position.stopLoss.stopLossStage.value = 'No Stage'
                    tradingEngine.current.position.takeProfit.takeProfitStage.value = 'No Stage'

                    tradingEngine.current.position.end.value = tradingEngine.current.candle.end.value
                    tradingEngine.current.position.status.value = 1
                    tradingEngine.current.position.exitType.value = 2

                    addToSnapshots = true
                    return true // This means that the Take Profit was hit.
                }
            }
            return false // This means that the neither the STOP nor the Take Profit were hit.
        }
    }

    function getReadyToTakePosition() {
        /* Inicializing this counter */
        tradingEngine.current.distanceToEvent.takePosition.value = 1

        /* Position size and rate */
        tradingEngine.current.position.size.value = getPositionSize()
        tradingEngine.current.position.rate.value = getPositionRate()

        /* We take what was calculated at the formula and apply the slippage. */
        let slippageAmount = tradingEngine.current.position.rate.value * bot.SESSION.parameters.slippage.config.positionRate / 100

        if (bot.sessionAndMarketBaseAssetsAreEqual) {
            tradingEngine.current.position.rate.value = tradingEngine.current.position.rate.value - slippageAmount
        } else {
            tradingEngine.current.position.rate.value = tradingEngine.current.position.rate.value + slippageAmount
        }

        /* Update the position information. */
        tradingEngine.current.position.begin.value = tradingEngine.current.candle.begin.value
        tradingEngine.current.position.beginRate.value = tradingEngine.current.position.rate.value
    }

    function takePosition() {
        calculateTakeProfit() // TODO: Check if this is really necesary
        calculateStopLoss() // TODO: Check if this is really necesary

        tradingEngine.previous.balance.baseAsset.value = tradingEngine.current.balance.baseAsset.value
        tradingEngine.previous.balance.quotedAsset.value = tradingEngine.current.balance.quotedAsset.value

        tradingEngine.last.position.positionStatistics.profitLoss.value = 0
        tradingEngine.last.position.positionStatistics.ROI.value = 0

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

    function getReadyToClosePosition() {
        /* Inicializing this counter */
        tradingEngine.current.distanceToEvent.closePosition.value = 1

        /* Position size and rate */
        let strategy = tradingSystem.tradingStrategies[tradingEngine.current.strategy.index.value]
    }

    function closePosition() {
        tradingEngine.episode.episodeCounters.positions.value++

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

        if (bot.sessionAndMarketBaseAssetsAreEqual) {
            tradingEngine.last.position.positionStatistics.profitLoss.value = tradingEngine.current.balance.baseAsset.value - tradingEngine.previous.balance.baseAsset.value
            tradingEngine.last.position.positionStatistics.ROI.value = tradingEngine.last.position.positionStatistics.profitLoss.value * 100 / tradingEngine.current.position.size.value
            if (isNaN(tradingEngine.last.position.positionStatistics.ROI.value)) { tradingEngine.last.position.positionStatistics.ROI.value = 0 }
            tradingEngine.episode.episodeStatistics.profitLoss.value = tradingEngine.current.balance.baseAsset.value - sessionParameters.sessionBaseAsset.config.initialBalance
        } else {
            tradingEngine.last.position.positionStatistics.profitLoss.value = tradingEngine.current.balance.quotedAsset.value - tradingEngine.previous.balance.quotedAsset.value
            tradingEngine.last.position.positionStatistics.ROI.value = tradingEngine.last.position.positionStatistics.profitLoss.value * 100 / tradingEngine.current.position.size.value
            if (isNaN(tradingEngine.last.position.positionStatistics.ROI.value)) { tradingEngine.last.position.positionStatistics.ROI.value = 0 }
            tradingEngine.episode.episodeStatistics.profitLoss.value = tradingEngine.current.balance.quotedAsset.value - sessionParameters.sessionQuotedAsset.config.initialBalance
        }

        tradingEngine.current.position.positionStatistics.ROI.value = tradingEngine.last.position.positionStatistics.ROI.value

        if (tradingEngine.last.position.positionStatistics.profitLoss.value > 0) {
            tradingEngine.episode.episodeCounters.hits.value++
        } else {
            tradingEngine.episode.episodeCounters.fails.value++
        }

        if (bot.sessionAndMarketBaseAssetsAreEqual) {
            tradingEngine.episode.episodeStatistics.ROI.value = (sessionParameters.sessionBaseAsset.config.initialBalance + tradingEngine.episode.episodeStatistics.profitLoss.value) / sessionParameters.sessionBaseAsset.config.initialBalance - 1
            tradingEngine.episode.episodeStatistics.hitRatio.value = tradingEngine.episode.episodeCounters.hits.value / tradingEngine.episode.episodeCounters.positions.value
            tradingEngine.episode.episodeStatistics.anualizedRateOfReturn.value = tradingEngine.episode.episodeStatistics.ROI.value / tradingEngine.episode.episodeStatistics.days.value * 365
        } else {
            tradingEngine.episode.episodeStatistics.ROI.value = (sessionParameters.sessionQuotedAsset.config.initialBalance + tradingEngine.episode.episodeStatistics.profitLoss.value) / sessionParameters.sessionQuotedAsset.config.initialBalance - 1
            tradingEngine.episode.episodeStatistics.hitRatio.value = tradingEngine.episode.episodeCounters.hits.value / tradingEngine.episode.episodeCounters.positions.value
            tradingEngine.episode.episodeStatistics.anualizedRateOfReturn.value = tradingEngine.episode.episodeStatistics.ROI.value / tradingEngine.episode.episodeStatistics.days.value * 365
        }

        tradingEngine.current.position.stopLoss.value = 0
        tradingEngine.current.position.takeProfit.value = 0

        tradingEngine.current.position.rate.value = 0
        tradingEngine.current.position.size.value = 0

        tradingEngine.current.position.stopLoss.stopLossStage.value = 'No Stage'
        tradingEngine.current.position.takeProfit.takeProfitStage.value = 'No Stage'
        tradingEngine.current.position.stopLoss.stopLossPhase.value = -1
        tradingEngine.current.position.takeProfit.takeProfitPhase.value = -1

    }

    function exitStrategyAfterPosition() {
        if (tradingEngine.current.strategy.stageType.value === 'Close Stage') {
            tradingStrategyModule.closeStrategy()
            tradingEngine.current.distanceToEvent.triggerOff.value = 1
        }
    }

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
}

