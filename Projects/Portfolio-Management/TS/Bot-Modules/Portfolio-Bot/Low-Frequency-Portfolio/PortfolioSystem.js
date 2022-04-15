exports.newPortfolioManagementBotModulesPortfolioSystem = function (processIndex) {
    /*
    The Portfolio System is the user defined set of rules compliant with the Portfolio Protocol that
    defines the portfolio logic to be applied during each cycle of the Simulation.
    */
    const MODULE_NAME = 'Portfolio System'
    let thisObject = {
        confirmThisEvent: confirmThisEvent,
        setThisEvent: setThisEvent,
        confirmThisFormula: confirmThisFormula,
        setThisFormula: setThisFormula,
        maintain: maintain,
        reset: reset,
        run: run,
        updateChart: updateChart,
        initialize: initialize,
        finalize: finalize,
        runUserDefinedCode: runUserDefinedCode
    }

    /*
    These 3 are the main data structures available to users
    when writing conditions and formulas.
    */
    let chart
    let exchange
    let market

    let portfolioSystem
    let portfolioEngine
    let sessionParameters           // Session Parameters of the Portfolio Bot
    let managedSessionParameters    // Session Parameters of the Trading Bots that are being managed.

    let portfolioEventsManagerModuleObject
    let portfolioFormulasManagerModuleObject

    /*let taskParameters = {
        market: TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName +
            '/' +
            TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
    }*/
    return thisObject

    function initialize() {
        portfolioSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioSystem
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters

        /* Setup Managed Session Parameters */
        managedSessionParameters = []
        for (let i = 0; i < TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES.length; i++) {
            let sessionReference = TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES[i]
            if (sessionReference.referenceParent === undefined) { continue }
            if (sessionReference.referenceParent.tradingParameters === undefined) { continue }
            managedSessionParameters.push(sessionReference.referenceParent.tradingParameters)
        }

        portfolioSystem.conditions = new Map()
        portfolioSystem.formulas = new Map()

        portfolioEventsManagerModuleObject = TS.projects.portfolioManagement.botModules.portfolioEventsManager.newPortfolioManagementBotModulesPortfolioEventsManager(processIndex)
        portfolioEventsManagerModuleObject.initialize()

        portfolioFormulasManagerModuleObject = TS.projects.portfolioManagement.botModules.portfolioFormulasManager.newPortfolioManagementBotModulesPortfolioFormulasManager(processIndex)
        portfolioFormulasManagerModuleObject.initialize()

        /* Adding Functions used elsewhere to Portfolio System Definition */
        portfolioSystem.checkConditions = function (situation, passed) {
            /* Given a Situation, we check if all children conditions are true or not */
            for (let m = 0; m < situation.conditions.length; m++) {

                let condition = situation.conditions[m]
                let value = false
                if (portfolioSystem.conditions.get(condition.id) !== undefined) {
                    value = portfolioSystem.conditions.get(condition.id)
                }
                if (value === true) {
                    portfolioSystem.highlights.push(condition.id)
                }
                else {
                    passed = false
                }
                portfolioSystem.values.push([condition.id, value])
            }
            return passed
        }

        portfolioSystem.evalConditions = function (startingNode, descendentOfNodeType) {
            evalNode(startingNode, 'Conditions', descendentOfNodeType)
        }

        portfolioSystem.evalFormulas = function (startingNode, descendentOfNodeType, currentValue) {
            evalNode(
                startingNode,
                'Formulas',
                descendentOfNodeType,
                undefined,
                currentValue
            )
        }

        portfolioSystem.evalUserCode = function (startingNode, descendentOfNodeType) {
            evalNode(startingNode, 'User Codes', descendentOfNodeType);
        }

        portfolioSystem.addError = function (errorDataArray) {
            /*
            This function adds to the array of error info a rate.
            This rate will later help plotting the error at the
            charts.
            */
            let rate = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
            errorDataArray.push(rate)
            portfolioSystem.errors.push(errorDataArray)
        }

        portfolioSystem.addWarning = function (warningDataArray) {
            /*
            This function adds to the array of warning info a rate.
            This rate will later help plotting the warning at the
            charts.
            */
            let rate = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
            warningDataArray.push(rate)
            portfolioSystem.warnings.push(warningDataArray)
        }

        portfolioSystem.addInfo = function (infoDataArray) {
            /*
            This function adds to the array of warning info a rate.
            This rate will later help plotting the warning at the
            charts.
            */
            let rate = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
            infoDataArray.push(rate)
            portfolioSystem.infos.push(infoDataArray)
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
        portfolioEventsManagerModuleObject.finalize()
        portfolioEventsManagerModuleObject = undefined

        portfolioFormulasManagerModuleObject.finalize()
        portfolioFormulasManagerModuleObject = undefined

        chart = undefined
        exchange = undefined
        market = undefined

        portfolioSystem.conditions = undefined
        portfolioSystem.formulas = undefined

        portfolioSystem.highlights = undefined
        portfolioSystem.errors = undefined
        portfolioSystem.warnings = undefined
        portfolioSystem.infos = undefined
        portfolioSystem.values = undefined
        portfolioSystem.status = undefined
        portfolioSystem.progress = undefined
        portfolioSystem.running = undefined

        portfolioSystem = undefined
        portfolioEngine = undefined
        sessionParameters = undefined
        //taskParameters = undefined
    }

    function maintain() {
        // Move Current to Last:

    }

    function reset() {
        portfolioSystem.highlights = []
        portfolioSystem.errors = []
        portfolioSystem.warnings = []
        portfolioSystem.infos = []
        portfolioSystem.values = []
        portfolioSystem.status = []
        portfolioSystem.progress = []
        portfolioSystem.running = []
        portfolioSystem.announcements = []
    }

    function updateChart(pChart, pExchange, pMarket) {
        /*
        We need these 3 data structures  to be a local objects
        accessible while evaluating conditions and formulas.
        */
        chart = pChart
        exchange = pExchange
        market = pMarket

    }

    async function run() {
        try {


        } catch (err) {
            /*
            If an error ocurred during execution, it was alreeady logged and
            included at the errors array. That means we need to do nothing here,
            just prevent the execution to be halted for not handling exceptions.
            */
            if (typeof err === 'string' || err instanceof String) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] runExecution -> err = ' + err)
            }
            if (err.stack !== undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] runExecution -> err = ' + err.stack)
            }
        }
    }

    function runUserDefinedCode(whenToRun) {
        if (portfolioSystem.userDefinedPortfolioCode == undefined || portfolioSystem.userDefinedPortfolioCode.config == undefined) { return; }
        if (
            (whenToRun === 'first' && portfolioSystem.userDefinedPortfolioCode.config.runBeforeCheckIns == true) ||
            (whenToRun === 'last' && portfolioSystem.userDefinedPortfolioCode.config.runAfterCheckOuts == true)
        ) {
            portfolioSystem.evalUserCode(portfolioSystem.userDefinedPortfolioCode, 'User Defined Portfolio Code');
        }
    }

    function confirmThisEvent(sessionId, event) {
        return portfolioEventsManagerModuleObject.confirmThisEvent(sessionId, event)
    }

    function setThisEvent(sessionId, event) {
        return portfolioEventsManagerModuleObject.setThisEvent(sessionId, event)
    }

    function confirmThisFormula(sessionId, formula) {
        return portfolioFormulasManagerModuleObject.confirmThisFormula(sessionId, formula)
    }

    function setThisFormula(sessionId, formula) {
        return portfolioFormulasManagerModuleObject.setThisFormula(sessionId, formula)
    }

    function evalNode(
        node,
        evaluating,
        descendentOfNodeType,
        isDescendent,
        currentValue
    ) {
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
                    evalFormula(
                        node,
                        currentValue
                    )
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
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        if (property.name !== previousPropertyName) {
                            if (node[property.name] !== undefined) {
                                evalNode(
                                    node[property.name],
                                    evaluating,
                                    descendentOfNodeType,
                                    isDescendent,
                                    currentValue
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
                                evalNode(
                                    nodePropertyArray[m],
                                    evaluating,
                                    descendentOfNodeType,
                                    isDescendent,
                                    currentValue
                                )
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
                type: 'TS LF Portfolio Bot Error - Evaluating Condition Error',
                placeholder: {}
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, nodeName, code, undefined)
        }

        portfolioSystem.conditions.set(node.id, value)

        if (value === true) {
            portfolioSystem.highlights.push(node.id)
        }
        if (errorMessage !== undefined) {
            portfolioSystem.addError([node.id, errorMessage, docs])
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] evalCondition -> errorMessage = ' + errorMessage)
        }
        if (value !== undefined) {
            portfolioSystem.values.push([node.id, value])
        }

        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalCondition -> value = ' + value)
    }

    function evalFormula(
        node,
        currentValue // This is value of the Formula at the Trading Bot, that can be used at code to be evaluated.
    ) {
        let value
        let errorMessage
        let docs

        try {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalFormula -> ' + node.name + ' -> code = ' + node.code)
            value = eval(node.code)
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
                type: 'TS LF Portfolio Bot Error - Evaluating Formula Error',
                placeholder: {}
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, node.name, node.code, undefined)
        }

        if (errorMessage !== undefined) {
            portfolioSystem.addError([node.id, errorMessage, docs])
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalFormula -> errorMessage = ' + errorMessage)
            return
        } else {
            if (value !== undefined) {
                if (node.type === 'Formula' && isNaN(value)) {

                    docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Portfolio Bot Error - Formula Value Not A Number',
                        placeholder: {}
                    }
                    TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, node.name, node.code, undefined, value)

                    portfolioSystem.addError([node.id, 'Formula needs to return a numeric value.', docs])
                    return
                }

                portfolioSystem.values.push([node.id, value])
                portfolioSystem.formulas.set(node.id, value)
            } else {

                docs = {
                    project: 'Foundations',
                    category: 'Topic',
                    type: 'TS LF Portfolio Bot Error - Formula Value Not A Number',
                    placeholder: {}
                }
                TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, node.name, node.code, undefined, value)

                portfolioSystem.addError([node.id, 'Formula needs to return a numeric value.', docs])
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
                type: 'TS LF Portfolio Bot Error - Evaluating User Code Error',
                placeholder: {}
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, node.name, node.code, undefined)
        }

        if (errorMessage !== undefined) {
            portfolioSystem.addError([node.id, errorMessage, docs])
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalFormula -> errorMessage = ' + errorMessage)
            return
        }
    }
}