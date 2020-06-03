exports.newTradingSystem = function newTradingSystem(bot, logger) {

    const MODULE_NAME = 'Trading System'
    const FULL_LOG = true

    let thisObject = {
        evalConditions: evalConditions,
        evalFormulas: evalFormulas,
        initialize: initialize,
        finalize: finalize
    }

    let chart

    let conditions = new Map()
    let conditionsValues = []
    let conditionsErrors = []

    let formulas = new Map()
    let formulasValues = []
    let formulasErrors = []

    return thisObject

    function initialize(pChart) {
        chart = pChart
    }

    function finalize() {
        chart = undefined

        conditions = undefined
        conditionsValues = undefined
        conditionsErrors = undefined

        formulas = undefined
        formulasValues = undefined
        formulasErrors = undefined
    }

    function evalConditions() {
        evalNode(bot.TRADING_SYSTEM, 'Conditions')
    }

    function evalFormulas() {
        evalNode(bot.TRADING_SYSTEM, 'Formulas')
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
                                evalNode(node[property.name])
                            }
                            previousPropertyName = property.name
                        }
                        break
                    }
                    case 'array': {
                        if (node[property.name] !== undefined) {
                            let nodePropertyArray = node[property.name]
                            object[property.name] = []
                            for (let m = 0; m < nodePropertyArray.length; m++) {
                                evalNode(nodePropertyArray[m])
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
                node.error = error
            }
        }

        conditions.set(node.id, value)

        if (value === true) {
            conditionsValues.push(1)
        } else {
            conditionsValues.push(0)
        }

        formulasErrors.push(error)

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
                node.error = error
            }
        }

        formulas.set(node.id, value)

        if (value === true) {
            formulaValues.push(1)
        } else {
            formulaValues.push(0)
        }

        formulasErrors.push(error)

        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] evalFormula -> value = ' + value) }
        if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] evalFormula -> error = ' + error) }
    }
}

