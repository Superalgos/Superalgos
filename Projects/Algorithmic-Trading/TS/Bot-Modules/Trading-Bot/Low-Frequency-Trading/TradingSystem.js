exports.newAlgorithmicTradingBotModulesTradingSystem = function (processIndex) {
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

    let tradingStagesModuleObject = TS.projects.algorithmicTrading.botModules.tradingStages.newAlgorithmicTradingBotModulesTradingStages(processIndex)
    let portfolioManagerClient = TS.projects.portfolioManagement.modules.portfolioManagerClient.newPortfolioManagementModulesPortfolioManagerClient(processIndex)

    let taskParameters = {
        market: TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName +
            '/' +
            TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
    }
    return thisObject

    function initialize() {
        tradingSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        tradingEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters

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

        tradingSystem.evalConditions = function (startingNode, descendentOfNodeType, signal) {
            evalNode(
                startingNode,
                'Conditions',
                descendentOfNodeType,
                undefined,
                undefined,
                signal
            )
        }

        tradingSystem.evalFormulas = async function (startingNode, descendentOfNodeType) {
            await evalNode(
                startingNode,
                'Formulas',
                descendentOfNodeType
            )
        }

        tradingSystem.evalUserCode = function (startingNode, descendentOfNodeType) {
            evalNode(
                startingNode,
                'User Codes',
                descendentOfNodeType
            )
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
            await tradingStagesModuleObject.runTriggerStage()

            /* Run the Open Stage */
            await tradingStagesModuleObject.runOpenStage()

            /* Run the Manage Stage */
            await tradingStagesModuleObject.runManageStage()

            /* Run the Close Stage */
            await tradingStagesModuleObject.runCloseStage()

            /* Validation if we need to exit the position */
            tradingStagesModuleObject.exitPositionValidation()

            tradingStagesModuleObject.cycleBasedStatistics()

        } catch (err) {
            /*
            If an error occurred during execution, it was already logged and
            included at the errors array. That means we need to do nothing here,
            just prevent the execution to be halted for not handling exceptions.
            */
            if (typeof err === 'string' || err instanceof String) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] runExecution -> err = ' + err)
            }
            if (err !== undefined && err.stack !== undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] runExecution -> err = ' + err.stack)
            }
        }
    }

    async function evalNode(
        node,
        evaluating,
        descendentOfNodeType,
        isDescendent,
        parentNode,
        signal
    ) {
        if (node === undefined) { return }

        /* Verify if this node is descendent of the specified node type */
        if (isDescendent !== true) {
            if (node.type === descendentOfNodeType) {
                isDescendent = true
            }
        }

        /* Here we check if there is a condition to be evaluated */
        if (node.type === 'Condition' && evaluating === 'Conditions') {
            /* We will eval this condition */
            if (isDescendent === true) {
                evalCondition(node, signal)
            }
        }

        /* Here we check if there is a formula to be evaluated */
        if ((node.type === 'Formula' || node.type === 'Announcement Formula') && evaluating === 'Formulas') {
            if (node.code !== undefined) {
                /* We will eval this formula */
                if (isDescendent === true) {
                    await evalFormula(node, parentNode)
                }
            }
        }

        /* Here we check if there is a User Defined-Javascript Code to be evaluated: */
        if (node.type === 'Javascript Code' && evaluating === 'User Codes') {
            if (node.code !== undefined) {
                if (isDescendent === true) {
                    evalJSCode(node);
                }
            }
        }

        /* Now we go down through all this node children */
        let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(node.project + '-' + node.type)
        if (schemaDocument === undefined) { return }

        if (schemaDocument.childrenNodesProperties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoid counting each property of those as individual children.
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        if (property.name !== previousPropertyName) {
                            if (node[property.name] !== undefined) {
                                await evalNode(
                                    node[property.name],
                                    evaluating,
                                    descendentOfNodeType,
                                    isDescendent,
                                    node,
                                    signal
                                )
                            }
                            previousPropertyName = property.name
                        }
                        break
                    }
                    case 'array': {
                        if (node[property.name] !== undefined) {
                            let nodePropertyArray = node[property.name]
                            for (let m = 0; m < nodePropertyArray.length; m++) {
                                await evalNode(
                                    nodePropertyArray[m],
                                    evaluating,
                                    descendentOfNodeType,
                                    isDescendent,
                                    node,
                                    signal
                                )
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function evalCondition(node, signal) {
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
        /*
        Note that the signal object is part of the objects available to the users at
        their conditions code.
        */
        try {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalCondition -> ' + node.name + ' -> code = ' + code)
            value = eval(code)
        } catch (err) {
            /*
                One possible error is that the conditions references a .previous that is undefined. This
                will not be considered an error.
            */
            value = false
            errorMessage = err.message
            docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Error - Evaluating Condition Error',
                placeholder: {}
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, nodeName, code, undefined)
        }

        tradingSystem.conditions.set(node.id, value)

        if (value === true) {
            tradingSystem.highlights.push(node.id)
        }
        if (errorMessage !== undefined) {
            tradingSystem.addError([node.id, errorMessage, docs])
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] evalCondition -> errorMessage = ' + errorMessage)
        }
        if (value !== undefined) {
            tradingSystem.values.push([node.id, value])
        }

        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalCondition -> value = ' + value)
    }

    async function evalFormula(node, parentNode) {
        let value
        let errorMessage
        let docs

        try {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalFormula -> ' + node.name + ' -> code = ' + node.code)
            value = eval(node.code)

            let response = await portfolioManagerClient.askPortfolioFormulaManager(parentNode, value)
            value = response.value

        } catch (err) {
            /*
                One possible error is that the formula references a .previous that is undefined. This
                will not be considered an error.
            */
            value = 0
            errorMessage = err.message
            docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Error - Evaluating Formula Error',
                placeholder: {}
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, node.name, node.code, undefined)
        }

        if (errorMessage !== undefined) {
            tradingSystem.addError([node.id, errorMessage, docs])
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalFormula -> errorMessage = ' + errorMessage)
            return
        } else {
            if (value !== undefined) {
                if (node.type === 'Formula' && isNaN(value)) {

                    docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Trading Bot Error - Formula Value Not A Number',
                        placeholder: {}
                    }
                    TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, node.name, node.code, undefined, value)

                    tradingSystem.addError([node.id, 'Formula needs to return a numeric value.', docs])
                    return
                }

                tradingSystem.values.push([node.id, value])
                tradingSystem.formulas.set(node.id, value)
            } else {

                docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Trading Bot Error - Formula Value Not A Number',
                    placeholder: {}
                }
                TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, node.name, node.code, undefined, value)

                tradingSystem.addError([node.id, 'Formula needs to return a numeric value.', docs])
                return

            }
        }

        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalFormula -> value = ' + value)
    }

    function evalJSCode(node) {
        let value
        let errorMessage
        let docs

        try {
            value = eval(node.code);

        } catch (err) {
            value = 0
            errorMessage = err.message
            docs = {
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Error - Evaluating User Code Error',
                placeholder: {}
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, node.name, node.code, undefined)
        }

        if (errorMessage !== undefined) {
            tradingSystem.addError([node.id, errorMessage, docs])
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalFormula -> errorMessage = ' + errorMessage)
            return
        }
    }
}