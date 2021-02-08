exports.newSuperalgosBotModulesSnapshots = function (processIndex) {
    /*
    This module encapsulates the snapshots functionality.
    */
    const MODULE_NAME = 'Snapshots'

    let thisObject = {
        updateChart: updateChart,
        strategyEntry: strategyEntry,
        strategyExit: strategyExit,
        positionEntry: positionEntry,
        positionExit: positionExit,
        addCodeToSnapshot: addCodeToSnapshot,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine
    let tradingSystem
    let sessionParameters

    const SNAPSHOTS_FOLDER_NAME = 'Snapshots'

    /* Snapshots of Strategies and Positions */
    let snapshots = {
        headers: [],
        strategies: [],
        positions: []
    }

    let positionKeys = new Map()            // This is to prevent adding the same indicator / variable to the output collection.
    let strategyKeys = new Map()
    let createHeaders = true                // This is going to be true only once
    let createCloseHeaders = true           // This is going to be true only once
    let closeValues
    let strategyValues
    let addToStrategyValues
    let positionValues
    let addToPositionValues

    /* 
    These 3 are the main data structures available to users
    when writing conditions and formulas.
    */
    let chart
    let exchange
    let market

    return thisObject

    function initialize() {
        tradingEngine = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        tradingSystem = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        sessionParameters = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters
    }

    function finalize() {
        writeSnapshotFiles()
        tradingEngine = undefined
        tradingSystem = undefined
        sessionParameters = undefined

        positionKeys = undefined
        strategyKeys = undefined

        chart = undefined
        exchange = undefined
        market = undefined
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

    function strategyEntry() {
        /* 
        We will record here a snapshot of all values used in conditions and formulas within the Trading System. 
        If the strategy exists with a trade, this information will be added to the snapshots file.
        */

        strategyKeys = new Map()
        strategyValues = []
        addToStrategyValues = true

        evalNode(tradingSystem)

        /* Turn off this */
        createHeaders = false
        addToStrategyValues = false
    }

    function strategyExit() {
        getResults(tradingEngine.tradingCurrent.strategy.begin.value, tradingEngine.tradingCurrent.strategy.end.value)
        let valuesArray = closeValues.concat(strategyValues)
        snapshots.strategies.push(valuesArray)
    }

    function positionEntry() {

        positionKeys = new Map()
        positionValues = []
        addToPositionValues = true

        evalNode(tradingSystem)

        /* Turn off this */
        createHeaders = false
        addToPositionValues = false
    }

    function positionExit() {
        getResults(tradingEngine.tradingCurrent.position.begin.value, tradingEngine.tradingCurrent.position.end.value)
        let valuesArray = closeValues.concat(positionValues)
        snapshots.positions.push(valuesArray)
    }

    function evalNode(node) {
        if (node === undefined) { return }

        /* Here we check if there is a codition to be evaluated */
        if (node.type === 'Condition') {
            /* We will eval this condition */
            evalCondition(node)
        }

        /* Here we check if there is a formula to be evaluated */
        if (node.type === 'Formula') {
            if (node.code !== undefined) {
                /* We will eval this formula */
                evalFormula(node)
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
                                evalNode(node[property.name])
                            }
                            previousPropertyName = property.name
                        }
                        break
                    }
                    case 'array': {
                        if (node[property.name] !== undefined) {
                            let nodePropertyArray = node[property.name]
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

        /*
        The code can be at the condition node if it was done with the Conditions Editor, or it can also be
        at a Javascript Code node. If there is a Javascript object we will give it preference and take the code
        from there. Otherwise we will take the code from the Condition node.
        */

        let nodeWithCode = node
        if (node.javascriptCode !== undefined) {
            if (node.javascriptCode.code !== undefined) {
                nodeWithCode = node.javascriptCode
            }
        }
        addCodeToSnapshot(nodeWithCode)
    }

    function evalFormula(node) {
        let nodeWithCode = node
        addCodeToSnapshot(nodeWithCode)
    }

    function addCodeToSnapshot(nodeWithCode) {
        if (nodeWithCode === undefined) { return }
        if (nodeWithCode.code === undefined) { return }

        try {
            let instructionsArray = nodeWithCode.code.split(' ')
            for (let i = 0; i < instructionsArray.length; i++) {
                let instruction = instructionsArray[i]
                instruction = instruction.replace('(', '')
                instruction = instruction.replace(')', '')
                instruction = instruction.replace(/</g, '')
                instruction = instruction.replace(/>/g, '')
                instruction = instruction.replace(/<=/g, '')
                instruction = instruction.replace(/>=/g, '')
                instruction = instruction.replace(/!=/g, '')
                instruction = instruction.replace(/!==/g, '')
                instruction = instruction.replace(/==/g, '')
                instruction = instruction.replace(/===/g, '')
                instruction = instruction.replace(/{/g, '')
                instruction = instruction.replace(/}/g, '')
                if (instruction.indexOf('chart') >= 0) {
                    let parts = instruction.split('.')
                    let timeFrame = parts[1]
                    let product = parts[2]
                    let property
                    checkPrevious(3)
                    function checkPrevious(index) {
                        property = parts[index]
                        if (property === 'previous') {
                            product = product + '.previous'
                            checkPrevious(index + 1)
                        }
                    }

                    // Example: chart.at01hs.popularSMA.sma200 - chart.at01hs.popularSMA.sma100  < 10
                    if (timeFrame !== 'atAnyTimeFrame') {
                        timeFrame = timeFrame.substring(2, 4) + '-' + timeFrame.substring(4, 7)
                    }
                    let key = timeFrame + '-' + product + '-' + property
                    let existingKey

                    if (addToStrategyValues === true) {
                        addValues(strategyKeys, strategyValues)
                    }

                    if (addToPositionValues === true) {
                        addValues(positionKeys, positionValues)
                    }

                    function addValues(keys, values) {
                        existingKey = keys.get(key)

                        if (existingKey === undefined) { // means that at the current loop this property of this product was not used before.
                            keys.set(key, key)
                            if (createHeaders === true) {
                                snapshots.headers.push(key)
                            }

                            try {
                                let value = eval(instruction)
                                values.push(value)
                            } catch (err) {
                                const message = 'Snapshot Unexpected Error'
                                let docs = {
                                    project: 'Superalgos',
                                    category: 'Topic',
                                    type: 'TS LF Trading Bot Error - ' + message,
                                    placeholder: {}
                                }

                                let contextInfo = {
                                    instruction: instruction
                                }
                                TS.projects.superalgos.utilities.docsFunctions.buildPlaceholder(docs, err, nodeWithCode.name, nodeWithCode.code, undefined, undefined, contextInfo)

                                tradingSystem.addError([nodeWithCode.id, message, docs])
                                values.push(0)
                            }
                        }
                    }
                }
            }
        } catch (err) {
            const message = 'Snapshot Unexpected Error'
            let docs = {
                project: 'Superalgos',
                category: 'Topic',
                type: 'TS LF Trading Bot Error - ' + message,
                placeholder: {}
            }
            TS.projects.superalgos.utilities.docsFunctions.buildPlaceholder(docs, err, nodeWithCode.name, nodeWithCode.code, undefined)

            tradingSystem.addError([nodeWithCode.id, message, docs])
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] runSimulation -> addCodeToSnapshot -> nodeWithCode.code = ' + nodeWithCode.code)
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] runSimulation -> addCodeToSnapshot -> err = ' + err.stack)
        }
    }

    function getResults(openDatetime, closeDatetime) {

        let closeHeaders = ['Trade Number', 'Open Datetime', 'Close Datetime', 'Strategy Name', 'Trigger On Situation', 'Take Position Situation', 'Result In Base Asset', 'Result In Quoted Asset', 'ROI in Base Asset', 'ROI in Quoted Asset', 'Exit Type']
        closeValues = [
            tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeCounters.positions.value,                                     // Position Number
            (new Date(openDatetime)).toISOString(),                                                            // Open Datetime
            (new Date(closeDatetime)).toISOString(),                                                           // Open Datetime
            tradingEngine.tradingCurrent.strategy.strategyName.value,                                                 // Strategy Name
            tradingEngine.tradingCurrent.strategy.situationName.value,                                                // Trigger On Situation
            tradingEngine.tradingCurrent.position.situationName.value,                                                // Take Position Situation
            tradingEngine.tradingCurrent.position.positionBaseAsset.hitFail.value,                                    // Result in Base Asset
            tradingEngine.tradingCurrent.position.positionQuotedAsset.hitFail.value,                                  // Result in Base Asset
            tradingEngine.tradingCurrent.position.positionBaseAsset.ROI.value,                                        // ROI in Base Asseet
            tradingEngine.tradingCurrent.position.positionQuotedAsset.ROI.value,                                      // ROI in Quoted Asset
            tradingEngine.tradingCurrent.position.exitType.value                                                      // Exit Type
        ]

        if (createCloseHeaders === true) {
            snapshots.headers = closeHeaders.concat(JSON.parse(JSON.stringify(snapshots.headers)))
            createCloseHeaders = false
        }
    }

    function writeSnapshotFiles() {

        if (sessionParameters.snapshots !== undefined) {
            if (sessionParameters.snapshots.config.strategy === true) {
                writeSnapshotFile(snapshots.strategies, 'Strategies')
            }
        }

        if (sessionParameters.snapshots !== undefined) {
            if (sessionParameters.snapshots.config.strategy === true) {
                writeSnapshotFile(snapshots.positions, 'Positions')
            }
        }
    }

    function writeSnapshotFile(snapshotArray, pFileName) {
        try {
            let fileStorage = TS.projects.superalgos.taskModules.fileStorage.newFileStorage(processIndex);

            let fileContent = "";
            let separator = "\r\n";

            parseRecord(snapshots.headers)

            for (let i = 0; i < snapshotArray.length; i++) {
                let record = snapshotArray[i];
                parseRecord(record)
            }

            function parseRecord(record) {
                for (let j = 0; j < record.length; j++) {
                    let property = record[j]

                    fileContent = fileContent + '' + property
                    if (j !== record.length - 1) {
                        fileContent = fileContent + ","
                    }
                }
                fileContent = fileContent + separator
            }

            fileContent = "" + fileContent + "";

            let fileName = pFileName + '.csv';
            let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME + "/" + SNAPSHOTS_FOLDER_NAME;
            filePath += '/' + fileName

            fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

            function onFileCreated(err) {
                if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] writeSnapshotFile -> onFileCreated -> err = " + err.stack);
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] writeSnapshotFile -> onFileCreated -> filePath = " + filePath);
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] writeSnapshotFile -> onFileCreated -> market = " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "_" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName);
                }
            }
        }
        catch (err) {
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] writeSnapshotFile -> err = " + err.stack);
        }
    }
}