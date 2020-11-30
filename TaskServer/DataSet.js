exports.newDataSet = function (processIndex, logger) {

    const MODULE_NAME = "Dataset";

    let thisObject = {
        node: undefined,
        networkNode: undefined,
        initialize: initialize,
        finalize: finalize,
        getTextFile: getTextFile,
        createTextFile: createTextFile
    };

    /* Storage account to be used here. */

    const FILE_STORAGE = require('./FileStorage.js');
    let fileStorage

    return thisObject;

    function initialize(dataDependency, callBackFunction) {

        try {
            thisObject.node = dataDependency.referenceParent;
            logger.fileName = MODULE_NAME

            /* Some very basic validations that we have all the information needed. */
            if (thisObject.node === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Data Dependency without Reference Parent -> dataDependency = " + JSON.stringify(dataDependency));
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            logger.fileName = MODULE_NAME + "." + thisObject.node.type + "." + thisObject.node.name + "." + thisObject.node.id;

            if (thisObject.node.config.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Dataset witn no codeName defined -> Product Dataset = " + JSON.stringify(thisObject.node));
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Dataset not attached to a Product Definition -> Dataset = " + JSON.stringify(thisObject.node));
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.config.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Product Definition witn no codeName defined -> Product Definition = " + JSON.stringify(thisObject.node.parentNode));
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Product Definition not attached to a Bot -> Product Definition = " + JSON.stringify(thisObject.node.parentNode));
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode.config.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Bot witn no codeName defined. Bot = " + JSON.stringify(thisObject.node.parentNode.parentNode));
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Bot not attached to a Data Mine or Trading Mine. Bot = " + JSON.stringify(thisObject.node.parentNode.parentNode));
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode.parentNode.config.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Data Mine witn no codeName defined. Data Mine = " + JSON.stringify(thisObject.node.parentNode.parentNode.parentNode));
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                return
            }

            /* Now we will see where do we need to fetch this data from. */
            let network = TS.projects.superalgos.globals.taskConstants.NETWORK_NODE
            let datasetProductDefinition = thisObject.node.parentNode

            let nodeArray = TS.projects.superalgos.utilities.nodeFunctions.nodeMeshToPathArray(network, datasetProductDefinition.id)
            let networkNode = TS.projects.superalgos.utilities.nodeFunctions.findNodeInNodeArray(nodeArray, 'Network Node')

            if (networkNode === undefined) {
                logger.write(MODULE_NAME, "[WARN] initialize -> Network Node not found.")
                logger.write(MODULE_NAME, "[WARN] initialize -> Initialization Failed because we could not find where the data of this dataset is located within the network. Check the logs for more info.");
                logger.write(MODULE_NAME, "[WARN] initialize -> Could not find where " + datasetProductDefinition.name + " for " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "/" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName + " is stored within the network.");
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE, false);
                return
            }

            /* We found where the data is located on the network. */
            logger.write(MODULE_NAME, "[INFO] initialize -> Retrieving data from " + networkNode.name + "  -> host = " + networkNode.config.host + ' -> port = ' + networkNode.config.webPort + '.')

            fileStorage = FILE_STORAGE.newFileStorage(logger, networkNode.config.host, networkNode.config.webPort);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE, true);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function finalize() {
        fileStorage = undefined
        thisObject.networkNode = undefined
        bot = undefined
        thisObject = undefined
    }

    function getTextFile(pFolderPath, pFileName, callBackFunction) {

        try {
            let mine = thisObject.node.parentNode.parentNode.parentNode.config.codeName
            let mineType = thisObject.node.parentNode.parentNode.parentNode.type.replace(' ', '-')
            let project = thisObject.node.parentNode.parentNode.parentNode.project
            let botCodeName = thisObject.node.parentNode.parentNode.config.codeName

            let filePathRoot = 'Project/' + project + "/" + mineType + "/" + mine + "/" + botCodeName + '/' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + "/" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
            let filePath = filePathRoot + "/Output/" + pFolderPath;
            filePath += '/' + pFileName

            fileStorage.getTextFile(filePath, onFileReceived);

            function onFileReceived(err, text) {
                callBackFunction(err, text);
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] 'getTextFile' -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createTextFile(pFolderPath, pFileName, pFileContent, callBackFunction) {

        try {

            logger.write(MODULE_NAME, "[INFO] createTextFile -> pFolderPath = " + pFolderPath)
            logger.write(MODULE_NAME, "[INFO] createTextFile -> pFileName = " + pFileName)

            let ownerId = thisObject.node.dataMine + "-" + thisObject.node.bot
            let botId = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName

            if (ownerId !== botId) {

                let customErr = {
                    result: TS.projects.superalgos.globals.standardResponses.CUSTOM_FAIL_RESPONSE.result,
                    message: "Only bots owners of a Data Set can create text files on them."
                };
                logger.write(MODULE_NAME, "[ERROR] save -> customErr = " + customErr.message);
                callBackFunction(customErr);
                return;
            }

            let filePathRoot = 'Project/' + thisObject.node.project + "/" + thisObject.node.mineType + "/" + thisObject.node.dataMine + "/" + thisObject.node.bot + '/' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + "/" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "-" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
            let filePath = filePathRoot + "/Output/" + pFolderPath + '/' + pFileName;

            fileStorage.createTextFile(filePath, pFileContent, onFileCreated);

            function onFileCreated(err) {
                callBackFunction(err);
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] 'createTextFile' -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }
};
