exports.newTradingSystem = function newTradingSystem(bot, logger) {

    const MODULE_NAME = 'Trading System'
    const FULL_LOG = true

    let thisObject = {
        reset: reset,
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
        exitStrategyAfterPosition: exitStrategyAfterPosition,
        getPositionSize: getPositionSize,
        getPositionRate: getPositionRate,
        initialize: initialize,
        finalize: finalize
    }

    let chart

    let tradingSystem
    let tradingEngine

    let conditions = new Map()
    let formulas = new Map()

    return thisObject

    function initialize() {
        tradingSystem = bot.simulationState.tradingSystem
        tradingEngine = bot.simulationState.tradingEngine
    }

    function finalize() {
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
            if (node.code !== undefined) {
                /* We will eval this condition */
                evalCondition(node)
            }
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

        try {
            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] evalCondition -> code = ' + node.code) }

            value = eval(node.code)
        } catch (err) {
            /*
                One possible error is that the conditions references a .previous that is undefined. This
                will not be considered an error.
            */
            value = false

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

        conditions.set(node.id, value)

        if (value === true) {
            tradingSystem.highlights.push(node.id)
            tradingSystem.errors.push([node.id, 'La concha del mono'])
            tradingSystem.progress.push([node.id, 85])
            tradingSystem.status.push([node.id, 'Waiting for la concha del mono'])
            tradingSystem.running.push([node.id, true])
        }
        if (error !== undefined) {
            tradingSystem.errors.push([node.id, error])
        }
        if (value !== undefined) {
            tradingSystem.values.push([node.id, value])
        }

        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] evalCondition -> value = ' + value) }
        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] evalCondition -> error = ' + error) }
    }

    function evalFormula(node) {
        let value
        let error

        try {
            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] evalFormula -> code = ' + node.code) }
            value = eval(node.code)
        } catch (err) {
            /*
                One possible error is that the formula references a .previous that is undefined. This
                will not be considered an error.
            */
            value = false

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

        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] evalFormula -> value = ' + value) }
        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] evalFormula -> error = ' + error) }
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

            for (let j = 0; j < tradingSystem.strategies.length; j++) {
                if ( // If a strategy was already picked during the loop, we exit the loop
                    tradingEngine.current.strategy.index.value !== tradingEngine.current.strategy.index.config.initialValue
                ) { continue }

                let strategy = tradingSystem.strategies[j]
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
                                    value = conditions.get(condition.id).value
                                }
                                if (value === false) { passed = false }
                            }

                            tradingSystem.values.push([situation.id, passed])
                            if (passed) {
                                tradingSystem.highlights.push(situation.id)
                                tradingSystem.highlights.push(triggerStage.triggerOn.id)
                                tradingSystem.highlights.push(triggerStage.id)

                                tradingEngine.current.strategy.stageType.value = 'Trigger Stage'
                                tradingEngine.current.strategy.status.value = 'Open'
                                tradingEngine.current.strategy.index.value = j
                                tradingEngine.current.strategy.begin.value = tradingEngine.current.candle.begin.value
                                tradingEngine.current.strategy.end.value = tradingEngine.current.candle.end.value       // TODO: overrride with the node Formula
                                tradingEngine.current.strategy.beginRate.value = tradingEngine.current.candle.min.value
                                tradingEngine.current.strategy.endRate.value = tradingEngine.current.candle.min.value   // TODO: overrride with the node Formula
                                tradingEngine.current.strategy.situationName.value = situation.name
                                tradingEngine.current.strategy.strategyName.value = strategy.name

                                tradingEngine.current.distanceToEvent.triggerOn.value = 1

                                /* TODO See what to do with this:
                                checkAnnouncements(triggerStage.triggerOn)
                                checkAnnouncements(triggerStage)
                                saveAsLastTriggerOnSnapshot = true
                                */

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] checkTriggerOn -> Entering into Strategy: ' + strategy.name) }
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
            let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]
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
                                value = conditions.get(condition.id).value
                            }
                            if (value === false) { passed = false }
                        }

                        tradingSystem.values.push([situation.id, passed])
                        if (passed) {
                            tradingSystem.highlights.push(situation.id)
                            tradingSystem.highlights.push(triggerStage.triggerOff.id)
                            tradingSystem.highlights.push(triggerStage.id)

                            tradingEngine.current.strategy.end.value = tradingEngine.current.candle.end.value
                            tradingEngine.current.strategy.endRate.value = tradingEngine.current.candle.min.value
                            tradingEngine.current.strategy.status.value = 'Closed'
                            tradingEngine.current.strategy.stageType.value = 'No Stage'
                            tradingEngine.current.strategy.index.value = tradingEngine.current.strategy.index.config.initialValue

                            tradingEngine.current.distanceToEvent.triggerOff.value = 1

                            /* TODO See what to do with this:
                            checkAnnouncements(triggerStage.triggerOff)
                            */

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] checkTriggerOff -> Closing Strategy: ' + strategy.name) }
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
            let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]
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
                                value = conditions.get(condition.id).value
                            }

                            if (value === false) { passed = false }
                        }

                        tradingSystem.values.push([situation.id, passed])
                        if (passed) {
                            tradingSystem.highlights.push(situation.id)
                            tradingSystem.highlights.push(triggerStage.takePosition.id)
                            tradingSystem.highlights.push(triggerStage.id)

                            tradingEngine.current.strategy.stageType.value = 'Open Stage'
                            tradingEngine.current.position.stopLossStage.value = 'Open Stage'
                            tradingEngine.current.position.takeProfitStage.value = 'Open Stage'
                            tradingEngine.current.position.stopLossPhase.value = 0
                            tradingEngine.current.position.takeProfitPhase.value = 0

                            tradingEngine.current.position.situationName.value = situation.name

                            /* TODO See what to do with this:
                            checkAnnouncements(triggerStage.takePosition)
                            checkAnnouncements(strategy.openStage)
                            saveAsLastTakePositionSnapshot = true
                            */

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] checkTakePosition -> Conditions at the Take Position Event were met.') }
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
            let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]
            let openStage = strategy.openStage
            let manageStage = strategy.manageStage
            let parentNode
            let p

            if (tradingEngine.current.position.stopLoss.stopLossStage.value === 'Open Stage' && openStage !== undefined) {
                if (openStage.initialDefinition !== undefined) {
                    if (openStage.initialDefinition.stopLoss !== undefined) {
                        parentNode = openStage.initialDefinition
                        p = tradingEngine.current.position.stopLoss.stopLossPhase.value
                    }
                }
            }

            if (tradingEngine.current.position.stopLoss.stopLossStage.value === 'Manage Stage' && manageStage !== undefined) {
                if (manageStage.stopLoss !== undefined) {
                    parentNode = manageStage
                    p = tradingEngine.current.position.stopLoss.stopLossPhase.value - 1
                }
            }

            if (parentNode !== undefined) {
                let phase = parentNode.stopLoss.phases[p]

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
                            tradingSystem.highlights.push(parentNode.stopLoss.id)
                            tradingSystem.highlights.push(parentNode.id)

                            tradingEngine.current.position.stopLoss.stopLossPhase.value++
                            tradingEngine.current.position.stopLoss.stopLossStage.value = 'Manage Stage'
                            if (tradingEngine.current.position.takeProfit.takeProfitPhase.value > 0) {
                                tradingEngine.current.strategy.stageType.value = 'Manage Stage'
                                checkAnnouncements(manageStage, 'Take Profit')
                            }

                            checkAnnouncements(nextPhaseEvent)
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
                                tradingSystem.highlights.push(parentNode.stopLoss.id)
                                tradingSystem.highlights.push(parentNode.id)

                                let moveToPhase = moveToPhaseEvent.referenceParent
                                if (moveToPhase !== undefined) {
                                    for (let q = 0; q < parentNode.stopLoss.phases.length; q++) {
                                        if (parentNode.stopLoss.phases[q].id === moveToPhase.id) {
                                            tradingEngine.current.position.stopLoss.stopLossPhase.value = q + 1
                                        }
                                    }
                                } else {
                                    tradingSystem.errors.push([moveToPhaseEvent.id, 'This Node needs to reference a Phase.'])
                                    continue
                                }

                                tradingEngine.current.position.stopLoss.stopLossStage.value = 'Manage Stage'
                                if (tradingEngine.current.position.takeProfit.takeProfitPhase.value > 0) {
                                    tradingEngine.current.strategy.stageType.value = 'Manage Stage'
                                    checkAnnouncements(manageStage, 'Take Profit')
                                }
                                checkAnnouncements(moveToPhaseEvent)
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
            let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]
            let openStage = strategy.openStage
            let manageStage = strategy.manageStage
            let phase
            let key

            if (tradingEngine.current.position.stopLoss.stopLossStage.value === 'Open Stage' && openStage !== undefined) {
                if (openStage.initialDefinition !== undefined) {
                    if (openStage.initialDefinition.stopLoss !== undefined) {
                        phase = openStage.initialDefinition.stopLoss.phases[tradingEngine.current.position.stopLoss.stopLossPhase.value]
                        key = tradingEngine.current.strategy.index.value + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'stopLoss' + '-' + (tradingEngine.current.position.stopLoss.stopLossPhase.value)
                    }
                }
            }

            if (tradingEngine.current.position.stopLoss.stopLossStage.value === 'Manage Stage' && manageStage !== undefined) {
                if (manageStage.stopLoss !== undefined) {
                    phase = manageStage.stopLoss.phases[tradingEngine.current.position.stopLoss.stopLossPhase.value - 1]
                    key = tradingEngine.current.strategy.index.value + '-' + 'manageStage' + '-' + 'stopLoss' + '-' + (tradingEngine.current.position.stopLoss.stopLossPhase.value - 1)
                }
            }

            if (phase !== undefined) {
                if (phase.formula !== undefined) {
                    let previousValue = tradingEngine.current.position.stopLoss.value
                    tradingEngine.current.position.stopLoss.value = formulas.get(key)

                    if (tradingEngine.current.position.stopLoss.value !== previousValue) {
                        checkAnnouncements(phase, tradingEngine.current.position.stopLoss.value)
                    }
                }
            }
        }
    }

    function checkTakeProfitPhaseEvents() {
        if (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage') {
            let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]
            let openStage = strategy.openStage
            let manageStage = strategy.manageStage
            let parentNode
            let p

            if (tradingEngine.current.position.takeProfit.takeProfitStage.value === 'Open Stage' && openStage !== undefined) {
                if (openStage.initialDefinition !== undefined) {
                    if (openStage.initialDefinition.takeProfit !== undefined) {
                        parentNode = openStage.initialDefinition
                        p = tradingEngine.current.position.takeProfit.takeProfitPhase.value
                    }
                }
            }

            if (tradingEngine.current.position.takeProfit.takeProfitStage.value === 'Manage Stage' && manageStage !== undefined) {
                if (manageStage.takeProfit !== undefined) {
                    parentNode = manageStage
                    p = tradingEngine.current.position.takeProfit.takeProfitPhase.value - 1
                }
            }

            if (parentNode !== undefined) {
                let phase = parentNode.takeProfit.phases[p]
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
                            tradingSystem.highlights.push(parentNode.takeProfit.id)
                            tradingSystem.highlights.push(parentNode.id)

                            tradingEngine.current.position.takeProfit.takeProfitPhase.value++
                            tradingEngine.current.position.takeProfit.takeProfitStage.value = 'Manage Stage'
                            if (tradingEngine.current.position.stopLoss.stopLossPhase.value > 0) {
                                tradingEngine.current.strategy.stageType.value = 'Manage Stage'
                                checkAnnouncements(manageStage, 'Stop')
                            }

                            checkAnnouncements(nextPhaseEvent)
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
                                tradingSystem.highlights.push(parentNode.takeProfit.id)
                                tradingSystem.highlights.push(parentNode.id)

                                let moveToPhase = moveToPhaseEvent.referenceParent
                                if (moveToPhase !== undefined) {
                                    for (let q = 0; q < parentNode.takeProfit.phases.length; q++) {
                                        if (parentNode.takeProfit.phases[q].id === moveToPhase.id) {
                                            tradingEngine.current.position.takeProfit.takeProfitPhase.value = q + 1
                                        }
                                    }
                                } else {
                                    tradingSystem.errors.push([moveToPhaseEvent.id, 'This Node needs to reference a Phase.'])
                                    continue
                                }

                                tradingEngine.current.position.takeProfit.takeProfitStage.value = 'Manage Stage'
                                if (tradingEngine.current.position.stopLoss.stopLossPhase.value > 0) {
                                    tradingEngine.current.strategy.stageType.value = 'Manage Stage'
                                    checkAnnouncements(manageStage, 'Stop')
                                }

                                checkAnnouncements(moveToPhaseEvent)
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
            let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]
            let openStage = strategy.openStage
            let manageStage = strategy.manageStage
            let phase
            let key

            if (tradingEngine.current.position.takeProfit.takeProfitStage.value === 'Open Stage' && openStage !== undefined) {
                if (openStage.initialDefinition !== undefined) {
                    if (openStage.initialDefinition.takeProfit !== undefined) {
                        phase = openStage.initialDefinition.takeProfit.phases[tradingEngine.current.position.takeProfit.takeProfitPhase.value]
                        key = tradingEngine.current.strategy.index.value + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'takeProfit' + '-' + (tradingEngine.current.position.takeProfit.takeProfitPhase.value)
                    }
                }
            }

            if (tradingEngine.current.position.takeProfit.takeProfitStage.value === 'Manage Stage' && manageStage !== undefined) {
                if (manageStage.takeProfit !== undefined) {
                    phase = manageStage.takeProfit.phases[tradingEngine.current.position.takeProfit.takeProfitPhase.value - 1]
                    key = tradingEngine.current.strategy.index.value + '-' + 'manageStage' + '-' + 'takeProfit' + '-' + (tradingEngine.current.position.takeProfit.takeProfitPhase.value - 1)
                }
            }

            if (phase !== undefined) {
                if (phase.formula !== undefined) {
                    let previousValue = tradingEngine.current.position.stopLoss.value
                    tradingEngine.current.position.takeProfit.value = formulas.get(key)

                    if (tradingEngine.current.position.takeProfit.value !== previousValue) {
                        checkAnnouncements(phase, tradingEngine.current.position.takeProfit.value)
                    }
                }
            }
        }
    }

    function checkStopLossOrTakeProfitWasHit() {
        {
            if (tradingEngine.current.strategy.stageType.value === 'Open Stage' || tradingEngine.current.strategy.stageType.value === 'Manage Stage') {
                let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]
                /* 
                Checking what happened since the last execution. We need to know if the Stop Loss
                or our Take Profit were hit. 
                */

                /* Stop Loss condition: Here we verify if the Stop Loss was hitted or not. */
                if (
                    (sessionParameters.sessionBaseAsset.name === bot.market.baseAsset && tradingEngine.current.candle.max.value >= tradingEngine.current.position.stopLoss.value) ||
                    (sessionParameters.sessionBaseAsset.name !== bot.market.baseAsset && tradingEngine.current.candle.min.value <= tradingEngine.current.position.stopLoss.value)
                ) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] checkStopLossOrTakeProfitWasHit -> Stop Loss was hit.') }
                    /*
                    Hit Point Validation
    
                    This prevents misscalculations when a formula places the stop loss in this case way beyond the market price.
                    If we take the stop loss value at those situation would be a huge distortion of facts.
                    */
                    if (sessionParameters.sessionBaseAsset.name === bot.market.baseAsset) {
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

                    if (sessionParameters.sessionBaseAsset.name === bot.market.baseAsset) {
                        slippedStopLoss = slippedStopLoss + slippageAmount
                    } else {
                        slippedStopLoss = slippedStopLoss - slippageAmount
                    }

                    tradingEngine.current.position.endRate.value = slippedStopLoss

                    tradingEngine.current.strategy.stageType.value = 'Close Stage'
                    checkAnnouncements(strategy.closeStage, 'Stop')

                    tradingEngine.current.position.stopLoss.stopLossStage.value = 'No Stage'
                    tradingEngine.current.position.takeProfit.takeProfitStage.value = 'No Stage'
                    tradingEngine.current.position.end.value = tradingEngine.current.candle.end.value
                    tradingEngine.current.position.status.value = 1
                    tradingEngine.current.position.exitType.value = 1

                    return true // This means that the STOP was hit.
                }

                /* Take Profit condition: Here we verify if the Take Profit was hit or not. */
                if (
                    (sessionParameters.sessionBaseAsset.name === bot.market.baseAsset && tradingEngine.current.candle.min.value <= tradingEngine.current.position.takeProfit.value) ||
                    (sessionParameters.sessionBaseAsset.name !== bot.market.baseAsset && tradingEngine.current.candle.max.value >= tradingEngine.current.position.takeProfit.value)
                ) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] checkStopLossOrTakeProfitWasHit -> Take Profit was hit.') }
                    /*
                    Hit Point Validation:
    
                    This prevents misscalculations when a formula places the take profit in this case way beyond the market price.
                    If we take the stop loss value at those situation would be a huge distortion of facts.
                    */
                    if (sessionParameters.sessionBaseAsset.name === bot.market.baseAsset) {
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

                    if (sessionParameters.sessionBaseAsset.name === bot.market.baseAsset) {
                        slippedTakeProfit = slippedTakeProfit + slippageAmount
                    } else {
                        slippedTakeProfit = slippedTakeProfit - slippageAmount
                    }

                    tradingEngine.current.position.endRate.value = slippedTakeProfit

                    tradingEngine.current.strategy.stageType.value = 'Close Stage'
                    checkAnnouncements(strategy.closeStage, 'Take Profit')

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

    function exitStrategyAfterPosition() {
        if (tradingEngine.current.strategy.stageType.value === 'Close Stage') {
            if (candle.begin - 5 * 60 * 1000 > timerToCloseStage) {
                tradingEngine.current.strategy.end.value = candle.end
                tradingEngine.current.strategy.endRate.value = candle.min
                tradingEngine.current.strategy.status.value = 'Closed'

                tradingEngine.current.strategy.index.value = -1
                tradingEngine.current.strategy.stageType.value = 'No Stage'

                timerToCloseStage = 0
                tradingEngine.current.distanceToEvent.triggerOff.value = 1

                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] exitStrategyAfterPosition -> Exiting the Strategy.') }
            } else {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] exitStrategyAfterPosition -> Waiting for timer.') }
            }
        }
    }

    function getPositionSize() {
        let balance
        if (sessionParameters.sessionBaseAsset.name === bot.market.baseAsset) {
            balance = tradingEngine.current.balance.baseAsset.value
        } else {
            balance = tradingEngine.current.balance.quotedAsset.value
        }
        const DEFAULT_VALUE = balance
        let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]

        if (strategy.openStage === undefined) return { DEFAULT_VALUE }
        if (strategy.openStage.initialDefinition === undefined) return { DEFAULT_VALUE }
        if (strategy.openStage.initialDefinition.positionSize === undefined) return { DEFAULT_VALUE }
        if (strategy.openStage.initialDefinition.positionSize.formula === undefined) return { DEFAULT_VALUE }

        let value = formulas.get(strategy.openStage.initialDefinition.positionSize.formula.id)
        if (value === undefined) return { DEFAULT_VALUE }
        return value
    }

    function getPositionRate() {
        const DEFAULT_VALUE = tradingEngine.current.candle.close.value
        let strategy = tradingSystem.strategies[tradingEngine.current.strategy.index.value]

        if (strategy.openStage === undefined) return { DEFAULT_VALUE }
        if (strategy.openStage.initialDefinition === undefined) return { DEFAULT_VALUE }
        if (strategy.openStage.initialDefinition.positionRate === undefined) return { DEFAULT_VALUE }
        if (strategy.openStage.initialDefinition.positionRate.formula === undefined) return { DEFAULT_VALUE }

        let value = formulas.get(strategy.openStage.initialDefinition.positionRate.formula.id)
        if (value === undefined) return { DEFAULT_VALUE }
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

