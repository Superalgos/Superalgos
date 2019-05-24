exports.newAzureStorage = function newAzureStorage() {

    let thisObject = {
        readData: readData,
        writeData: writeData,
        createContainer: createContainer,
        deleteContainer: deleteContainer,
        deleteBlob: deleteBlob,
        initialize: initialize
    }

    let storageData;
    let ecosystem;

    return thisObject;

    function initialize(pStorageData, pEcosystem) {

        storageData = pStorageData;
        ecosystem = pEcosystem;
    }

    function readData(pOrg, pPath, pFile, saveAtCache, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> readData -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> readData -> pOrg = " + pOrg); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> readData -> pPath = " + pPath); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> readData -> pFile = " + pFile); }

            let cacheVersion;

            if (storageData !== undefined) {

                cacheVersion = storageData.get(pOrg + '.' + pPath + '.' + pFile);
            }

            if (cacheVersion !== undefined) {

                if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> readData ->  " + pOrg + '.' + pPath + '.' + pFile + " found at cache."); }

                callBackFunction(global.DEFAULT_OK_RESPONSE, cacheVersion);

            } else {

                if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> readData ->  " + pOrg + '.' + pPath + '.' + pFile + " NOT found at cache."); }

                let connectionDetails = getConnectionDetails(pOrg, pPath, pFile);
                connectionDetails.blobService.getBlobToText(connectionDetails.container, connectionDetails.filePath, onFileReceived);

                function onFileReceived(err, text, response) {

                    try {

                        if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> readData -> onFileReceived -> Entering function."); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> readData -> onFileReceived -> err = " + JSON.stringify(err)); }
                        if (LOG_FILE_CONTENT === true) { console.log("[INFO] Azure Storage -> readData -> onFileReceived -> response = " + JSON.stringify(response)); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> readData -> onFileReceived -> pOrg = " + pOrg); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> readData -> onFileReceived -> pPath = " + pPath); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> readData -> onFileReceived -> pFile = " + pFile); }

                        if (saveAtCache === true) {

                            storageData.set(pOrg + '.' + pPath + '.' + pFile, text);

                        }

                        if (err !== null || text === null) {

                            if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Azure Storage -> readData -> onFileReceived -> Error Received from Storage Library. "); }
                            if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Azure Storage -> readData -> onFileReceived -> err = " + JSON.stringify(err)); }
                            if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Azure Storage -> readData -> onFileReceived -> Returning an empty JSON object string. "); }

                            let response = {
                                result: global.DEFAULT_FAIL_RESPONSE.result,
                                message: global.DEFAULT_FAIL_RESPONSE.message,
                                code: 'FileNotFound'
                            }

                            callBackFunction(response);
                            return;

                        }

                        callBackFunction(global.DEFAULT_OK_RESPONSE, text);

                    } catch (err) {
                        console.log("[ERROR] Azure Storage -> readData -> onFileReceived -> err.message = " + err.message);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }
            }

        } catch (err) {
            console.log("[ERROR] Azure Storage -> readData -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    // TODO remove this functions and resolve them inside the Teams module.
    function writeData(pOrg, pPath, pFile, pFileContent, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> writeData -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> writeData -> pOrg = " + pOrg); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> writeData -> pPath = " + pPath); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> writeData -> pFile = " + pFile); }

            let blobText = pFileContent.toString();
            let connectionDetails = getConnectionDetails(pOrg, pPath, pFile);
            connectionDetails.blobService.createBlockBlobFromText(connectionDetails.container, connectionDetails.filePath, blobText, onFileCreated);

            function onFileCreated(err, text, response) {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> writeData -> onFileCreated -> Entering function."); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> writeData -> onFileCreated -> err = " + JSON.stringify(err)); }
                    if (LOG_FILE_CONTENT === true) { console.log("[INFO] Azure Storage -> writeData -> onFileCreated -> response = " + JSON.stringify(response)); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> writeData -> onFileCreated -> pOrg = " + pOrg); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> writeData -> onFileCreated -> pPath = " + pPath); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> writeData -> onFileCreated -> pFile = " + pFile); }

                    if (err !== null || text === null) {

                        if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Azure Storage -> writeData -> onFileCreated -> Error Received from Storage Library. "); }
                        if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Azure Storage -> writeData -> onFileCreated -> err = " + JSON.stringify(err)); }

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;

                    }

                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } catch (err) {
                    console.log("[ERROR] Azure Storage -> writeData -> onFileCreated -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            console.log("[ERROR] Azure Storage -> writeData -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function deleteBlob(pOrg, pPath, pFile, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> deleteBlob -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> deleteBlob -> pOrg = " + pOrg); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> deleteBlob -> pPath = " + pPath); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> deleteBlob -> pFile = " + pFile); }

            let connectionDetails = getConnectionDetails(pOrg, pPath, pFile);
            connectionDetails.blobService.deleteBlob(connectionDetails.container, connectionDetails.filePath, onBlobDeleted);

            function onBlobDeleted(err, text, response) {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> deleteBlob -> onBlobDeleted -> Entering function."); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> deleteBlob -> onBlobDeleted -> err = " + JSON.stringify(err)); }
                    if (LOG_FILE_CONTENT === true) { console.log("[INFO] Azure Storage -> deleteBlob -> onBlobDeleted -> response = " + JSON.stringify(response)); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> deleteBlob -> onBlobDeleted -> pOrg = " + pOrg); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> deleteBlob -> onBlobDeleted -> pPath = " + pPath); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> deleteBlob -> onBlobDeleted -> pFile = " + pFile); }

                    if (err !== null || text === null) {

                        if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Azure Storage -> deleteBlob -> onBlobDeleted -> Error Received from Storage Library. "); }
                        if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Azure Storage -> deleteBlob -> onBlobDeleted -> err = " + JSON.stringify(err)); }

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;

                    }

                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } catch (err) {
                    console.log("[ERROR] Azure Storage -> deleteBlob -> onBlobDeleted -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            console.log("[ERROR] Azure Storage -> deleteBlob -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createContainer(pContainerName, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> createContainer -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> createContainer -> pContainerName = " + pContainerName); }

            let containerName = pContainerName.toLowerCase();

            let storage = require('azure-storage');
            let connectionString = process.env.STORAGE_CONNECTION_STRING;
            let blobService = storage.createBlobService(connectionString);
            blobService.createContainer(containerName, onContainerCreated);

            function onContainerCreated(err) {

                if (err) {

                    if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Azure Storage -> createContainer -> onContainerCreated -> Error Received from Storage Library. "); }
                    if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Azure Storage -> createContainer -> onContainerCreated -> err = " + JSON.stringify(err)); }


                    /* ContainerAlreadyExists check */

                    if (JSON.stringify(err).indexOf("ContainerAlreadyExists") > 0) {

                        let err = {
                            resutl: global.CUSTOM_FAIL_RESPONSE.result,
                            message: "ContainerAlreadyExists"
                        };

                        callBackFunction(err);
                        return;

                    } else {

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;
                    }
                }

                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return;
            }

        } catch (err) {
            console.log("[ERROR] Azure Storage -> createContainer -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function deleteContainer(pContainerName, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> deleteContainer -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Azure Storage -> deleteContainer -> pContainerName = " + pContainerName); }

            let containerName = pContainerName.toLowerCase();

            let storage = require('azure-storage');
            let connectionString = process.env.STORAGE_CONNECTION_STRING;
            let blobService = storage.createBlobService(connectionString);
            blobService.deleteContainer(containerName, onContainerDeleted);

            function onContainerDeleted(err) {

                if (err) {

                    if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Azure Storage -> deleteContainer -> onContainerDeleted -> Error Received from Storage Library. "); }
                    if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Azure Storage -> deleteContainer -> onContainerDeleted -> err = " + JSON.stringify(err)); }


                    /* ContainerAlreadyExists check */

                    if (JSON.stringify(err).indexOf("ContainerNotFound") > 0) {

                        let err = {
                            resutl: global.CUSTOM_FAIL_RESPONSE.result,
                            message: "ContainerNotFound"
                        };

                        callBackFunction(err);
                        return;

                    } else {

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;
                    }
                }

                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return;
            }

        } catch (err) {
            console.log("[ERROR] Azure Storage -> deleteContainer -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getConnectionDetails(pOrg, pPath, pFile){
        let filePath, container, host, accessKey, teamCodeName;

        if (pOrg === undefined) {
            /* This is used when the requests come from the browser, for background compatibility.  */
            filePath = pPath;
            teamCodeName = pFile;
        } else {
            /* This is used for internal requests within AAWeb, for background compatibility. */
            filePath = pOrg + "/" + pPath + "/" + pFile;
            teamCodeName = pOrg.split("/")[0];
        }

        // TODO Temporary looking on on the server side for the team connection, so the client calls are not modified.
        for (let i = 0; i < ecosystem.devTeams.length; i++) {
            const devTeam = ecosystem.devTeams[i];
            if(devTeam.codeName.toLowerCase() === teamCodeName.toLowerCase()){
                host = devTeam.host.storage;
                accessKey = devTeam.host.accessKey;
                container = devTeam.host.container;
                break;
            }
        }

        for (let i = 0; i < ecosystem.hosts.length; i++) {
            const devTeam = ecosystem.hosts[i];
            if(devTeam.codeName.toLowerCase() === teamCodeName.toLowerCase()){
                host = devTeam.host.storage;
                accessKey = devTeam.host.accessKey;
                container = devTeam.host.container;
                break;
            }
        }

        if(host === undefined){
            console.log("[ERROR] Azure Storage -> readData -> Host has not been found for team: " + teamCodeName );
        }

        if(accessKey === undefined){
            console.log("[ERROR] Azure Storage -> readData -> Access key has not been found for team: " + teamCodeName);
        }

        let storage = require('azure-storage');
        let blobService = storage.createBlobServiceWithSas(host, accessKey);
        return {
            blobService,
            container,
            filePath
        }
    }
}
