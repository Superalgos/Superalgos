exports.newFoundationsFunctionLibrariesDataDependenciesFunctions = function () {
    /*
    This module contains the functions that will allow you to load in memory 
    the data files which a process depends on, and later build the 
    data structures that will allow users to write conditions and formulas
    using these data structures.
    */
    const MODULE_NAME = "Data Dependency Function"

    let thisObject = {
        processSingleFiles: processSingleFiles,
        processMarketFiles: processMarketFiles,
        processDailyFiles: processDailyFiles,
        buildDataStructures: buildDataStructures
    }

    return thisObject

    async function processSingleFiles(
        processIndex,
        dataFiles,
        multiTimeFrameDataFiles,
        dataDependenciesModule
    ) {

        /* 
        We will iterate through all the exchanges and markets involved.
        */
        let exchangeList = Array.from(dataDependenciesModule.filters.exchange.list.keys())
        let marketList = Array.from(dataDependenciesModule.filters.market.list.keys())

        for (let e = 0; e < exchangeList.length; e++) {
            let currentExchange = exchangeList[e]
            for (let m = 0; m < marketList.length; m++) {
                let currentMarket = marketList[m]

                dataFiles = new Map()

                for (let dependencyIndex = 0; dependencyIndex < dataDependenciesModule.curatedDependencyNodeArray.length; dependencyIndex++) {
                    let dependency = dataDependenciesModule.curatedDependencyNodeArray[dependencyIndex]
                    let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex]

                    if (datasetModule.node.config.codeName !== "Single-File") {
                        continue
                    }

                    if (datasetModule.exchange !== currentExchange) {
                        continue
                    }

                    if (datasetModule.market !== currentMarket) {
                        continue
                    }

                    if (dataDependenciesModule.filters.exchange.timeFrames.get(datasetModule.exchange + '-' + datasetModule.market + '-' + datasetModule.product + '-' + 'atAnyTimeFrame') !== true) {
                        /*
                        If we can not find the current data set is used at the current time 
                        frame we will skip this file.
                        */
                        continue
                    }

                    let fileName = "Data.json"
                    let filePath = datasetModule.node.parentNode.config.codeName + '/' + datasetModule.node.config.codeName

                    /* We cut the async calls via callBacks at this point, so as to have a clearer code upstream */
                    let response = await TS.projects.foundations.utilities.miscellaneousFunctions.asyncGetDatasetFile(datasetModule, filePath, fileName)

                    if (response.err.message === 'File does not exist.') {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] File not Found. This process will wait until you run your Data Mining and this file is created. File = " + filePath + '/' + fileName)
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] Your strategy depends on the dataset  " + dependency.name + '.')
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] The reason that it depends on this dataset is because in one of your condition's Javascript Code node, you have written an expression that references this dataset. If you don't want to depend on this dataset, just locate that code and remove the mention.")
                        return false
                    }

                    if (response.err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        throw (response.err)
                    }

                    let dataFile = JSON.parse(response.text)
                    dataFiles.set(dependency.id, dataFile)
                }

                let mapKey = currentExchange + '-' + currentMarket + '-' + "Single Files"
                multiTimeFrameDataFiles.set(mapKey, dataFiles)
            }
        }
    }

    async function processMarketFiles(
        processIndex,
        dataFiles,
        multiTimeFrameDataFiles,
        dataDependenciesModule,
        currentTimeFrame,
        userDefinedTimeFrame,
        initialDatetime,
        finalDatetime
    ) {
        /* 
        We do market files first since if the simulation is run on daily files, there will 
        be a loop to get each of those files and we do not need that loop to reload market files. 
        */

        /* 
        We will iterate through all the exchanges and markets involved.
        */
        let exchangeList = Array.from(dataDependenciesModule.filters.exchange.list.keys())
        let marketList = Array.from(dataDependenciesModule.filters.market.list.keys())

        for (let e = 0; e < exchangeList.length; e++) {
            let currentExchange = exchangeList[e]
            for (let m = 0; m < marketList.length; m++) {
                let currentMarket = marketList[m]
                /*
                We will iterate through all possible timeFrames.
                */
                for (let n = 0; n < TS.projects.foundations.globals.timeFrames.marketTimeFramesArray().length; n++) {
                    const timeFrame = TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[n][0]
                    const timeFrameLabel = TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[n][1]

                    dataFiles = new Map()

                    /* Current Time Frame detection */
                    if (userDefinedTimeFrame === timeFrameLabel) {
                        currentTimeFrame.value = TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[n][0]
                        currentTimeFrame.label = TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[n][1]
                    }

                    /* Loop across the list of curated dependencies */
                    for (let dependencyIndex = 0; dependencyIndex < dataDependenciesModule.curatedDependencyNodeArray.length; dependencyIndex++) {
                        let dependency = dataDependenciesModule.curatedDependencyNodeArray[dependencyIndex]
                        let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex]

                        if (dependency.referenceParent.config.codeName !== "Multi-Time-Frame-Market") {
                            continue
                        }

                        if (datasetModule.exchange !== currentExchange) {
                            continue
                        }

                        if (datasetModule.market !== currentMarket) {
                            continue
                        }

                        if (dataDependenciesModule.filters.exchange.timeFrames.get(datasetModule.exchange + '-' + datasetModule.market + '-' + datasetModule.product + '-' + timeFrameLabel) !== true) {
                            /*
                            If we can not find the current data set is used at the current time 
                            frame we will skip this file, unless we are in the only special 
                            case that we are retrieving candles.
                            */
                            if (!(userDefinedTimeFrame === timeFrameLabel && datasetModule.node.parentNode.config.pluralVariableName === 'candles')) {
                                continue
                            }
                            if (currentExchange !== dataDependenciesModule.defaultExchange || currentMarket !== dataDependenciesModule.defaultMarket) {
                                continue
                            }
                        }

                        let fileName = "Data.json"
                        let filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel

                        /* We cut the async calls via callBacks at this point, so as to have a clearer code upstream */
                        let response = await TS.projects.foundations.utilities.miscellaneousFunctions.asyncGetDatasetFile(datasetModule, filePath, fileName)

                        if (response.err.message === 'File does not exist.') {
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] File not Found. This process will wait until you run your Data Mining and this file is created. File = " + filePath + '/' + fileName)
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] Your strategy depends on the dataset  " + dependency.name + '.')
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] The reason that it depends on this dataset is because in one of your condition's Javascript Code node, you have written an expression that references this dataset. If you don't want to depend on this dataset, just locate that code and remove the mention.")
                            return false
                        }

                        if (response.err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            throw (response.err)
                        }

                        let dataFile = JSON.parse(response.text)
                        let trimmedDataFile = trimDataFile(dataFile, datasetModule.node.parentNode.record)
                        dataFiles.set(dependency.id, trimmedDataFile)

                        function trimDataFile(dataFile, recordDefinition) {
                            /* 
                            Here we will discard all the records in a file that are outside of the current time range.
                            We will include the las element previous to the beginning of the time range. This is needed
                            because during the simulation, the current Time Frame is not the open one, but the previous to 
                            the open, and if we do not include the previous to the initial datetime there will be no 
                            current objects at the begining of the simulation for many time frames. 
                            */
                            let beginIndex
                            let endIndex
                            let result = []
                            for (let i = 0; i < recordDefinition.properties.length; i++) {
                                let property = recordDefinition.properties[i]
                                if (property.config.codeName === 'begin') {
                                    beginIndex = i
                                }
                                if (property.config.codeName === 'end') {
                                    endIndex = i
                                }
                            }
                            for (let i = 0; i < dataFile.length; i++) {
                                let dataRecord = dataFile[i]
                                let begin = dataRecord[beginIndex]
                                let end = dataRecord[endIndex]
                                /*
                                We will allow 4 objects before the initial datetime in order to allow formulas with 4 .previous
                                not to be undefined.

                                -1 because we need the previous closed element
                                */
                                if (end + timeFrame * 4 < initialDatetime - 1) { continue }
                                if (begin > finalDatetime) { continue }
                                result.push(dataRecord)
                            }
                            return result
                        }
                    }

                    let mapKey = currentExchange + '-' + currentMarket + '-' + TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[n][1]
                    multiTimeFrameDataFiles.set(mapKey, dataFiles)
                }
            }
        }
        return true
    }

    async function processDailyFiles(
        processIndex,
        dataFiles,
        multiTimeFrameDataFiles,
        dataDependenciesModule,
        currentTimeFrame,
        userDefinedTimeFrame,
        processDate
    ) {
        /*  Telling the world we are alive and doing well and which date we are processing right now. */
        let processingDateString = processDate.getUTCFullYear() + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(processDate.getUTCMonth() + 1, 2) + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(processDate.getUTCDate(), 2)
        TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, processingDateString, undefined, "Running...")

        /* 
        We will iterate through all the exchanges and markets involved.
        */
        let exchangeList = Array.from(dataDependenciesModule.filters.exchange.list.keys())
        let marketList = Array.from(dataDependenciesModule.filters.market.list.keys())

        for (let e = 0; e < exchangeList.length; e++) {
            let currentExchange = exchangeList[e]
            for (let m = 0; m < marketList.length; m++) {
                let currentMarket = marketList[m]
                /*
                We will iterate through all possible timeFrames.
                */
                for (let n = 0; n < TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray().length; n++) {
                    const timeFrameLabel = TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray()[n][1]

                    if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.framework.validtimeFrames !== undefined) {
                        let validPeriod = false
                        for (let i = 0; i < TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.framework.validtimeFrames.length; i++) {
                            let period = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.framework.validtimeFrames[i]
                            if (period === timeFrameLabel) { validPeriod = true }
                        }
                        if (validPeriod === false) {
                            continue
                        }
                    }

                    if (userDefinedTimeFrame === timeFrameLabel) {
                        currentTimeFrame.value = TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray()[n][0]
                        currentTimeFrame.label = TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray()[n][1]
                    }

                    dataFiles = new Map()

                    /*
                    We will iterate through all dependencies, in order to load the
                    files that later will end up at the chart data structure.
                    */
                    for (let dependencyIndex = 0; dependencyIndex < dataDependenciesModule.curatedDependencyNodeArray.length; dependencyIndex++) {
                        let dependency = dataDependenciesModule.curatedDependencyNodeArray[dependencyIndex]
                        let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex]

                        if (dependency.referenceParent.config.codeName !== "Multi-Time-Frame-Daily") {
                            continue
                        }

                        if (datasetModule.exchange !== currentExchange) {
                            continue
                        }

                        if (datasetModule.market !== currentMarket) {
                            continue
                        }

                        if (dataDependenciesModule.filters.exchange.timeFrames.get(datasetModule.exchange + '-' + datasetModule.market + '-' + datasetModule.product + '-' + timeFrameLabel) !== true) {
                            /*
                            If we can not find the current data set is used at the current time 
                            frame we will skip this file, unless we are in the only special 
                            case that we are retrieving candles.
                            */
                            if (!(userDefinedTimeFrame === timeFrameLabel && datasetModule.node.parentNode.config.pluralVariableName === 'candles')) {
                                continue
                            }
                            if (currentExchange !== dataDependenciesModule.defaultExchange || currentMarket !== dataDependenciesModule.defaultMarket) {
                                continue
                            }
                        }

                        /*
                        We will need to fetch the data of the current day and the previous day, in order for .previous properties in conditions and formulas to work well.
                        */
                        let previousDate = new Date(processDate.valueOf() - SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS)
                        let currentDate = new Date(processDate.valueOf())

                        let previousFile = await getDataFileFromDate(previousDate)
                        if (previousFile === false) { return false }
                        let currentFile = await getDataFileFromDate(currentDate)
                        if (currentFile === false) { return false }
                        let bothFiles = previousFile.concat(currentFile)
                        dataFiles.set(dependency.id, bothFiles)

                        async function getDataFileFromDate(dataFileDate) {

                            let dateForPath = dataFileDate.getUTCFullYear() + '/' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(dataFileDate.getUTCMonth() + 1, 2) + '/' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(dataFileDate.getUTCDate(), 2)
                            let filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel + "/" + dateForPath
                            let fileName = "Data.json"

                            /* We cut the async calls via callBacks at this point, so as to have a clearer code upstream */
                            let response = await TS.projects.foundations.utilities.miscellaneousFunctions.asyncGetDatasetFile(datasetModule, filePath, fileName)

                            if (response.err.message === 'File does not exist.') {
                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] File not Found. This process will wait until you run your Data Mining and this file is created. File = " + filePath + '/' + fileName)
                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] Your strategy depends on the dataset  " + dependency.name + '.')
                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] The reason that it depends on this dataset is because in one of your condition's Javascript Code node, you have written an expression that references this dataset. If you don't want to depend on this dataset, just locate that code and remove the mention.")
                                return false
                            }
                            if (response.err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                throw (response.err)
                            }

                            return JSON.parse(response.text)
                        }
                    }
                    let mapKey = currentExchange + '-' + currentMarket + '-' + TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray()[n][1]
                    multiTimeFrameDataFiles.set(mapKey, dataFiles)
                }

            }
        }
        return true
    }

    function buildDataStructures(
        processIndex,
        dataDependenciesModule,
        multiTimeFrameDataFiles,
        currentTimeFrame,
        chart,
        market,
        exchange,
        callBackFunction
    ) {
        /* First Phase: Validations */
        let mainDependency = {}
        /* 
        THe first thing we do is to build an array of all the 
        declared dependencies of the Bot Process.
        */
        let dataDependencies = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies, 'Data Dependency')
        /* 
        Then we will filter out declared dependencies that are 
        not referencing nodes currently present at the workspace.
        This will allow the user to have less Data Mines loaded at 
        the workspace that the ones that a the Bot process depends on.
        */
        dataDependencies = SA.projects.visualScripting.utilities.nodeFunctions.filterOutNodeWihtoutReferenceParentFromNodeArray(dataDependencies)
        /*
        We will run some validations to prevent starting the process
        if all needed config and nodes are not present.
        */
        if (TS.projects.foundations.functionLibraries.singleMarketFunctions.validateDataDependencies(processIndex, dataDependencies, callBackFunction) !== true) { return }
        /*
        Next we will build an array of output datasets of this process.
        We are not going to use it right now, but later down the line,
        we do it just to be able to validate that all nodes and config
        are ok before letting this process run too far.
        */
        let outputDatasets = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset')
        /*
        Here we check that all output datasets configs are ok. 
        */
        if (TS.projects.foundations.functionLibraries.singleMarketFunctions.validateOutputDatasets(processIndex, outputDatasets, callBackFunction) !== true) { return }

        /* Second Phase: Building the chart data structure */

        /* 
        This phase is about transforming the inputs into a format,
        or data structure that can be used in Javascript Code and 
        Formula nodes to access Indicator's data. 
        */

        let exchangeList = Array.from(dataDependenciesModule.filters.exchange.list.keys())
        let marketList = Array.from(dataDependenciesModule.filters.market.list.keys())

        for (let e = 0; e < exchangeList.length; e++) {
            let currentExchange = exchangeList[e]
            for (let m = 0; m < marketList.length; m++) {
                let currentMarket = marketList[m]
                let splittedMarket = currentMarket.split('-')
                let baseAsset = splittedMarket[0]
                let quotedAsset = splittedMarket[1]

                /* Market Files */
                for (let j = 0; j < TS.projects.foundations.globals.timeFrames.marketTimeFramesArray().length; j++) {
                    let timeFrameLabel = TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[j][1]
                    let dataFiles = multiTimeFrameDataFiles.get(currentExchange + '-' + currentMarket + '-' + timeFrameLabel)
                    let products = {}

                    if (dataFiles !== undefined && dataFiles.size > 0) {
                        TS.projects.foundations.functionLibraries.singleMarketFunctions.inflateDatafiles(processIndex, dataFiles, dataDependencies, products, mainDependency, currentTimeFrame.value)

                        let propertyName = 'at' + timeFrameLabel.replace('-', '')
                        addProducs(propertyName, products)
                    }
                }

                /* Daily Files */
                for (let j = 0; j < TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray().length; j++) {
                    let timeFrameLabel = TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray()[j][1]
                    let dataFiles = multiTimeFrameDataFiles.get(currentExchange + '-' + currentMarket + '-' + timeFrameLabel)
                    let products = {}

                    if (dataFiles !== undefined && dataFiles.size > 0) {
                        TS.projects.foundations.functionLibraries.singleMarketFunctions.inflateDatafiles(processIndex, dataFiles, dataDependencies, products, mainDependency, currentTimeFrame.value)

                        let propertyName = 'at' + timeFrameLabel.replace('-', '')
                        addProducs(propertyName, products)
                    }
                }

                /* Single Files */
                {
                    let dataFiles = multiTimeFrameDataFiles.get(currentExchange + '-' + currentMarket + '-' + 'Single Files')
                    let products = {}

                    if (dataFiles !== undefined && dataFiles.size > 0) {
                        TS.projects.foundations.functionLibraries.singleMarketFunctions.inflateDatafiles(processIndex, dataFiles, dataDependencies, products, mainDependency, currentTimeFrame.value)

                        let propertyName = 'atAnyTimeFrame'
                        addProducs(propertyName, products)
                    }
                }

                function addProducs(propertyName, products) {
                    /*
                    The chart data structure allow users to simplify the syntax when they are using 
                    the default exchange and the default market. 
                    */
                    if (currentExchange === dataDependenciesModule.defaultExchange && currentMarket === dataDependenciesModule.defaultMarket) {
                        chart[propertyName] = products
                    }
                    /*
                    The market data structure allow users to simplify the syntax when they are using 
                    the default exchange. 
                    */
                    if (currentExchange === dataDependenciesModule.defaultExchange) {
                        if (market[baseAsset] === undefined) {
                            market[baseAsset] = {}
                        }
                        if (market[baseAsset][quotedAsset] === undefined) {
                            market[baseAsset][quotedAsset] = {}
                        }
                        if (market[baseAsset][quotedAsset].chart === undefined) {
                            market[baseAsset][quotedAsset].chart = {}
                        }
                        market[baseAsset][quotedAsset].chart[propertyName] = products
                    }

                    if (exchange[currentExchange] === undefined) {
                        exchange[currentExchange] = {}
                    }
                    if (exchange[currentExchange].market === undefined) {
                        exchange[currentExchange].market = {}
                    }
                    if (exchange[currentExchange].market[baseAsset] === undefined) {
                        exchange[currentExchange].market[baseAsset] = {}
                    }
                    if (exchange[currentExchange].market[baseAsset][quotedAsset] === undefined) {
                        exchange[currentExchange].market[baseAsset][quotedAsset] = {}
                    }
                    if (exchange[currentExchange].market[baseAsset][quotedAsset].chart === undefined) {
                        exchange[currentExchange].market[baseAsset][quotedAsset].chart = {}
                    }
                    exchange[currentExchange].market[baseAsset][quotedAsset].chart[propertyName] = products
                }
            }
        }
    }
}