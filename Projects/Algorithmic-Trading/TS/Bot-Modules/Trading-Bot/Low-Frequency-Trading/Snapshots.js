exports.newAlgorithmicTradingBotModulesSnapshots = function(processIndex) {
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

    let positionKeys = new Map() // This is to prevent adding the same indicator / variable to the output collection.
    let strategyKeys = new Map()
    let createHeaders = true // This is going to be true only once
    let createCloseHeaders = true // This is going to be true only once
    let closeValues
    let strategyValues
    let addToStrategyValues
    let positionValues
    let addToPositionValues
    let snapshotAvailable = false

    /* 
      These 3 are the main data structures available to users
      when writing conditions and formulas.
      */
    let chart
    let exchange
    let market

    return thisObject

    function initialize() {
        tradingEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        tradingSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters
            // first trade forces overwrite of the existing file
        if (tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeCounters.positions.value > 1) {
            snapshotAvailable = true
            createHeaders = false // This is going to be true only once
            createCloseHeaders = false
        }
    }

    function finalize() {
        //trigger exits added for extra save moment for datapreserve
        if (tradingEngine.tradingCurrent.strategy.begin.value > 0) {
            strategyExit()
            positionExit()
        }
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

        /* Here we check if there is a condition to be evaluated */
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
        let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(node.project + '-' + node.type)
        if (schemaDocument === undefined) { return }

        if (schemaDocument.childrenNodesProperties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoid counting each property of those as individual children.
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node':
                        {
                            if (property.name !== previousPropertyName) {
                                if (node[property.name] !== undefined) {
                                    evalNode(node[property.name])
                                }
                                previousPropertyName = property.name
                            }
                            break
                        }
                    case 'array':
                        {
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
            const code = nodeWithCode.code
            let instructionsArray = code.split(' ')
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
                                    project: 'Foundations',
                                    category: 'Topic',
                                    type: 'TS LF Trading Bot Error - ' + message,
                                    placeholder: {}
                                }

                                let contextInfo = {
                                    instruction: instruction
                                }
                                TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, nodeWithCode.name, nodeWithCode.code, undefined, undefined, contextInfo)

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
                project: 'Foundations',
                category: 'Topic',
                type: 'TS LF Trading Bot Error - ' + message,
                placeholder: {}
            }
            TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, nodeWithCode.name, nodeWithCode.code, undefined)

            tradingSystem.addError([nodeWithCode.id, message, docs])
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] runSimulation -> addCodeToSnapshot -> nodeWithCode.code = ' + nodeWithCode.code)
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] runSimulation -> addCodeToSnapshot -> err = ' + err.stack)
        }
    }

    function getResults(openDatetime, closeDatetime) {

        let baseOpen = tradingEngine.tradingCurrent.strategyCloseStage.stageBaseAsset.sizeFilled.value - tradingEngine.tradingCurrent.strategyCloseStage.stageBaseAsset.feesPaid.value
        let baseClose = tradingEngine.tradingCurrent.strategyOpenStage.stageBaseAsset.sizeFilled.value - tradingEngine.tradingCurrent.strategyOpenStage.stageBaseAsset.feesPaid.value
        let quoteOpen = tradingEngine.tradingCurrent.strategyOpenStage.stageQuotedAsset.sizeFilled.value - tradingEngine.tradingCurrent.strategyOpenStage.stageQuotedAsset.feesPaid.value
        let quoteClose = tradingEngine.tradingCurrent.strategyCloseStage.stageQuotedAsset.sizeFilled.value - tradingEngine.tradingCurrent.strategyCloseStage.stageQuotedAsset.feesPaid.value
        let qouteProfit = ((quoteClose / quoteOpen * 100) - 100)
        let baseProfit = ((baseClose / baseOpen * 100) - 100)

        let closeHeaders = ['Trade Number', 'Open Datetime', 'Close Datetime', 'Strategy Name', 'Trigger On Situation', 'Take Position Situation', 'Open Position in Base Asset', 'Close Position in Base Asset', 'Open Position in Quoted Asset', 'Close Position in Quoted Asset', 'Result In Base Asset', 'Result In Quoted Asset', 'ROI in Base Asset', '% P/L Base Asset', 'P/L Type Base Asset', 'ROI in Quoted Asset', '% P/L Quoted Asset', 'P/L Type Quoted Asset', 'Exit Type', '# Periods']
        closeValues = [
            tradingEngine.tradingCurrent.tradingEpisode.tradingEpisodeCounters.positions.value, // Position Number
            (new Date(openDatetime)).toISOString(), // Open Datetime
            (new Date(closeDatetime)).toISOString(), // Open Datetime
            tradingEngine.tradingCurrent.strategy.strategyName.value, // Strategy Name
            tradingEngine.tradingCurrent.strategy.situationName.value, // Trigger On Situation
            tradingEngine.tradingCurrent.position.situationName.value, // Take Position Situation
            baseOpen, // open position in base asset
            baseClose, // close position in base asset
            quoteOpen, //open quote in base asset
            quoteClose, // close quote in base asset
            tradingEngine.tradingCurrent.position.positionBaseAsset.hitFail.value, // Result in Base Asset
            tradingEngine.tradingCurrent.position.positionQuotedAsset.hitFail.value, // Result in Base Asset
            tradingEngine.tradingCurrent.position.positionBaseAsset.ROI.value, // ROI in Base Asset <- not sure this works as intended
            baseProfit + '%', // % profit / loss in base Asset
            baseProfit === 0 ? 'Even' : (baseProfit > 0 ? "Profit" : "Loss"),

            tradingEngine.tradingCurrent.position.positionQuotedAsset.ROI.value, // ROI in Quoted Asset <- not sure this works as intended
            qouteProfit + '%', // % profit loss in quoted Asset
            qouteProfit === 0 ? 'Even' : (qouteProfit > 0 ? "Profit" : "Loss"),
            tradingEngine.tradingCurrent.position.exitType.value, // Exit Type
            tradingEngine.tradingCurrent.position.positionCounters.periods.value // periods counter
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
            let fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex);

            let fileName = pFileName + '.csv'

            let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + '/Output/' + TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME + '/' + SNAPSHOTS_FOLDER_NAME;
            filePath += '/' + fileName

            //Get contents of current file if available, otherwise start empty file
            if (snapshotAvailable) {
                getSnapShotFile(filePath)
            } else {
                writeOutput('')
            }

            function writeOutput(fileContent) {
                let separator = '\r\n';
                let contentArray = [];

                // if we have file content extract rows
                if (fileContent != '') {
                    contentArray = fileContent.split(separator)
                }

                parseRecord(snapshots.headers)
                for (let i = 0; i < snapshotArray.length; i++) {
                    let record = snapshotArray[i];
                    if (record.length > 0) {
                        parseRecord(record)
                    }
                }

                function parseRecord(record) {
                    // if we have undefined values, we need to extract the previous stored values for this trade and append them to the new record for completion
                    if (record[record.length - 1] === undefined && contentArray.length > 0) {

                        let rowToMutateArray = contentArray[contentArray.length - 1].split(',')
                            // check if are for sure on the same trade number and merge the data and remove previous line incl separator
                        if (rowToMutateArray[0] == record[0]) {
                            record.pop()
                            rowToMutateArray.splice(0, record.length)
                            record = record.concat(rowToMutateArray)
                            fileContent = fileContent.replace(contentArray[contentArray.length - 1], '')
                            fileContent = fileContent.replace(/\r\n$/, '')
                        }
                    }
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

                fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated)

                function onFileCreated(err) {
                    if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] writeSnapshotFile -> onFileCreated -> err = ' + err.stack);
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] writeSnapshotFile -> onFileCreated -> filePath = ' + filePath);
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] writeSnapshotFile -> onFileCreated -> market = ' + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '_' + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName);
                    }
                }
            }

        } catch (err) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(
                processIndex
            ).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(
                MODULE_NAME,
                '[ERROR] writeSnapshotFile -> err = ' + err.stack
            )
        }
        //get file contents
        function getSnapShotFile(filePath) {

            try {

                let fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex);

                fileStorage.getTextFile(filePath, onFileReceived)

                function onFileReceived(err, text) {
                    if (err.result === TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        try {
                            // remove the last linebreak and separator which is introduced extra during save
                            text = text.replace(/\n$/, '')
                            text = text.replace(/\r\n$/, '')
                            writeOutput(text)
                        } catch (err) {
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> fileName = ' + filePath);
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> filePath = ' + filePath);
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> err = ' + err.stack);
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> Asuming this is a temporary situation. Requesting a Retry.');
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        }
                    } else {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> err = ' + err.stack);
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> filePath = ' + filePath);
                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err;
                        callBackFunction(err)
                    }
                }

            } catch (error) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> err = ' + err.stack);
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> filePath = ' + filePath);
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err;
                callBackFunction(err);
            }
        }
    }
}