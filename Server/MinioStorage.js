exports.newMinioStorage = function newMinioStorage() {

    let thisObject = {
        readData: readData,
        writeData: writeData,
        createContainer: createContainer,
        deleteContainer: deleteContainer,
        deleteBlob: deleteBlob,
        initialize: initialize
    }

    let storageData;
    let serverConfig;

    let Minio = require('minio');
    let minioClient;

    return thisObject;

    function initialize(pStorageData, pServerConfig) {

        storageData = pStorageData;
        serverConfig = pServerConfig;

        minioClient = new Minio.Client({
            endPoint: process.env.MINIO_END_POINT,
            port: JSON.parse(process.env.MINIO_PORT),
            useSSL: JSON.parse(process.env.MINIO_USE_SSL),
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY
        })
    }

    function readData(pParam1, pParam2, pParam3, saveAtCache, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> pParam1 = " + pParam1); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> pParam2 = " + pParam2); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> pParam3 = " + pParam3); }

            let cacheVersion;

            if (storageData !== undefined) {

                cacheVersion = storageData.get(pParam1 + '.' + pParam2 + '.' + pParam3);
            }

            if (cacheVersion !== undefined) {

                if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData ->  " + pParam1 + '.' + pParam2 + '.' + pParam3 + " found at cache."); }

                callBackFunction(global.DEFAULT_OK_RESPONSE, cacheVersion);

            } else {

                if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData ->  " + pParam1 + '.' + pParam2 + '.' + pParam3 + " NOT found at cache."); }

                let bucketName = 'aaplatform';
                let textFilename;

                if (pParam1 === undefined) {

                    /* This is used when the requests come from the browser, for background compatibility.  */

                    bucketName = pParam3;
                    textFilename = pParam2.substring(pParam2.indexOf("/") + 1, pParam2.length);

                } else {

                    /* This is used for internal requests within AAWeb, for background compatibility. */

                    bucketName = 'aaplatform';
                    textFilename = pParam1 + "/" + pParam2 + "/" + pParam3;
                }

                minioClient.getObject(bucketName, textFilename, function (err, dataStream) {
                    let data = '';

                    if (err) {
                        onFileReceived(err, null, "Error retrieving file " + textFilename + " from bucket " + bucketName);
                        return
                    }
                    dataStream.on('data', function (chunk) {
                        data += chunk
                    })
                    dataStream.on('end', function () {
                        onFileReceived(null, data, "Data retrieved.");
                    })
                    dataStream.on('error', function (err) {
                        onFileReceived(err, null, "Error on data stream while retrieving file " + textFilename + " from bucket " + bucketName);
                    })
                })

                function onFileReceived(err, text, response) {

                    try {

                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> Entering function."); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> err = " + JSON.stringify(err)); }
                        if (LOG_FILE_CONTENT === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> response = " + JSON.stringify(response)); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> pParam1 = " + pParam1); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> pParam2 = " + pParam2); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> pParam3 = " + pParam3); }

                        if (saveAtCache === true) {

                            storageData.set(pParam1 + '.' + pParam2 + '.' + pParam3, text);

                        }

                        if (err !== null || text === null) {

                            if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> readData -> onFileReceived -> Error Received from Storage Library. "); }
                            if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> readData -> onFileReceived -> err = " + JSON.stringify(err)); }
                            if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> readData -> onFileReceived -> Returning an empty JSON object string. "); }

                            if (err.code === 'NoSuchKey') {

                                let customErr = {
                                    result: GLOBAL.CUSTOM_FAIL_RESPONSE.result,
                                    message: 'FileNotFound',
                                    code: 'FileNotFound'
                                }

                                callBackFunction(customErr);
                                return;
                            }

                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;

                        }

                        callBackFunction(global.DEFAULT_OK_RESPONSE, text);

                    } catch (err) {
                        console.log("[ERROR] Storage -> readData -> onFileReceived -> err.message = " + err.message);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }
            }

        } catch (err) {
            console.log("[ERROR] Storage -> readData -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function writeData(pParam1, pParam2, pParam3, pFileContent, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> pParam1 = " + pParam1); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> pParam2 = " + pParam2); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> pParam3 = " + pParam3); }

            let bucketName = 'aaplatform';
            let text = pFileContent.toString();
            let textFilename = pParam1 + "/" + pParam2 + "/" + pParam3;

            minioClient.putObject(bucketName, textFilename, text, 'text/plain', onFileCreated)

            function onFileCreated(err, text, response) {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> onFileCreated -> Entering function."); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> onFileCreated -> err = " + JSON.stringify(err)); }
                    if (LOG_FILE_CONTENT === true) { console.log("[INFO] Storage -> writeData -> onFileCreated -> response = " + JSON.stringify(response)); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> onFileCreated -> pParam1 = " + pParam1); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> onFileCreated -> pParam2 = " + pParam2); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> onFileCreated -> pParam3 = " + pParam3); }

                    if (err !== null || text === null) {

                        if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> writeData -> onFileCreated -> Error Received from Storage Library. "); }
                        if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> writeData -> onFileCreated -> err = " + JSON.stringify(err)); }

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;

                    }

                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } catch (err) {
                    console.log("[ERROR] Storage -> writeData -> onFileCreated -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            console.log("[ERROR] Storage -> writeData -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function deleteBlob(pParam1, pParam2, pParam3, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> pParam1 = " + pParam1); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> pParam2 = " + pParam2); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> pParam3 = " + pParam3); }

            let bucketName = 'aaplatform';
            let textFilename = pParam1 + "/" + pParam2 + "/" + pParam3;

            minioClient.removeObject(bucketName, textFilename, onBlobDeleted)

            function onBlobDeleted(err, text, response) {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> onBlobDeleted -> Entering function."); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> onBlobDeleted -> err = " + JSON.stringify(err)); }
                    if (LOG_FILE_CONTENT === true) { console.log("[INFO] Storage -> deleteBlob -> onBlobDeleted -> response = " + JSON.stringify(response)); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> onBlobDeleted -> pParam1 = " + pParam1); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> onBlobDeleted -> pParam2 = " + pParam2); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> onBlobDeleted -> pParam3 = " + pParam3); }

                    if (err !== null || text === null) {

                        if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> deleteBlob -> onBlobDeleted -> Error Received from Storage Library. "); }
                        if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> deleteBlob -> onBlobDeleted -> err = " + JSON.stringify(err)); }

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;

                    }

                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } catch (err) {
                    console.log("[ERROR] Storage -> deleteBlob -> onBlobDeleted -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            console.log("[ERROR] Storage -> deleteBlob -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createContainer(pContainerName, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> createContainer -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> createContainer -> pContainerName = " + pContainerName); }

            let containerName = pContainerName.toLowerCase();

            minioClient.makeBucket(containerName, "", onContainerCreated)

            function onContainerCreated(err) {

                if (err) {

                    if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> createContainer -> onContainerCreated -> Error Received from Storage Library. "); }
                    if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> createContainer -> onContainerCreated -> err = " + JSON.stringify(err)); }


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

                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }

                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return;
            }

        } catch (err) {
            console.log("[ERROR] Storage -> createContainer -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function deleteContainer(pContainerName, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteContainer -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteContainer -> pContainerName = " + pContainerName); }

            let containerName = pContainerName.toLowerCase();

            minioClient.removeBucket(containerName, onContainerDeleted)

            function onContainerDeleted(err) {

                if (err) {

                    if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> deleteContainer -> onContainerDeleted -> Error Received from Storage Library. "); }
                    if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> deleteContainer -> onContainerDeleted -> err = " + JSON.stringify(err)); }


                    /* ContainerAlreadyExists check */

                    if (err.code === "NoSuchBucket") {

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

                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }

                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return;
            }

        } catch (err) {
            console.log("[ERROR] Storage -> deleteContainer -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
}
