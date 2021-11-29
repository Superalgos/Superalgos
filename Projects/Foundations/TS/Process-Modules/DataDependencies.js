exports.newFoundationsProcessModulesDataDependencies = function (processIndex) {
    /*
    This module maintains a curated array of Data Dependency nodes,
    which is not exactly the ones listed at the Process Dependencies,
    but a smaller subset based on the circumstances found at the user's
    workspace. For example:

    1. Dependencies without a Reference Parent are filtered out.
    2. Dependencies which don't have a Data Set are filtered out.

    It also maintains an array of Data Set Modules, which are the
    one's that ultimately know how to load a file based on the
    network configuration found at the workspace at the moment this
    Task was launched.

    Finally it maintains a Filter map, that allows the users of this module
    to filter out data dependencies based on the code written by users
    at the Javascript Code and Formula nodes.
    */
    const MODULE_NAME = "Data Dependencies"

    let thisObject = {
        filters: undefined,
        defaultExchange: undefined,
        defaultMarket: undefined,
        curatedDependencyNodeArray: undefined,
        dataSetsModulesArray: [],
        initialize: initialize,
        finalize: finalize
    }

    thisObject.filters = {
        market: {
            list: new Map()
        },
        exchange: {
            list: new Map(),
            markets: new Map(),
            products: new Map(),
            timeFrames: new Map()
        }
    }

    return thisObject

    function initialize(callBackFunction) {
        try {
            /* Basic Validations */
            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies !== undefined) {
                /*
                First we will get all the data dependencies of the bot, as defined at the Trading|Portfolio Mine.
                */
                thisObject.curatedDependencyNodeArray = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies, 'Data Dependency')
                if (thisObject.curatedDependencyNodeArray.length === 0) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> It is not possible to not have data dependencies at all.")
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                    return
                }
                /*
                We will filter out declared dependencies that are not present in the workspace.
                This will allow the user to have less Data Mines loaded at the workspace
                that the ones that a Trading|Portfolio Mine depends on.
                */
                thisObject.curatedDependencyNodeArray = SA.projects.visualScripting.utilities.nodeFunctions.filterOutNodeWihtoutReferenceParentFromNodeArray(thisObject.curatedDependencyNodeArray)

            } else {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> It is not possible not to have process dependencies, which means not data dependencies.")
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                return
            }

            if (thisObject.curatedDependencyNodeArray.length === 0) {

                // We allow old indicators not to declare their data dependencies.
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                return
            }

            /*
            Store here the default exchange and market.
            */
            thisObject.defaultExchange = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName
            thisObject.defaultMarket =
                TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName +
                "-" +
                TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName

            /* Session based dependency thisObject.filters */
            let receivedDependencyFilters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).DEPENDENCY_FILTER
            if (receivedDependencyFilters !== undefined) {

                /*
                Javascript Maps can not travel stringified at ta JSON object, so we receive
                these maps in an Array format, and here we will just convert them to Maps,
                that is how we need them.
                */
                arrayToMap(receivedDependencyFilters.market.list, thisObject.filters.market.list)

                arrayToMap(receivedDependencyFilters.exchange.list, thisObject.filters.exchange.list)
                arrayToMap(receivedDependencyFilters.exchange.markets, thisObject.filters.exchange.markets)
                arrayToMap(receivedDependencyFilters.exchange.products, thisObject.filters.exchange.products)
                arrayToMap(receivedDependencyFilters.exchange.timeFrames, thisObject.filters.exchange.timeFrames)

                function arrayToMap(array, map) {
                    for (let i = 0; i < array.length; i++) {
                        let key = array[i]
                        map.set(key, true)
                    }
                }
            }
            /*
            In case we do not receive any filters, like in the case of Indicators and Sensors,
            or simply because the Learning System is still empty,
            we need to add the default exchange and market to these maps in order
            for the following sections to work, and later we at least have candles at the
            Learning Simulation.
            */
            thisObject.filters.market.list.set(thisObject.defaultMarket, true)

            thisObject.filters.exchange.list.set(thisObject.defaultExchange, true)
            thisObject.filters.exchange.markets.set(thisObject.defaultExchange + '-' + thisObject.defaultMarket, true)

            /*
             For each dependency declared at the curatedDependencyNodeArray, we will initialize a
             DataSet as part of this initialization process.
             */
            let alreadyCalledBack = false

            /*
<<<<<<< HEAD
            The current curatedDependencyNodeArray that we have includes all the dependencies daclared in the Data Mine | Trading Mine | Portfolio Mine | Learning Mine
=======
            The current curatedDependencyNodeArray that we have includes all the dependencies declared in the Data Mine | Trading Mine | Learning Mine
>>>>>>> upstream/develop
            process dependencies, minus the ones without reference parent, meaning that references Data Mines that are
            not present at the workspace. From all the remaining dependencies there will be others that we need to
            filter out, and they are the ones which the user does not have a data product anywhere on the network where
            this task is running, that is storing the data associated to this dependency. The way we use to filter this
            out is by analyzing the response of the initialization call to the DataSet module. If it did not fail but
            it was not initialized, then we will assume this happened because the data could not be located and we will
            assume the user did this on purpose and we will filter out this dependency by not putting it on this new array.
            */
            let newNodeArray = []

            let exchangeList = Array.from(thisObject.filters.exchange.list.keys())
            let marketList = Array.from(thisObject.filters.market.list.keys())

            /*
            For each Exchange / Market we will add the datasets objects to our collection.
            */
            for (let e = 0; e < exchangeList.length; e++) {
                let exchange = exchangeList[e]
                for (let m = 0; m < marketList.length; m++) {
                    let market = marketList[m]
                    if (receivedDependencyFilters !== undefined) {
                        /*
                        If we received a Dependency Filter from the UI, we will apply it here so
                        as not to add DataSets that we wont actually need.
                        */
                        if (thisObject.filters.exchange.markets.get(exchange + '-' + market) === true) {
                            addDataSets(exchange, market)
                        }
                    } else {
                        /*
                        If we did not received these dependency filters, like when we are processing
                        Indicators, we will just add all datasets from exchange / market combination
                        because it will only be one combination: the default exchange and the default market.
                        */
                        addDataSets(exchange, market)
                    }
                }
            }

            if (alreadyCalledBack === false) {
                alreadyCalledBack = true
                thisObject.curatedDependencyNodeArray = newNodeArray
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                return
            }

            function addDataSets(exchange, market) {
                for (let i = 0; i < thisObject.curatedDependencyNodeArray.length; i++) {

                    let dataDependency = thisObject.curatedDependencyNodeArray[i]

                    if (receivedDependencyFilters !== undefined) {
                        /*
                        If we received a Dependency Filter from the UI, we will make these exact checks
                        before instantiating a Data Set Module.
                        */
                        if (dataDependency.referenceParent === undefined) {
                            continue
                        }
                        if (dataDependency.referenceParent.parentNode === undefined) {
                            continue
                        }
                        if (dataDependency.referenceParent.parentNode.config.singularVariableName === undefined) {
                            continue
                        }
                        let foundAtDependencyFilters = false
                        /*
                        This is the product related to this Data Dependency, as the user would type it
                        at a Condition or Formula and appear at the UI provided filter.
                        */
                        let product
                        /*
                        We will filter out all the data dependencies which are not at the filters, except for candles,
                        because we will need the candles dataset to run the simulation.
                        */
                        if (dataDependency.referenceParent.parentNode.config.codeName === 'Candles') {
                            foundAtDependencyFilters = true
                        }
                        /*
                        We will consider that the user might use the singularVariableName or the pluralVariableName
                        as well.
                        */
                        product = dataDependency.referenceParent.parentNode.config.singularVariableName
                        if (thisObject.filters.exchange.products.get(exchange + '-' + market + '-' + product) === true) {
                            foundAtDependencyFilters = true
                        }
                        product = dataDependency.referenceParent.parentNode.config.pluralVariableName
                        if (thisObject.filters.exchange.products.get(exchange + '-' + market + '-' + product) === true) {
                            foundAtDependencyFilters = true
                        }
                        if (foundAtDependencyFilters === true) {
                            addDataSet(exchange, market)
                        }
                    } else {
                        addDataSet(exchange, market)
                    }

                    function addDataSet(exchange, market) {

                        let dataSetModule = TS.projects.foundations.processModules.dataset.newFoundationsProcessModulesDataset(processIndex)
                        dataSetModule.initialize(exchange, market, dataDependency, onInitilized)

                        function onInitilized(err, wasInitialized) {

                            if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> err = " + JSON.stringify(err))

                                alreadyCalledBack = true
                                callBackFunction(err)
                                return
                            }

                            if (wasInitialized === true) {
                                newNodeArray.push(thisObject.curatedDependencyNodeArray[i])
                                thisObject.dataSetsModulesArray.push(dataSetModule)
                            }
                        }
                    }
                }
            }

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack)
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }

    function finalize() {
        for (let i = 0; i < thisObject.dataSetsModulesArray.length; i++) {
            let dataSetModule = thisObject.dataSetsModulesArray[i]
            dataSetModule.finalize()
        }
        thisObject.dataSetsModulesArray = undefined
        thisObject.curatedDependencyNodeArray = undefined
        thisObject.filters = undefined
        thisObject.defaultExchange = undefined
        thisObject.defaultMarket = undefined
        bot = undefined
    }
}
