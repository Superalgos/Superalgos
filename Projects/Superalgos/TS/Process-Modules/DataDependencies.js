exports.newSuperalgosProcessModulesDataDependencies = function (processIndex) {
    /*
    This module mantains a curated array of Data Dependency nodes, 
    which is not exactly the ones listed at the Process Dependencies,
    but a smaller subset based on the circunstances found at the user's
    workspace. For example:
    
    1. Dependencies without a Reference Parent are filtered out.
    2. Dependencies which don't have a Data Set are filtered out. 

    It also mantains an array of Data Set Modules, which are the
    one's that ultimately know how to load a file based on the 
    network configuration found at the workspace at the moment this
    Task was launched.

    Finally it mantains a Filter map, that allows the users of this module
    to filter out data dependencies based on the code written by users
    at the Javascript Code and Formula nodes.
    */
    const MODULE_NAME = "Data Dependencies"

    let thisObject = {
        filters: undefined,
        curatedDependencyNodeArray: undefined,
        dataSetsModulesArray: [],
        isItAChartDepenency: isItAChartDepenency,
        initialize: initialize,
        finalize: finalize
    }

    thisObject.filters = {
        chart: {
            list: new Map(),
            products: new Map()
        },
        market: {
            list: new Map(),
            products: new Map()
        },
        exchange: {
            list: new Map(),
            markets: new Map(),
            products: new Map()
        }
    }

    return thisObject

    function initialize(callBackFunction) {
        try {
            /* Basic Valdidations */
            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies !== undefined) {
                /* 
                First we will get all the data dependencies of the bot, as defined at the Trading Mine.
                */
                thisObject.curatedDependencyNodeArray = TS.projects.superalgos.utilities.nodeFunctions.nodeBranchToArray(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies, 'Data Dependency')
                if (thisObject.curatedDependencyNodeArray.length === 0) {
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> It is not possible to not have data dependencies at all.")
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                    return
                }
                /* 
                We will filter out declared dependencies that are not present in the workspace.
                This will allow the user to have less Data Mines loaded at the workspace
                that the ones that a Trading Mine depends on.
                */
                thisObject.curatedDependencyNodeArray = TS.projects.superalgos.utilities.nodeFunctions.filterOutNodeWihtoutReferenceParentFromNodeArray(thisObject.curatedDependencyNodeArray)

            } else {
                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> It is not possible not to have process dependencies, which means not data dependencies.")
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
                return
            }

            if (thisObject.curatedDependencyNodeArray.length === 0) {

                // We allow old indicators not to declare their data dependencies.
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
                return
            }

            /* Session based dependency thisObject.filters */
            let receivedDependencyFilters = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).DEPENDENCY_FILTER
            if (receivedDependencyFilters !== undefined) {

                /* 
                Javascript Maps can not travel stringified at ta JSON object, so we receive
                these maps in an Array format, and here we will just convert them to Maps, 
                that is how we need them.
                */
                arrayToMap(receivedDependencyFilters.chart.list, thisObject.filters.chart.list)
                arrayToMap(receivedDependencyFilters.chart.products, thisObject.filters.chart.products)

                arrayToMap(receivedDependencyFilters.market.list, thisObject.filters.market.list)
                arrayToMap(receivedDependencyFilters.market.products, thisObject.filters.market.products)

                arrayToMap(receivedDependencyFilters.exchange.list, thisObject.filters.exchange.list)
                arrayToMap(receivedDependencyFilters.exchange.markets, thisObject.filters.exchange.markets)
                arrayToMap(receivedDependencyFilters.exchange.products, thisObject.filters.exchange.products)

                function arrayToMap(array, map) {
                    for (let i = 0; i < array.length; i++) {
                        let key = array[i]
                        map.set(key, true)
                    }
                }
            }
            /*
            At our filter structure, we will add the Task default exchange and market. 
            This will help us lateer to build other structures in a generic way.
            */
            let defaultExchange = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName
            let defautMarket =
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName +
                "-" +
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
            thisObject.filters.exchange.list.set(defaultExchange, true)
            thisObject.filters.exchange.markets.set(defaultExchange + '-' + defautMarket, true)
            thisObject.filters.market.list.set(true)
            /*
            For each dependency declared at the curatedDependencyNodeArray, we will initialize a DataSet as part of this initialization process.
            */
            let alreadyCalledBack = false
            let addCount = 0
            let skipCount = 0

            /* 
            The current curatedDependencyNodeArray that we have includes all the dependencies daclared in the Data Mine | Trading Mine | Learning Mine
            process dependencies, minus the ones without reference parent, meaning that references Data Mines that are
            not present at the workspace. From all the remaining dependencies there will be others that we need to 
            filter out, and they are the ones which the user does not have a data product anywhere on the network where
            this task is running, that is storing the data associated to this dependency. The way we use to filter this
            out is by analizyng the response of the initialization call to the DataSet module. If it did not fail but
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

            function addDataSets(exchange, market) {
                for (let i = 0; i < thisObject.curatedDependencyNodeArray.length; i++) {

                    if (receivedDependencyFilters !== undefined) {
                        /*
                        If we received a Dependency Filter from the UI, we will make these excta checks
                        before instantiating a Data Set Module.
                        */
                        if (exchange === defaultExchange && market === defautMarket) {

                        }

                        // Validaciones para llegar hasta el producto: datasetModule.node.parentNode.config.singularVariableName
                        // Que el producto este en el filtro
                        // Necesito un filtro exchange mercado producto que venga desde la UI
                        // Para eso la funcion que los arma tiene que saber cual es el default Exchange y el Defautl market.
                        // Quizas vuele el concepto de filtro de chart , de market y de exchange separados

                        // dentro del dataset que se valide que el network node que llega hasta el producto pase por el market y exchange

                        if (thisObject.filters.exchange.markets.get(exchange + '-' + market) === true) {
                            addDataSets(exchange, market)
                        }
                    }


                    
                    let dataSetModule = TS.projects.superalgos.processModules.dataset.newSuperalgosProcessModulesDataset(processIndex)
                    dataSetModule.initialize(exchange, market, thisObject.curatedDependencyNodeArray[i], onInitilized)

                    function onInitilized(err, wasInitialized) {

                        if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> err = " + JSON.stringify(err))

                            alreadyCalledBack = true
                            callBackFunction(err)
                            return
                        }

                        if (wasInitialized === true) {
                            addCount++
                            newNodeArray.push(thisObject.curatedDependencyNodeArray[i])
                            addDataSet()
                        } else {
                            skipCount++
                        }
                        checkIfWeAreDone()
                    }

                    function addDataSet() {
                        thisObject.dataSetsModulesArray.push(dataSetModule)
                    }

                    function checkIfWeAreDone() {
                        if (addCount + skipCount === thisObject.curatedDependencyNodeArray.length) {
                            if (alreadyCalledBack === false) {
                                alreadyCalledBack = true
                                thisObject.curatedDependencyNodeArray = newNodeArray
                                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
                                return
                            }
                        }
                    }
                }
            }

        } catch (err) {
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack)
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
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
        bot = undefined
    }

    function isItAChartDepenency(timeFrame, product) {
        let key = timeFrame + '-' + product

        return thisObject.filters.chart.products.get(key)
    }
}
