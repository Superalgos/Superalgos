exports.newFoundationsProcessModulesDataset = function (processIndex) {
    /*
    This module represents a Dataset at a certain location on the 
    network, and it is able to load a file from that dataset or 
    write one into it.
    */
    const MODULE_NAME = "Dataset";

    let thisObject = {
        node: undefined,
        lanNetworkNode: undefined,
        exchange: undefined,
        market: undefined,
        product: undefined,
        initialize: initialize,
        finalize: finalize,
        getTextFile: getTextFile,
        createTextFile: createTextFile
    };

    /* Storage account to be used here. */
    let fileStorage

    return thisObject;

    function initialize(exchange, market, dataDependency, callBackFunction) {

        try {
            thisObject.node = dataDependency.referenceParent;
            thisObject.exchange = exchange
            thisObject.market = market

            /* Some very basic validations that we have all the information needed. */
            if (thisObject.node === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> Data Dependency without Reference Parent -> dataDependency = " + JSON.stringify(dataDependency));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.config.codeName === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> Dataset with no codeName defined -> Product Dataset = " + JSON.stringify(thisObject.node));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> Dataset not attached to a Product Definition -> Dataset = " + JSON.stringify(thisObject.node));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.config.codeName === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> Product Definition with no codeName defined -> Product Definition = " + JSON.stringify(thisObject.node.parentNode));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> Product Definition not attached to a Bot -> Product Definition = " + JSON.stringify(thisObject.node.parentNode));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode.config.codeName === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> Bot with no codeName defined. Bot = " + JSON.stringify(thisObject.node.parentNode.parentNode));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode.parentNode === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> Bot not attached to a Data Mine, Trading Mine, or Portfolio Mine. Bot = " + JSON.stringify(thisObject.node.parentNode.parentNode));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode.parentNode.config.codeName === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> Data Mine with no codeName defined. Data Mine = " + JSON.stringify(thisObject.node.parentNode.parentNode.parentNode));
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            /* Now we will see where do we need to fetch this data from. */
            let network = TS.projects.foundations.globals.taskConstants.NETWORK_NODE
            let productDefinition = thisObject.node.parentNode
            thisObject.product = productDefinition.config.singularVariableName

            /* 
            We will find the lanNetworkNode that leads to this Product Definition 
            and is related to this exchange and market. 
            */
            let lanNetworkNode = fincNetworkNode(network, productDefinition, thisObject.exchange, thisObject.market)

            if (lanNetworkNode === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[WARN] initialize -> Network Node not found.")
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[WARN] initialize -> Initialization Failed because we could not find where the data of this dataset is located within the network. Check the logs for more info.");
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[WARN] initialize -> Could not find where " + productDefinition.name + " for " + thisObject.exchange + " " + thisObject.market + " is stored within the network.");
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE, false);
                return
            }

            /* We found where the data is located on the network. */
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] initialize -> Retrieving data from " + lanNetworkNode.name + "  -> host = " + lanNetworkNode.config.host + ' -> port = ' + lanNetworkNode.config.webPort + '.')

            fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex, lanNetworkNode.config.host, lanNetworkNode.config.webPort);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE, true);

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function finalize() {
        fileStorage = undefined
        thisObject.lanNetworkNode = undefined
        thisObject.exchange = undefined
        thisObject.market = undefined
        bot = undefined
        thisObject = undefined
    }

    function getTextFile(pFolderPath, pFileName, callBackFunction) {

        try {
            let mine = thisObject.node.parentNode.parentNode.parentNode.config.codeName
            let mineType = thisObject.node.parentNode.parentNode.parentNode.type.replace(' ', '-')
            let project = thisObject.node.parentNode.parentNode.parentNode.project
            let botCodeName = thisObject.node.parentNode.parentNode.config.codeName

            let filePathRoot = 'Project/' + project + "/" + mineType + "/" + mine + "/" + botCodeName + '/' + thisObject.exchange + "/" + thisObject.market
            let filePath = filePathRoot + "/Output/" + pFolderPath;
            filePath += '/' + pFileName

            fileStorage.getTextFile(filePath, onFileReceived);

            function onFileReceived(err, text) {
                callBackFunction(err, text);
            }
        }
        catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] 'getTextFile' -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createTextFile(pFolderPath, pFileName, pFileContent, callBackFunction) {

        try {

            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] createTextFile -> pFolderPath = " + pFolderPath)
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] createTextFile -> pFileName = " + pFileName)

            let ownerId = thisObject.node.dataMine + "-" + thisObject.node.bot
            let botId = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName

            if (ownerId !== botId) {

                let customErr = {
                    result: TS.projects.foundations.globals.standardResponses.CUSTOM_FAIL_RESPONSE.result,
                    message: "Only bots owners of a Data Set can create text files on them."
                };
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] save -> customErr = " + customErr.message);
                callBackFunction(customErr);
                return;
            }

            let filePathRoot = 'Project/' + thisObject.node.project + "/" + thisObject.node.mineType + "/" + thisObject.node.dataMine + "/" + thisObject.node.bot + '/' + thisObject.exchange + "/" + thisObject.market
            let filePath = filePathRoot + "/Output/" + pFolderPath + '/' + pFileName;

            fileStorage.createTextFile(filePath, pFileContent, onFileCreated);

            function onFileCreated(err) {
                callBackFunction(err);
            }
        }
        catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] 'createTextFile' -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function fincNetworkNode(network, productDefinition, exchange, market) {
        /*
        
        The problem that we need to solve here is the following:

        A. We are interested in a particular Exchange and Market.
        B. We have the Network we received from the UI where the user ran the Task.
        C. We have the Product Definition that is the parent node of the Data Set represented by this object.
        D. This Product Definition is referenced by one or more Data Products nodes at some branch of the LAN Network Hierarchy.
        E. We need to find the right Data Product node, the one who is itself a descendent of the Market Data Products
        node that is referencing the market and exchange that we have as a parameter of this function.

        So, the strategy we will implement is the following:

        1. We will scan all the branches of the Network received from the UI.
        2. Once we find a Market Data Products, Market Trading Products, Market Portfolio Products or Market Learning Products we will check
        that they are referencing the market and exchange we need, other wise we ignore them and continue
        with the scanning.
        3. Once found, we will go into their own branches and find a path until the Product Definition we need to reach.
        4. Once reached, we will know which Network Node is on the full path from the Network to the Product Definition and
        we solved the problem.
        
        */
        let found = false
        let lanNetworkNode
        let splittedMarket = market.split('-')
        let baseAsset = splittedMarket[0]
        let quotedAsset = splittedMarket[1]

        scanNodeMesh(network)

        if (found === true) {
            return lanNetworkNode
        } else {
            return
        }

        function scanNodeMesh(startingNode) {
            if (startingNode === undefined) { return }

            let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(startingNode.project + '-' + startingNode.type)
            if (schemaDocument === undefined) { return }

            if (startingNode.id === productDefinition.id) {
                /*
                We reached the point that we found a path to the Product Definition. 
                Now we know that the last network Node is the node that has the correct
                path.
                */
                found = true
                return
            }

            if (startingNode.type === 'LAN Network Node') {
                /*
                We will store the Network Node here so that if we find the right path
                we can know from which Network Node it going through.
                */
                lanNetworkNode = startingNode
            }

            if (
                startingNode.type === 'Market Data Products'        ||
                startingNode.type === 'Market Trading Products'     ||
                startingNode.type === 'Market Portfolio Products'   ||
                startingNode.type === 'Market Learning Products'
            ) {
                /*
                We will check that this guy is referencing the right market and the 
                market is a descendant of the right exchange. Otherwise we wont process
                their children.
                */
                if (startingNode.referenceParent === undefined) {
                    return
                }
                if (startingNode.referenceParent.baseAsset === undefined) {
                    return
                }
                if (startingNode.referenceParent.quotedAsset === undefined) {
                    return
                }
                if (startingNode.referenceParent.baseAsset.referenceParent === undefined) {
                    return
                }
                if (startingNode.referenceParent.quotedAsset.referenceParent === undefined) {
                    return
                }
                if (startingNode.referenceParent.baseAsset.referenceParent.config.codeName !== baseAsset) {
                    return
                }
                if (startingNode.referenceParent.quotedAsset.referenceParent.config.codeName !== quotedAsset) {
                    return
                }
                if (startingNode.referenceParent.parentNode === undefined) {
                    return
                }
                if (startingNode.referenceParent.parentNode.parentNode === undefined) {
                    return
                }
                if (startingNode.referenceParent.parentNode.parentNode.config.codeName !== exchange) {
                    return
                }
            }

            /* We scan through this node children */
            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {
                            if (found !== true) {
                                scanNodeMesh(startingNode[property.name])
                            }
                        }
                            break
                        case 'array': {
                            let startingNodePropertyArray = startingNode[property.name]
                            if (startingNodePropertyArray !== undefined) {
                                for (let m = 0; m < startingNodePropertyArray.length; m++) {
                                    if (found !== true) {
                                        scanNodeMesh(startingNodePropertyArray[m])
                                    }
                                }
                            }
                            break
                        }
                    }
                }
            }
            /* We scan parents nodes. */
            if (startingNode.parentNode !== undefined) {
                if (found !== true) {
                    scanNodeMesh(startingNode.parentNode)
                }
            }
            /* We scan reference parents too. */
            if (startingNode.referenceParent !== undefined) {
                if (found !== true) {
                    scanNodeMesh(startingNode.referenceParent)
                }
            }
        }
    }
};
