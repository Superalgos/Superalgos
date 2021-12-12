exports.newMachineLearningBotModulesLearningSystem = function (processIndex) {
    /*
    The Learning System is the user defined set of rules compliant with the Learning Protocol that
    defines the learning logic to be applied during each cycle of the Simulation.
    */
    const MODULE_NAME = 'Learning System'
    let thisObject = {
        loadModel: loadModel, 
        saveModel: saveModel, 
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

    let learningSystem
    let learningEngine
    let sessionParameters
    let dynamicIndicators

    let machineLearningLibraryModuleObject

    return thisObject

    function initialize() {
        learningSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningSystem
        learningEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters

        learningSystem.conditions = new Map()
        learningSystem.formulas = new Map()

        /* Adding Functions used elsewhere to Learning System Definition */
        learningSystem.checkConditions = function (situation, passed) {
            /* Given a Situation, we check if all children conditions are true or not */
            for (let m = 0; m < situation.conditions.length; m++) {

                let condition = situation.conditions[m]
                let value = false
                if (learningSystem.conditions.get(condition.id) !== undefined) {
                    value = learningSystem.conditions.get(condition.id)
                }
                if (value === true) {
                    learningSystem.highlights.push(condition.id)
                }
                else {
                    passed = false
                }
                learningSystem.values.push([condition.id, value])
            }
            return passed
        }

        learningSystem.evalConditions = function (startingNode, descendentOfNodeType) {
            evalNode(startingNode, 'Conditions', descendentOfNodeType)
        }

        learningSystem.evalFormulas = function (startingNode, descendentOfNodeType) {
            evalNode(startingNode, 'Formulas', descendentOfNodeType)
        }

        learningSystem.addError = function (errorDataArray) {
            /*
            This function adds to the array of error info a rate.
            This rate will later help plotting the error at the
            charts.
            */
            let rate = learningEngine.learningCurrent.learningEpisode.candle.close.value
            errorDataArray.push(rate)
            learningSystem.errors.push(errorDataArray)
        }

        learningSystem.addWarning = function (warningDataArray) {
            /*
            This function adds to the array of warning info a rate. 
            This rate will later help plotting the warning at the
            charts.
            */
            let rate = learningEngine.learningCurrent.learningEpisode.candle.close.value
            warningDataArray.push(rate)
            learningSystem.warnings.push(warningDataArray)
        }

        learningSystem.addInfo = function (infoDataArray) {
            /*
            This function adds to the array of warning info a rate. 
            This rate will later help plotting the warning at the
            charts.
            */
            let rate = learningEngine.learningCurrent.learningEpisode.candle.close.value
            infoDataArray.push(rate)
            learningSystem.infos.push(infoDataArray)
        }

        /*
        Initialize the Machine Learning Library
        */

        let machineLearningLibrary = learningSystem.machineLearningLibrary

        if (machineLearningLibrary === undefined) {
            // TODO 
        }
        /* 
        We will scan the project schema until we find the machine learning library
        defined by the user at the UI.
        */
        for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
            let projectSchemaProject = PROJECTS_SCHEMA[i]
            if (projectSchemaProject.name !== machineLearningLibrary.project) { continue }

            for (let j = 0; j < projectSchemaProject.TS.botModules.length; j++) {
                let botModuleDefinition = projectSchemaProject.TS.botModules[j]

                /* 
                We match the type of the machine learning library with the name at the project schema 
                */
                if (botModuleDefinition.name === machineLearningLibrary.type) {

                    let project = TS.projects[machineLearningLibrary.project.toLowerCase()]
                    let botModule = project.botModules[botModuleDefinition.propertyName]
                    let moduleFunction = botModule[botModuleDefinition.functionName]
                    machineLearningLibraryModuleObject = moduleFunction(processIndex)
                }
            }
        }
        machineLearningLibraryModuleObject.initialize(onInitializeReady)

        function onInitializeReady(err) {
            if (err.result === TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {

            } else {

            }
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

        machineLearningLibraryModuleObject.finalize()
        machineLearningLibraryModuleObject = undefined

        chart = undefined
        exchange = undefined
        market = undefined

        learningSystem.conditions = undefined
        learningSystem.formulas = undefined

        learningSystem.highlights = undefined
        learningSystem.errors = undefined
        learningSystem.warnings = undefined
        learningSystem.infos = undefined
        learningSystem.values = undefined
        learningSystem.status = undefined
        learningSystem.progress = undefined
        learningSystem.running = undefined

        learningSystem = undefined
        learningEngine = undefined
        sessionParameters = undefined
    }
    
    async function  loadModel() {
        await machineLearningLibraryModuleObject.loadModel()
    }

    async function  saveModel() {
        await machineLearningLibraryModuleObject.saveModel()
    }

    function mantain() {
        machineLearningLibraryModuleObject.mantain()
    }

    function reset() {
        machineLearningLibraryModuleObject.reset()

        learningSystem.highlights = []
        learningSystem.errors = []
        learningSystem.warnings = []
        learningSystem.infos = []
        learningSystem.values = []
        learningSystem.status = []
        learningSystem.progress = []
        learningSystem.running = []
        learningSystem.announcements = []
    }

    function updateChart(pChart, pExchange, pMarket) {
        /* 
        We need these 3 data structures  to be a local objects 
        accessible while evaluating conditions and formulas.
        */
        chart = pChart
        exchange = pExchange
        market = pMarket

        machineLearningLibraryModuleObject.updateChart(pChart, pExchange, pMarket)
    }

    function buildDynamicIndicators() {
        if (learningSystem.dynamicIndicators !== undefined) {
            dynamicIndicators = {}
            /* Eval Dynamic Indicators */
            learningSystem.evalFormulas(learningSystem.dynamicIndicators, 'Indicator Function')

            for (let i = 0; i < learningSystem.dynamicIndicators.indicatorFunctions.length; i++) {
                let indicatorFunction = learningSystem.dynamicIndicators.indicatorFunctions[i]
                if (indicatorFunction.formula === undefined) { return }
                if (indicatorFunction.config.codeName === undefined) { return }
                dynamicIndicators[indicatorFunction.config.codeName] = learningSystem.formulas.get(indicatorFunction.formula.id)
            }
        }
    }

    async function run() {
        try {
            /* Dynamic Indicators */
            // buildDynamicIndicators()  /* ***NOTE*** Would need to be implemented. */

            /*
            Initialize the Learning Algorithm
            */
            await machineLearningLibraryModuleObject.run()

        } catch (err) {
            /* 
            If an error occurred during execution, it was already logged and
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

    function evalNode(node, evaluating, descendentOfNodeType, isDescendent) {
        if (node === undefined) { return }

        /* Verify if this node is descendant of the specified node type */
        if (isDescendent !== true) {
            if (node.type === descendentOfNodeType) {
                isDescendent = true
            }
        }

        /* Here we check if there is a condition to be evaluated */
        if ((node.type === 'Condition' || node.type === 'Collection Condition') && evaluating === 'Conditions') {
            /* We will eval this condition */
            if (isDescendent === true) {
                evalCondition(node)
            }
        }

        /* Here we check if there is a formula to be evaluated */
        if ((node.type === 'Feature Formula' || node.type === 'Label Formula') && evaluating === 'Formulas') {
            if (node.code !== undefined) {
                /* We will eval this formula */
                if (isDescendent === true) {
                    evalFormula(node)
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
                type: 'TS LF Learning Bot Error - Evaluating Condition Error',
                placeholder: {}
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, nodeName, code, undefined)
        }

        learningSystem.conditions.set(node.id, value)

        if (value === true) {
            learningSystem.highlights.push(node.id)
        }
        if (errorMessage !== undefined) {
            learningSystem.addError([node.id, errorMessage, docs])
        }
        if (value !== undefined) {
            learningSystem.values.push([node.id, value])
        }

        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalCondition -> value = ' + value)
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalCondition -> errorMessage = ' + errorMessage)
    }

    function evalFormula(node) {
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
                type: 'TS LF Learning Bot Error - Evaluating Formula Error',
                placeholder: {}
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, node.name, node.code, undefined)
        }

        if (errorMessage !== undefined) {
            learningSystem.addError([node.id, errorMessage, docs])
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalFormula -> errorMessage = ' + errorMessage)
            return
        } else {
            if (value !== undefined) {
                if ((node.type === 'Feature Formula' || node.type === 'Label Formula') && isNaN(value)) {

                    docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Learning Bot Error - Formula Value Not A Number',
                        placeholder: {}
                    }
                    TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, node.name, node.code, undefined, value)

                    learningSystem.addError([node.id, 'Formula needs to return a numeric value.', docs])
                    return
                }

                learningSystem.values.push([node.id, value])
                learningSystem.formulas.set(node.id, value)
            }
        }

        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] evalFormula -> value = ' + value)
    }
}