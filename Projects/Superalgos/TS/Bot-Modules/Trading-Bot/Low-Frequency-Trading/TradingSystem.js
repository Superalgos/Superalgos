exports.newSuperalgosBotModulesTradingSystem = function (processIndex) {
    /*
    The Trading System is the user defined set of rules compliant with the Trading Protocol that
    defines the trading logic to be applied during each cycle of the Simulation.
    */
    const MODULE_NAME = 'Trading System'
    let thisObject = {
        mantain: mantain,
        reset: reset,
        run: run,
        updateChart: updateChart,
        initialize: initialize,
        finalize: finalize
    }

    /* 
    These 3 are the main data structures available to users
    when writing conditions and formulas.
    */
    let chart
    let exchange
    let market

    let tradingSystem
    let tradingEngine
    let sessionParameters
    let dynamicIndicators

    let tradingStagesModuleObject = TS.projects.superalgos.botModules.tradingStages.newSuperalgosBotModulesTradingStages(processIndex)

    let taskParameters = {
        market: TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName +
            '/' +
            TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
    }
    return thisObject

    function initialize() {
        tradingSystem = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        tradingEngine = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        sessionParameters = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters

        tradingSystem.conditions = new Map()
        tradingSystem.formulas = new Map()

        tradingStagesModuleObject.initialize()

        /* Adding Functions used elsewhere to Trading System Definition */
        tradingSystem.checkConditions = function (situation, passed) {
            /* Given a Situation, we check if all children conditions are true or not */
            for (let m = 0; m < situation.conditions.length; m++) {

                let condition = situation.conditions[m]
                let value = false
                if (tradingSystem.conditions.get(condition.id) !== undefined) {
                    value = tradingSystem.conditions.get(condition.id)
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

        tradingSystem.evalConditions = function (startingNode, descendentOfNodeType) {
            evalNode(startingNode, 'Conditions', descendentOfNodeType)
        }

        tradingSystem.evalFormulas = function (startingNode, descendentOfNodeType) {
            evalNode(startingNode, 'Formulas', descendentOfNodeType)
        }

        tradingSystem.addError = function (errorDataArray) {
            /*
            This function adds to the array of error info a rate.
            This rate will later help plotting the error at the
            charts.
            */
            let rate = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
            errorDataArray.push(rate)
            tradingSystem.errors.push(errorDataArray)
        }

        tradingSystem.addWarning = function (warningDataArray) {
            /*
            This function adds to the array of warning info a rate. 
            This rate will later help plotting the warning at the
            charts.
            */
            let rate = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
            warningDataArray.push(rate)
            tradingSystem.warnings.push(warningDataArray)
        }

        tradingSystem.addInfo = function (infoDataArray) {
            /*
            This function adds to the array of warning info a rate. 
            This rate will later help plotting the warning at the
            charts.
            */
            let rate = tradingEngine.tradingCurrent.tradingEpisode.candle.close.value
            infoDataArray.push(rate)
            tradingSystem.infos.push(infoDataArray)
        }

        function isItInside(elementWithTimestamp, elementWithBeginEnd) {
            /* 
            The function is to allow in Conditions and Formulas to easily 
            know when an element with timestamp (like the ones of 
            single files) are inside the time range
            of an element with a time range, like a candle.
            */
            if (elementWithTimestamp.timestamp >= elementWithBeginEnd.begin && elementWithTimestamp.timestamp <= elementWithBeginEnd.end) {
                return true
            } else {
                return false
            }
        }
    }

    function finalize() {
        tradingStagesModuleObject.finalize()
        tradingStagesModuleObject = undefined

        chart = undefined
        exchange = undefined
        market = undefined

        tradingSystem.conditions = undefined
        tradingSystem.formulas = undefined

        tradingSystem.highlights = undefined
        tradingSystem.errors = undefined
        tradingSystem.warnings = undefined
        tradingSystem.infos = undefined
        tradingSystem.values = undefined
        tradingSystem.status = undefined
        tradingSystem.progress = undefined
        tradingSystem.running = undefined

        tradingSystem = undefined
        tradingEngine = undefined
        sessionParameters = undefined
        taskParameters = undefined
    }

    function mantain() {
        tradingStagesModuleObject.mantain()
    }

    function reset() {
        tradingStagesModuleObject.reset()

        tradingSystem.highlights = []
        tradingSystem.errors = []
        tradingSystem.warnings = []
        tradingSystem.infos = []
        tradingSystem.values = []
        tradingSystem.status = []
        tradingSystem.progress = []
        tradingSystem.running = []
        tradingSystem.announcements = []
    }

    function updateChart(pChart, pExchange, pMarket) {
        /* 
        We need these 3 data structures  to be a local objects 
        accessible while evaluating conditions and formulas.
        */
        chart = pChart
        exchange = pExchange
        market = pMarket

        tradingStagesModuleObject.updateChart(pChart, pExchange, pMarket)
    }

    function buildDynamicIndicators() {
        if (tradingSystem.dynamicIndicators !== undefined) {
            dynamicIndicators = {}
            /* Eval Dynamic Indicators */
            tradingSystem.evalFormulas(tradingSystem.dynamicIndicators, 'Indicator Function')

            for (let i = 0; i < tradingSystem.dynamicIndicators.indicatorFunctions.length; i++) {
                let indicatorFunction = tradingSystem.dynamicIndicators.indicatorFunctions[i]
                if (indicatorFunction.formula === undefined) { return }
                if (indicatorFunction.config.codeName === undefined) { return }
                dynamicIndicators[indicatorFunction.config.codeName] = tradingSystem.formulas.get(indicatorFunction.formula.id)
            }
        }
    }

    async function run() {
        try {
            /* Dynamic Indicators */
            buildDynamicIndicators()

            /* Run the Trigger Stage */
            tradingStagesModuleObject.runTriggerStage()

            /* Run the Open Stage */
            await tradingStagesModuleObject.runOpenStage()

            /* Run the Manage Stage */
            tradingStagesModuleObject.runManageStage()

            /* Run the Close Stage */
            await tradingStagesModuleObject.runCloseStage()

            /* Validation if we need to exit the position */
            tradingStagesModuleObject.exitPositionValidation()

            tradingStagesModuleObject.cycleBasedStatistics()

        } catch (err) {
            /* 
            If an error ocurred during execution, it was alreeady logged and
            included at the errors array. That means we need to do nothing here,
            just prevent the execution to be halted for not handling exceptions.
            */
            if (typeof err === 'string' || err instanceof String) {
                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] runExecution -> err = ' + err)
            }
            if (err.stack !== undefined) {
                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] runExecution -> err = ' + err.stack)
            }
        }
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
        if ((node.type === 'Formula' || node.type === 'Announcement Formula') && evaluating === 'Formulas') {
            if (node.code !== undefined) {
                /* We will eval this formula */
                if (isDescendent === true) {
                    evalFormula(node)
                }
            }
        }

        /* Now we go down through all this node children */
        let schemaDocument = TS.projects.superalgos.globals.taskConstants.APP_SCHEMA_MAP.get(node.project + '-' + node.type)
        if (schemaDocument === undefined) { return }

        if (schemaDocument.childrenNodesProperties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

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
        let errorMessage
        let docs
        /*
        The code can be at the condition node if it was done with the Conditions Editor, or it can also be
        at a Javascript Code node. If there is a Javascript object we will give it preference and take the code
        from there. Otherwise we will take the code from the Condition node.
        */
        let code = node.code
        let nodeName = node.name
        if (node.javascriptCode !== undefined) {
            if (node.javascriptCode.code !== undefined) {
                code = node.javascriptCode.code
                nodeName = node.javascriptCode.name
            }
        }

        try {
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalCondition -> ' + node.name + ' -> code = ' + code)
            value = eval(code)
        } catch (err) {
            /*
                One possible error is that the conditions references a .previous that is undefined. This
                will not be considered an error.
            */
            value = false
            errorMessage = err.message
            docs = {
                project: 'Superalgos',
                category: 'Topic',
                type: 'TS LF Trading Bot Error - Evaluating Condition Error',
                placeholder: {}
            }
            TS.projects.superalgos.utilities.docsFunctions.buildPlaceholder(docs, err, nodeName, code, undefined)
        }

        tradingSystem.conditions.set(node.id, value)

        if (value === true) {
            tradingSystem.highlights.push(node.id)
        }
        if (errorMessage !== undefined) {
            tradingSystem.addError([node.id, errorMessage, docs])
        }
        if (value !== undefined) {
            tradingSystem.values.push([node.id, value])
        }

        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalCondition -> value = ' + value)
        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalCondition -> errorMessage = ' + errorMessage)
    }

    function evalFormula(node) {
        let value
        let errorMessage
        let docs

        try {
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalFormula -> ' + node.name + ' -> code = ' + node.code)
            value = eval(node.code)
        } catch (err) {
            /*
                One possible error is that the formula references a .previous that is undefined. This
                will not be considered an error.
            */
            value = 0
            errorMessage = err.message
            docs = {
                project: 'Superalgos',
                category: 'Topic',
                type: 'TS LF Trading Bot Error - Evaluating Formula Error',
                placeholder: {}
            }
            TS.projects.superalgos.utilities.docsFunctions.buildPlaceholder(docs, err, node.name, node.code, undefined)
        }

        if (errorMessage !== undefined) {
            tradingSystem.addError([node.id, errorMessage, docs])
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalFormula -> errorMessage = ' + errorMessage)
            return
        } else {
            if (value !== undefined) {
                if (node.type === 'Formula' && isNaN(value)) {

                    docs = {
                        project: 'Superalgos',
                        category: 'Topic',
                        type: 'TS LF Trading Bot Error - Formula Value Not A Number',
                        placeholder: {}
                    }
                    TS.projects.superalgos.utilities.docsFunctions.buildPlaceholder(docs, undefined, node.name, node.code, undefined, value)

                    tradingSystem.addError([node.id, 'Formula needs to return a numeric value.', docs])
                    return
                }

                tradingSystem.values.push([node.id, value])
                tradingSystem.formulas.set(node.id, value)
            }
        }

        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalFormula -> value = ' + value)
    }
}

